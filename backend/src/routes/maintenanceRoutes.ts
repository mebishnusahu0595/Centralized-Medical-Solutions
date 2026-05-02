import express from 'express';
import {
  getMaintenanceLogs,
  createMaintenanceLog,
  getMaintenanceLog,
  updateMaintenanceLog,
  completeMaintenanceLog,
  getUpcomingMaintenance,
  getMaintenanceCalendar,
} from '../controllers/maintenanceController';
import { verifyToken, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createMaintenanceSchema,
  updateMaintenanceSchema,
  completeMaintenanceSchema,
} from '../validators/maintenanceValidator';

const router = express.Router();

router.use(verifyToken);

router.get('/', getMaintenanceLogs);
router.post('/', requireRole(['super_admin', 'hospital_admin']), validate(createMaintenanceSchema), createMaintenanceLog);
router.get('/upcoming', getUpcomingMaintenance);
router.get('/calendar', getMaintenanceCalendar);
router.get('/:id', getMaintenanceLog);
router.patch('/:id', validate(updateMaintenanceSchema), updateMaintenanceLog);
router.patch('/:id/complete', validate(completeMaintenanceSchema), completeMaintenanceLog);

export default router;
