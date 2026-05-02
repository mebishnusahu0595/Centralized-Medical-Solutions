import { Request, Response, NextFunction } from 'express';
import Announcement from '../models/Announcement';
import Notification from '../models/Notification';
import Hospital from '../models/Hospital';
import { asyncHandler } from '../utils/asyncWrapper';
import { AppError } from '../utils/AppError';

// @desc    Get all announcements
// @route   GET /api/v1/announcements
// @access  Super Admin
export const getAnnouncements = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const announcements = await Announcement.find()
    .populate('targetHospitals', 'name')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    data: announcements,
  });
});

// @desc    Create and broadcast announcement
// @route   POST /api/v1/announcements
// @access  Super Admin
export const createAnnouncement = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { title, content, priority, targetType, targetHospitals } = req.body;

  const announcement = await Announcement.create({
    title,
    content,
    priority,
    targetType,
    targetHospitals: targetType === 'specific' ? targetHospitals : [],
    createdBy: req.user?._id,
  });

  // Broadcast to Notifications
  let hospitalsToNotify = [];
  if (targetType === 'all') {
    hospitalsToNotify = await Hospital.find({ isActive: true }).select('_id');
  } else {
    hospitalsToNotify = targetHospitals.map((id: string) => ({ _id: id }));
  }

  const notifications = hospitalsToNotify.map((h: any) => ({
    hospitalId: h._id,
    type: 'announcement',
    title: `Platform Announcement: ${title}`,
    message: content,
    priority,
    metadata: { announcementId: announcement._id }
  }));

  if (notifications.length > 0) {
    await Notification.insertMany(notifications);
  }

  res.status(201).json({
    success: true,
    data: announcement,
  });
});

// @desc    Delete announcement (and associated notifications)
// @route   DELETE /api/v1/announcements/:id
// @access  Super Admin
export const deleteAnnouncement = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    return next(new AppError('Announcement not found', 404));
  }

  // Remove associated notifications
  await Notification.deleteMany({ 'metadata.announcementId': announcement._id });
  
  await announcement.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
    message: 'Announcement and associated notifications deleted',
  });
});
