import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  hospitalId: mongoose.Types.ObjectId | null;
  userId: mongoose.Types.ObjectId | null;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  link?: string;
  metadata?: any;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', default: null },
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    type: {
      type: String,
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    priority: { 
      type: String, 
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low'
    },
    isRead: { type: Boolean, default: false },
    link: { type: String },
    metadata: { type: Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now },
  }
);

export default mongoose.model<INotification>('Notification', notificationSchema);
