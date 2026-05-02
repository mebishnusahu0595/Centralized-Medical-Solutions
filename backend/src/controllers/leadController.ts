import { Request, Response, NextFunction } from 'express';
import Lead from '../models/Lead';
import { asyncHandler } from '../utils/asyncWrapper';
import { AppError } from '../utils/AppError';
import Notification from '../models/Notification';
import { emitToAll } from '../utils/socket';

// @desc    Submit demo request
// @route   POST /api/v1/leads
// @access  Public
export const createLead = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const lead = await Lead.create(req.body);

  // Notify Super Admins
  const notification = await Notification.create({
    type: 'system',
    title: 'New Demo Request',
    message: `A new demo request has been received from ${lead.name} (${lead.hospitalName}).`,
    priority: 'high',
    metadata: { leadId: lead._id }
  });

  emitToAll('new_notification', notification);

  res.status(201).json({
    success: true,
    data: lead,
  });
});

// @desc    Get all leads
// @route   GET /api/v1/leads
// @access  Super Admin
export const getLeads = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const leads = await Lead.find().sort('-createdAt');

  res.status(200).json({
    success: true,
    count: leads.length,
    data: leads,
  });
});
