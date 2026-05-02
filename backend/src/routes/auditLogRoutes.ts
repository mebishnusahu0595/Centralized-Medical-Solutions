import express from 'express';
import { getAuditLogs } from '../controllers/auditLogController';
import { verifyToken, requireRole } from '../middleware/auth';

const router = express.Router();

router.use(verifyToken);
router.use(requireRole(['super_admin', 'hospital_admin']));

router.get('/', getAuditLogs);

export default router;
