import { Request, Response, NextFunction } from 'express';
import Notification from '../models/Notification';
import { asyncHandler } from '../utils/asyncWrapper';
import { AppError } from '../utils/AppError';

// @desc    Get current user notifications
// @route   GET /api/v1/notifications
// @access  Protected
export const getNotifications = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 20;
  const skip = (page - 1) * limit;

  const query: any = { userId: req.user?._id };
  
  // Also include global notifications (hospital-specific or platform-wide)
  // This depends on business logic, for now we assume notifications are targeted to specific users
  // or broadcasted with userId: null and hospitalId matching.
  
  const notifications = await Notification.find({
    $or: [
      { userId: req.user?._id },
      { userId: null, hospitalId: req.user?.hospitalId },
      { userId: null, hospitalId: null } // Global system notifications
    ]
  })
  .sort('-createdAt')
  .skip(skip)
  .limit(limit);

  const total = await Notification.countDocuments({
    $or: [
      { userId: req.user?._id },
      { userId: null, hospitalId: req.user?.hospitalId },
      { userId: null, hospitalId: null }
    ]
  });

  res.status(200).json({
    success: true,
    count: notifications.length,
    total,
    page,
    data: notifications,
  });
});

// @desc    Mark one notification as read
// @route   PATCH /api/v1/notifications/:id/read
// @access  Protected
export const markAsRead = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  // Ensure notification belongs to user (or their hospital)
  if (notification.userId && notification.userId.toString() !== req.user?._id.toString()) {
    return next(new AppError('Not authorized', 403));
  }

  notification.isRead = true;
  await notification.save();

  res.status(200).json({
    success: true,
    data: notification,
  });
});

// @desc    Mark all notifications as read
// @route   PATCH /api/v1/notifications/read-all
// @access  Protected
export const markAllAsRead = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  await Notification.updateMany(
    { 
      $or: [
        { userId: req.user?._id },
        { userId: null, hospitalId: req.user?.hospitalId }
      ],
      isRead: false 
    },
    { isRead: true }
  );

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read',
  });
});

// @desc    Delete notification
// @route   DELETE /api/v1/notifications/:id
// @access  Protected
export const deleteNotification = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  if (notification.userId && notification.userId.toString() !== req.user?._id.toString()) {
    return next(new AppError('Not authorized', 403));
  }

  await notification.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});
