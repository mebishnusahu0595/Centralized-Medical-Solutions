import mongoose, { Schema, Document } from 'mongoose';

export interface IServiceReport extends Document {
  hospitalId: mongoose.Types.ObjectId;
  equipmentId: mongoose.Types.ObjectId;
  reportedBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  issueType: 'breakdown' | 'performance' | 'calibration' | 'routine' | 'compliance';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
  title: string;
  description: string;
  attachments: string[];
  resolution?: string;
  resolvedAt?: Date;
  sla: {
    targetHours: number;
    targetTime: Date;
    breached: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const serviceReportSchema = new Schema<IServiceReport>(
  {
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
    equipmentId: { type: Schema.Types.ObjectId, ref: 'Equipment', required: true },
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    issueType: {
      type: String,
      enum: ['breakdown', 'performance', 'calibration', 'routine', 'compliance'],
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true,
    },
    status: {
      type: String,
      enum: ['open', 'assigned', 'in_progress', 'resolved', 'closed'],
      default: 'open',
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    attachments: [{ type: String }],
    resolution: { type: String },
    resolvedAt: { type: Date },
    sla: {
      targetHours: { type: Number, required: true },
      targetTime: { type: Date, required: true },
      breached: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IServiceReport>('ServiceReport', serviceReportSchema);
