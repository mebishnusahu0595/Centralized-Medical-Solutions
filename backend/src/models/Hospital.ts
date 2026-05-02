import mongoose, { Schema, Document } from 'mongoose';

export interface IHospital extends Document {
  name: string;
  code: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
  contactEmail?: string;
  contactPhone?: string;
  logo?: string;
  subscriptionPlan: 'free' | 'basic' | 'pro' | 'enterprise';
  subscriptionStatus: 'active' | 'suspended' | 'expired';
  subscriptionExpiry?: Date;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  settings: {
    timezone: string;
    currency: string;
    dateFormat: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const hospitalSchema = new Schema<IHospital>(
  {
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
      country: { type: String },
    },
    contactEmail: { type: String },
    contactPhone: { type: String },
    logo: { type: String },
    subscriptionPlan: {
      type: String,
      enum: ['free', 'basic', 'pro', 'enterprise'],
      default: 'free',
    },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'suspended', 'expired'],
      default: 'active',
    },
    subscriptionExpiry: { type: Date },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    settings: {
      timezone: { type: String, default: 'Asia/Kolkata' },
      currency: { type: String, default: 'INR' },
      dateFormat: { type: String, default: 'DD/MM/YYYY' },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IHospital>('Hospital', hospitalSchema);
