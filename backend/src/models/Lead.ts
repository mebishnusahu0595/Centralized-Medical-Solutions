import mongoose, { Schema, Document } from 'mongoose';

export interface ILead extends Document {
  name: string;
  hospitalName: string;
  phone: string;
  email: string;
  message?: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  createdAt: Date;
}

const leadSchema = new Schema<ILead>({
  name: { type: String, required: true },
  hospitalName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String },
  status: { 
    type: String, 
    enum: ['new', 'contacted', 'qualified', 'converted', 'lost'],
    default: 'new'
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ILead>('Lead', leadSchema);
