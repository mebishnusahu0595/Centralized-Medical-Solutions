import express from 'express';
import {
  getEquipments,
  createEquipment,
  getEquipment,
  updateEquipment,
  deleteEquipment,
  assignEngineer,
  getEquipmentQR,
  uploadDocuments,
  uploadImages
} from '../controllers/equipmentController';
import { verifyToken, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createEquipmentSchema,
  updateEquipmentSchema,
  assignEngineerSchema,
} from '../validators/equipmentValidator';
import { upload } from '../middleware/upload';

const router = express.Router();

router.use(verifyToken);

router.get('/', getEquipments);
router.post('/', requireRole(['super_admin', 'hospital_admin']), validate(createEquipmentSchema), createEquipment);
router.get('/:id', getEquipment);
router.patch('/:id', requireRole(['super_admin', 'hospital_admin', 'engineer']), validate(updateEquipmentSchema), updateEquipment);
router.delete('/:id', requireRole(['super_admin', 'hospital_admin']), deleteEquipment);

router.post('/:id/documents', requireRole(['super_admin', 'hospital_admin', 'engineer']), upload.array('documents'), uploadDocuments);
router.post('/:id/images', requireRole(['super_admin', 'hospital_admin', 'engineer']), upload.array('images', 5), uploadImages);
router.get('/:id/qr', getEquipmentQR);
router.patch('/:id/assign', requireRole(['super_admin', 'hospital_admin']), validate(assignEngineerSchema), assignEngineer);

export default router;
