import express from 'express';
import {
  getHospitals,
  createHospital,
  getHospital,
  updateHospital,
  deleteHospital,
  suspendHospital,
  getHospitalStats,
} from '../controllers/hospitalController';
import { verifyToken, requireRole, enforceHospitalScope } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { uploadImage } from '../middleware/upload';
import {
  createHospitalSchema,
  updateHospitalSchema,
  suspendHospitalSchema,
} from '../validators/hospitalValidator';

const router = express.Router();

router.use(verifyToken);

// Super admin only routes
router.post('/', requireRole(['super_admin']), uploadImage.single('logo'), (req, res, next) => {
  // If data is sent as JSON string in a field (if using FormData with complex objects)
  if (req.body.data && typeof req.body.data === 'string') {
    req.body = JSON.parse(req.body.data);
  }
  next();
}, validate(createHospitalSchema), createHospital);
router.get('/', requireRole(['super_admin']), getHospitals);
router.delete('/:id', requireRole(['super_admin']), deleteHospital);
router.patch('/:id/suspend', requireRole(['super_admin']), suspendHospital);

// Routes for super_admin OR hospital_admin for their own hospital
router.get('/:id', requireRole(['super_admin', 'hospital_admin']), enforceHospitalScope, getHospital);
router.patch('/:id', requireRole(['super_admin', 'hospital_admin']), enforceHospitalScope, uploadImage.single('logo'), (req, res, next) => {
  if (req.body.data && typeof req.body.data === 'string') {
    req.body = JSON.parse(req.body.data);
  }
  next();
}, validate(updateHospitalSchema), updateHospital);
router.get('/:id/stats', requireRole(['super_admin', 'hospital_admin']), enforceHospitalScope, getHospitalStats);

export default router;
