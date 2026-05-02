import mongoose, { Schema, Document } from 'mongoose';

export interface IEquipment extends Document {
  hospitalId: mongoose.Types.ObjectId;
  name: string;
  category: 'imaging' | 'monitoring' | 'laboratory' | 'surgical' | 'life_support' | 'diagnostic' | 'rehabilitation' | 'sterilization' | 'other';
  subCategory?: string;
  equipmentCode: string;
  serialNumber?: string;
  modelNumber?: string;
  manufacturer?: string;
  vendor?: string;
  purchaseDate?: Date;
  purchasePrice?: number;
  warrantyExpiry?: Date;
  location?: {
    building?: string;
    floor?: string;
    ward?: string;
    room?: string;
  };
  status: 'active' | 'under_maintenance' | 'out_of_service' | 'decommissioned';
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  assignedEngineer?: mongoose.Types.ObjectId;
  maintenanceFrequency: 'weekly' | 'monthly' | 'quarterly' | 'biannual' | 'annual';
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  complianceDueDate?: Date;
  documents: Array<{
    name: string;
    url: string;
    type: string;
    uploadedAt: Date;
  }>;
  images: string[];
  qrCode?: string;
  barcode?: string;
  tags: string[];
  isActive: boolean;
  addedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const equipmentSchema = new Schema<IEquipment>(
  {
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ['imaging', 'monitoring', 'laboratory', 'surgical', 'life_support', 'diagnostic', 'rehabilitation', 'sterilization', 'other'],
      required: true,
    },
    subCategory: { type: String },
    equipmentCode: { type: String, required: true },
    serialNumber: { type: String },
    modelNumber: { type: String },
    manufacturer: { type: String },
    vendor: { type: String },
    purchaseDate: { type: Date },
    purchasePrice: { type: Number },
    warrantyExpiry: { type: Date },
    location: {
      building: { type: String },
      floor: { type: String },
      ward: { type: String },
      room: { type: String },
    },
    status: {
      type: String,
      enum: ['active', 'under_maintenance', 'out_of_service', 'decommissioned'],
      default: 'active',
    },
    condition: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      default: 'good',
    },
    assignedEngineer: { type: Schema.Types.ObjectId, ref: 'User' },
    maintenanceFrequency: {
      type: String,
      enum: ['weekly', 'monthly', 'quarterly', 'biannual', 'annual'],
      required: true,
    },
    lastMaintenanceDate: { type: Date },
    nextMaintenanceDate: { type: Date },
    complianceDueDate: { type: Date },
    documents: [
      {
        name: { type: String },
        url: { type: String },
        type: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    images: [{ type: String }],
    qrCode: { type: String },
    barcode: { type: String },
    tags: [{ type: String }],
    isActive: { type: Boolean, default: true },
    addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure equipmentCode is unique per hospital
equipmentSchema.index({ hospitalId: 1, equipmentCode: 1 }, { unique: true });

export default mongoose.model<IEquipment>('Equipment', equipmentSchema);
