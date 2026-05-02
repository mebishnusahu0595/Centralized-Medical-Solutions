import { z } from 'zod';

export const createMaintenanceSchema = z.object({
  hospitalId: z.string().optional(),
  equipmentId: z.string().min(1, 'Equipment ID is required'),
  engineerId: z.string().min(1, 'Engineer ID is required'),
  type: z.enum(['preventive', 'corrective', 'emergency', 'calibration', 'inspection']),
  scheduledDate: z.string().min(1, 'Scheduled Date is required'),
  remarks: z.string().optional(),
});

export const updateMaintenanceSchema = z.object({
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).optional(),
  scheduledDate: z.string().optional(),
  startedAt: z.string().optional(),
  duration: z.number().optional(),
  workDone: z.string().optional(),
  partsReplaced: z.array(z.object({
    partName: z.string(),
    partNo: z.string().optional(),
    cost: z.number().optional()
  })).optional(),
  totalCost: z.number().optional(),
  remarks: z.string().optional(),
});

export const completeMaintenanceSchema = z.object({
  workDone: z.string().min(1, 'Work done description is required'),
  duration: z.number().optional(),
  partsReplaced: z.array(z.object({
    partName: z.string(),
    partNo: z.string().optional(),
    cost: z.number().optional()
  })).optional(),
  totalCost: z.number().optional(),
  signature: z.string().optional(),
});
