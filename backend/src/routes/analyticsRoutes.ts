import express from 'express';
import {
  getDashboardStats,
  getEquipmentStats,
  getMaintenanceStats,
  getAllHospitalStats,
  getComplianceStats,
  getPlatformAnalytics,
} from '../controllers/analyticsController';
import { verifyToken, requireRole } from '../middleware/auth';

const router = express.Router();

router.use(verifyToken);

router.get('/dashboard', getDashboardStats);
router.get('/equipment', getEquipmentStats);
router.get('/maintenance', getMaintenanceStats);
router.get('/compliance', getComplianceStats);

// Super admin only
router.get('/hospitals', requireRole(['super_admin']), getAllHospitalStats);
router.get('/platform', requireRole(['super_admin']), getPlatformAnalytics);

export default router;
