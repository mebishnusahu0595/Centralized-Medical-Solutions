import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  hospitalId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  action: string;
  resource: string;
  resourceId?: mongoose.Types.ObjectId;
  oldData?: any;
  newData?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    resource: { type: String, required: true },
    resourceId: { type: Schema.Types.ObjectId },
    oldData: { type: Schema.Types.Mixed },
    newData: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
    timestamp: { type: Date, default: Date.now },
  }
);

export default mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
