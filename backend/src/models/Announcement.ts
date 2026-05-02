import mongoose, { Schema, Document } from 'mongoose';

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  targetType: 'all' | 'specific';
  targetHospitals: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    priority: { 
      type: String, 
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low'
    },
    targetType: {
      type: String,
      enum: ['all', 'specific'],
      default: 'all'
    },
    targetHospitals: [{ type: Schema.Types.ObjectId, ref: 'Hospital' }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IAnnouncement>('Announcement', announcementSchema);
