import mongoose, { Schema, Document } from 'mongoose';

export interface IMaintenanceLog extends Document {
  hospitalId: mongoose.Types.ObjectId;
  equipmentId: mongoose.Types.ObjectId;
  engineerId: mongoose.Types.ObjectId;
  type: 'preventive' | 'corrective' | 'emergency' | 'calibration' | 'inspection';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduledDate: Date;
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
  workDone?: string;
  partsReplaced: Array<{
    partName: string;
    partNo?: string;
    cost?: number;
  }>;
  totalCost?: number;
  beforeImages: string[];
  afterImages: string[];
  pdfReport?: string;
  signature?: string;
  nextDueDate?: Date;
  remarks?: string;
  verifiedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const maintenanceLogSchema = new Schema<IMaintenanceLog>(
  {
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
    equipmentId: { type: Schema.Types.ObjectId, ref: 'Equipment', required: true },
    engineerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['preventive', 'corrective', 'emergency', 'calibration', 'inspection'],
      required: true,
    },
    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    scheduledDate: { type: Date, required: true },
    startedAt: { type: Date },
    completedAt: { type: Date },
    duration: { type: Number },
    workDone: { type: String },
    partsReplaced: [
      {
        partName: { type: String, required: true },
        partNo: { type: String },
        cost: { type: Number },
      },
    ],
    totalCost: { type: Number },
    beforeImages: [{ type: String }],
    afterImages: [{ type: String }],
    pdfReport: { type: String },
    signature: { type: String },
    nextDueDate: { type: Date },
    remarks: { type: String },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IMaintenanceLog>('MaintenanceLog', maintenanceLogSchema);
