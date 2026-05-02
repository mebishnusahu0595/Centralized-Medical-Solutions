import express from 'express';
import {
  login,
  refresh,
  logout,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword,
} from '../controllers/authController';
import { verifyToken } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/authValidator';

const router = express.Router();

router.post('/login', validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', verifyToken, logout);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

router.get('/me', verifyToken, getMe);
router.patch('/change-password', verifyToken, validate(changePasswordSchema), changePassword);

export default router;
