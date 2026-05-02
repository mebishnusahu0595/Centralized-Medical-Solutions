import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import Hospital from '../models/Hospital';
import User from '../models/User';
import Equipment from '../models/Equipment';
import { asyncHandler } from '../utils/asyncWrapper';
import { AppError } from '../utils/AppError';

// @desc    Get all hospitals
// @route   GET /api/v1/hospitals
// @access  Super Admin
export const getHospitals = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 10;
  const skip = (page - 1) * limit;

  const hospitals = await Hospital.find().skip(skip).limit(limit).sort('-createdAt');
  const total = await Hospital.countDocuments();

  res.status(200).json({
    success: true,
    count: hospitals.length,
    total,
    page,
    data: hospitals,
  });
});

// @desc    Create a hospital
// @route   POST /api/v1/hospitals
// @access  Super Admin
export const createHospital = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { name, code, address, contactEmail, contactPhone, adminName, adminEmail, adminPassword, subscriptionPlan } = req.body;

  // Check if hospital code exists
  const existingHospital = await Hospital.findOne({ code });
  if (existingHospital) {
    return next(new AppError('Hospital with this code already exists', 400));
  }

  // Check if admin email exists
  const existingUser = await User.findOne({ email: adminEmail });
  if (existingUser) {
    return next(new AppError('User with admin email already exists', 400));
  }

  const hospital = await Hospital.create({
    name,
    code,
    address,
    contactEmail,
    contactPhone,
    subscriptionPlan: subscriptionPlan || 'free',
    createdBy: req.user?._id,
  });

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(adminPassword, salt);

  const admin = await User.create({
    hospitalId: hospital._id,
    name: adminName,
    email: adminEmail,
    passwordHash,
    role: 'hospital_admin',
    createdBy: req.user?._id,
  });

  res.status(201).json({
    success: true,
    data: {
      hospital,
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    },
  });
});

// @desc    Get single hospital
// @route   GET /api/v1/hospitals/:id
// @access  Super Admin / Hospital Admin (own)
export const getHospital = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const hospital = await Hospital.findById(req.params.id);

  if (!hospital) {
    return next(new AppError('Hospital not found', 404));
  }

  res.status(200).json({
    success: true,
    data: hospital,
  });
});

// @desc    Update hospital
// @route   PATCH /api/v1/hospitals/:id
// @access  Super Admin / Hospital Admin (own)
export const updateHospital = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!hospital) {
    return next(new AppError('Hospital not found', 404));
  }

  res.status(200).json({
    success: true,
    data: hospital,
  });
});

// @desc    Soft delete hospital
// @route   DELETE /api/v1/hospitals/:id
// @access  Super Admin
export const deleteHospital = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const hospital = await Hospital.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });

  if (!hospital) {
    return next(new AppError('Hospital not found', 404));
  }

  res.status(200).json({
    success: true,
    data: {},
    message: 'Hospital softly deleted',
  });
});

// @desc    Suspend/unsuspend hospital
// @route   PATCH /api/v1/hospitals/:id/suspend
// @access  Super Admin
export const suspendHospital = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { status } = req.body;
  const hospital = await Hospital.findByIdAndUpdate(req.params.id, { subscriptionStatus: status }, { new: true });

  if (!hospital) {
    return next(new AppError('Hospital not found', 404));
  }

  res.status(200).json({
    success: true,
    data: hospital,
  });
});

// @desc    Get hospital stats
// @route   GET /api/v1/hospitals/:id/stats
// @access  Super Admin / Hospital Admin (own)
export const getHospitalStats = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const hospitalId = req.params.id;

  const equipmentCount = await Equipment.countDocuments({ hospitalId });
  const activeEquipment = await Equipment.countDocuments({ hospitalId, status: 'active' });
  const usersCount = await User.countDocuments({ hospitalId });

  res.status(200).json({
    success: true,
    data: {
      equipmentCount,
      activeEquipment,
      usersCount,
    },
  });
});
