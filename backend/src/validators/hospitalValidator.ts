import { z } from 'zod';

export const createHospitalSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  code: z.string().min(2, 'Code is required'),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  adminName: z.string().min(2, 'Admin name is required'),
  adminEmail: z.string().email('Admin email is required'),
  adminPassword: z.string().min(6, 'Admin password must be at least 6 characters'),
  subscriptionPlan: z.enum(['free', 'basic', 'pro', 'enterprise']).optional(),
});

export const updateHospitalSchema = z.object({
  name: z.string().min(2).optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  settings: z.object({
    timezone: z.string().optional(),
    currency: z.string().optional(),
    dateFormat: z.string().optional(),
  }).optional(),
});

export const suspendHospitalSchema = z.object({
  status: z.enum(['active', 'suspended', 'expired']),
});
