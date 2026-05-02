import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';
import User from '../models/User';
import { asyncHandler } from '../utils/asyncWrapper';

// Verify JWT token and attach user to req
export const verifyToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Not authorized to access this route', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    const user = await User.findById(decoded.id);
    
    if (!user || !user.isActive) {
      return next(new AppError('User not found or deactivated', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new AppError('Not authorized to access this route', 401));
  }
});

// Enforce specific roles
export const requireRole = (roles: Array<'super_admin' | 'hospital_admin' | 'engineer' | 'staff'>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError(`Role ${req.user?.role} is not authorized to access this route`, 403));
    }
    next();
  };
};

// Enforce hospital scope (tenant isolation)
export const enforceHospitalScope = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Not authorized', 401));
  }

  // super_admin bypasses hospital scope
  if (req.user.role === 'super_admin') {
    return next();
  }

  // Ensure they belong to a hospital
  if (!req.user.hospitalId) {
    return next(new AppError('User is not associated with any hospital', 403));
  }

  // For GET requests or requests that have a hospitalId in params/body, validate it
  const requestHospitalId = req.params.hospitalId || req.body.hospitalId || req.query.hospitalId;

  if (requestHospitalId && requestHospitalId !== req.user.hospitalId.toString()) {
    return next(new AppError('Not authorized to access data for this hospital', 403));
  }

  next();
};
