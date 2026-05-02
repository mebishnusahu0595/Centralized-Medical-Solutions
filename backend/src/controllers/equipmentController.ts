import { Request, Response, NextFunction } from 'express';
import Equipment from '../models/Equipment';
import { asyncHandler } from '../utils/asyncWrapper';
import { AppError } from '../utils/AppError';
import { generateQRCode } from '../utils/qrcode';
import { calculateNextMaintenanceDate } from '../utils/dateUtils';
import { logAction } from '../utils/auditLogger';

// @desc    Get all equipment
// @route   GET /api/v1/equipment
// @access  Super Admin / Hospital Admin / Engineer / Staff
export const getEquipments = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let query: any = {};

  if (req.user?.role !== 'super_admin') {
    query.hospitalId = req.user?.hospitalId;
  } else if (req.query.hospitalId) {
    query.hospitalId = req.query.hospitalId;
  }

  // Allow filtering
  if (req.query.status) query.status = req.query.status;
  if (req.query.category) query.category = req.query.category;
  if (req.query.assignedEngineer) query.assignedEngineer = req.query.assignedEngineer;

  const equipments = await Equipment.find(query).populate('assignedEngineer', 'name email').sort('-createdAt');

  res.status(200).json({
    success: true,
    count: equipments.length,
    data: equipments,
  });
});

// @desc    Add new equipment
// @route   POST /api/v1/equipment
// @access  Super Admin / Hospital Admin
export const createEquipment = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let hospitalId = req.body.hospitalId;
  if (req.user?.role !== 'super_admin') {
    hospitalId = req.user?.hospitalId;
  }

  if (!hospitalId) {
    return next(new AppError('Hospital ID is required', 400));
  }

  const equipmentData = { ...req.body, hospitalId, addedBy: req.user?._id };

  // Calculate next maintenance date
  if (equipmentData.lastMaintenanceDate && equipmentData.maintenanceFrequency) {
    equipmentData.nextMaintenanceDate = calculateNextMaintenanceDate(
      new Date(equipmentData.lastMaintenanceDate),
      equipmentData.maintenanceFrequency
    );
  }

  const equipment = new Equipment(equipmentData);

  // Generate QR Code
  const qrData = {
    equipmentId: equipment._id,
    hospitalId: equipment.hospitalId,
    name: equipment.name,
    equipmentCode: equipment.equipmentCode,
  };
  
  equipment.qrCode = await generateQRCode(qrData);
  await equipment.save();

  await logAction(req, 'CREATE', 'Equipment', equipment._id.toString(), { name: equipment.name });

  res.status(201).json({
    success: true,
    data: equipment,
  });
});

// @desc    Get single equipment
// @route   GET /api/v1/equipment/:id
// @access  Protected
export const getEquipment = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const equipment = await Equipment.findById(req.params.id)
    .populate('assignedEngineer', 'name email phone')
    .populate('addedBy', 'name email');

  if (!equipment) {
    return next(new AppError('Equipment not found', 404));
  }

  if (req.user?.role !== 'super_admin' && equipment.hospitalId.toString() !== req.user?.hospitalId?.toString()) {
    return next(new AppError('Not authorized to access this equipment', 403));
  }

  res.status(200).json({
    success: true,
    data: equipment,
  });
});

// @desc    Update equipment
// @route   PATCH /api/v1/equipment/:id
// @access  Super Admin / Hospital Admin / Engineer
export const updateEquipment = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let equipment = await Equipment.findById(req.params.id);

  if (!equipment) {
    return next(new AppError('Equipment not found', 404));
  }

  if (req.user?.role !== 'super_admin' && equipment.hospitalId.toString() !== req.user?.hospitalId?.toString()) {
    return next(new AppError('Not authorized to update this equipment', 403));
  }

  // Decommissioned logic: No edit allowed
  if (equipment.status === 'decommissioned') {
    return next(new AppError('Decommissioned equipment cannot be edited', 400));
  }

  // Ensure status cannot be changed to decommissioned via update route (should use delete route)
  if (req.body.status === 'decommissioned') {
     return next(new AppError('Please use the decommission endpoint to retire equipment', 400));
  }

  // Engineer can only update status and condition
  if (req.user?.role === 'engineer') {
    const allowedUpdates = ['status', 'condition'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return next(new AppError('Engineers can only update status and condition', 403));
    }
  }

  equipment = await Equipment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!equipment) {
    return next(new AppError('Equipment not found', 404));
  }

  await logAction(req, 'UPDATE', 'Equipment', (equipment as any)._id.toString());

  res.status(200).json({
    success: true,
    data: equipment,
  });
});

// @desc    Decommission equipment
// @route   DELETE /api/v1/equipment/:id
// @access  Super Admin / Hospital Admin
export const deleteEquipment = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const equipment = await Equipment.findById(req.params.id);

  if (!equipment) {
    return next(new AppError('Equipment not found', 404));
  }

  if (req.user?.role !== 'super_admin' && equipment.hospitalId.toString() !== req.user?.hospitalId?.toString()) {
    return next(new AppError('Not authorized to delete this equipment', 403));
  }

  equipment.status = 'decommissioned';
  equipment.isActive = false;
  await equipment.save();

  await logAction(req, 'DELETE', 'Equipment', (equipment as any)._id.toString());

  res.status(200).json({
    success: true,
    data: {},
    message: 'Equipment decommissioned successfully',
  });
});

// @desc    Assign engineer
// @route   PATCH /api/v1/equipment/:id/assign
// @access  Super Admin / Hospital Admin
export const assignEngineer = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { engineerId } = req.body;
  const equipment = await Equipment.findById(req.params.id);

  if (!equipment) {
    return next(new AppError('Equipment not found', 404));
  }

  if (req.user?.role !== 'super_admin' && equipment.hospitalId.toString() !== req.user?.hospitalId?.toString()) {
    return next(new AppError('Not authorized', 403));
  }

  equipment.assignedEngineer = engineerId;
  await equipment.save();

  res.status(200).json({
    success: true,
    data: equipment,
  });
});

// @desc    Get QR code for equipment
// @route   GET /api/v1/equipment/:id/qr
// @access  Protected
export const getEquipmentQR = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const equipment = await Equipment.findById(req.params.id);

  if (!equipment) {
    return next(new AppError('Equipment not found', 404));
  }

  if (req.user?.role !== 'super_admin' && equipment.hospitalId.toString() !== req.user?.hospitalId?.toString()) {
    return next(new AppError('Not authorized', 403));
  }

  res.status(200).json({
    success: true,
    data: {
      qrCode: equipment.qrCode,
    },
  });
});

// @desc    Upload documents for equipment
// @route   POST /api/v1/equipment/:id/documents
// @access  Super Admin / Hospital Admin / Engineer
export const uploadDocuments = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.files || (req.files as any[]).length === 0) {
    return next(new AppError('Please upload a file', 400));
  }

  const equipment = await Equipment.findById(req.params.id);

  if (!equipment) {
    return next(new AppError('Equipment not found', 404));
  }

  if (req.user?.role !== 'super_admin' && equipment.hospitalId.toString() !== req.user?.hospitalId?.toString()) {
    return next(new AppError('Not authorized', 403));
  }

  if (equipment.status === 'decommissioned') {
    return next(new AppError('Cannot upload documents to decommissioned equipment', 400));
  }

  const files = req.files as Express.Multer.File[];
  const newDocs = files.map(file => ({
    name: file.originalname,
    url: `/uploads/${file.filename}`,
    type: file.mimetype,
    uploadedAt: new Date()
  }));

  equipment.documents.push(...newDocs);
  await equipment.save();

  res.status(200).json({
    success: true,
    data: equipment,
  });
});

// @desc    Upload images for equipment
// @route   POST /api/v1/equipment/:id/images
// @access  Super Admin / Hospital Admin / Engineer
export const uploadImages = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.files || (req.files as any[]).length === 0) {
    return next(new AppError('Please upload an image', 400));
  }

  const equipment = await Equipment.findById(req.params.id);

  if (!equipment) {
    return next(new AppError('Equipment not found', 404));
  }

  if (req.user?.role !== 'super_admin' && equipment.hospitalId.toString() !== req.user?.hospitalId?.toString()) {
    return next(new AppError('Not authorized', 403));
  }

  if (equipment.status === 'decommissioned') {
    return next(new AppError('Cannot upload images to decommissioned equipment', 400));
  }

  const files = req.files as Express.Multer.File[];
  
  if (equipment.images.length + files.length > 5) {
     return next(new AppError('Maximum 5 images allowed', 400));
  }

  const newImages = files.map(file => `/uploads/${file.filename}`);
  equipment.images.push(...newImages);
  await equipment.save();

  res.status(200).json({
    success: true,
    data: equipment,
  });
});
