import express from 'express';
import {
  getUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  forceResetPassword,
} from '../controllers/userController';
import { verifyToken, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createUserSchema,
  updateUserSchema,
  resetUserPasswordSchema,
} from '../validators/userValidator';

const router = express.Router();

router.use(verifyToken);
router.use(requireRole(['super_admin', 'hospital_admin']));

router.get('/', getUsers);
router.post('/', validate(createUserSchema), createUser);
router.get('/:id', getUser);
router.patch('/:id', validate(updateUserSchema), updateUser);
router.delete('/:id', deleteUser);
router.post('/:id/reset-password', validate(resetUserPasswordSchema), forceResetPassword);

export default router;
