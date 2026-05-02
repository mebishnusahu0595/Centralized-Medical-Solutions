import { z } from 'zod';

export const createServiceReportSchema = z.object({
  equipmentId: z.string().min(1, 'Equipment ID is required'),
  issueType: z.enum(['breakdown', 'performance', 'calibration', 'routine', 'compliance']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  title: z.string().min(2, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  attachments: z.array(z.string()).optional(),
});

export const updateServiceReportSchema = z.object({
  assignedTo: z.string().optional(),
  status: z.enum(['open', 'assigned', 'in_progress', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  resolution: z.string().optional(),
});

export const assignServiceReportSchema = z.object({
  engineerId: z.string().min(1, 'Engineer ID is required'),
});

export const resolveServiceReportSchema = z.object({
  resolution: z.string().min(1, 'Resolution is required'),
});
