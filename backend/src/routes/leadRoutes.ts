import express from 'express';
import { createLead, getLeads } from '../controllers/leadController';
import { verifyToken, requireRole } from '../middleware/auth';

const router = express.Router();

router.post('/', createLead);
router.get('/', verifyToken, requireRole(['super_admin']), getLeads);

export default router;
