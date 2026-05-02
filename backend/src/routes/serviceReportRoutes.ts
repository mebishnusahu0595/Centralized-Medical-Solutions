import express from 'express';
import {
  getServiceReports,
  createServiceReport,
  getServiceReport,
  updateServiceReport,
  assignServiceReport,
  resolveServiceReport
} from '../controllers/serviceReportController';
import { verifyToken, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createServiceReportSchema,
  updateServiceReportSchema,
  assignServiceReportSchema,
  resolveServiceReportSchema
} from '../validators/serviceReportValidator';

const router = express.Router();

router.use(verifyToken);

router.get('/', getServiceReports);
router.post('/', validate(createServiceReportSchema), createServiceReport);
router.get('/:id', getServiceReport);
router.patch('/:id', validate(updateServiceReportSchema), updateServiceReport);
router.patch('/:id/assign', requireRole(['super_admin', 'hospital_admin']), validate(assignServiceReportSchema), assignServiceReport);
router.patch('/:id/resolve', validate(resolveServiceReportSchema), resolveServiceReport);

export default router;
