import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Hospital from '../models/Hospital';
import User from '../models/User';
import Equipment from '../models/Equipment';
import MaintenanceLog from '../models/MaintenanceLog';
import AuditLog from '../models/AuditLog';
import dotenv from 'dotenv';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB for seeding...');

    // 1. Clear existing data
    await Hospital.deleteMany({});
    await User.deleteMany({});
    await Equipment.deleteMany({});
    await MaintenanceLog.deleteMany({});
    await AuditLog.deleteMany({});
    console.log('Cleared existing data.');

    const salt = await bcrypt.genSalt(12);

    // 2. Create Super Admin
    const superAdmin = await User.create({
      name: 'Super Admin',
      email: 'superadmin@cms.com',
      passwordHash: await bcrypt.hash('Admin@123', salt),
      role: 'super_admin',
      isActive: true,
    } as any);
    console.log('Created Super Admin: superadmin@cms.com / Admin@123');

    // 3. Create Hospitals
    const hospitals = await Hospital.insertMany([
      {
        name: 'Shalom Multispeciality Hospital',
        code: 'SHALOM-01',
        address: 'Sector 44, Gurgaon',
        contactNumber: '+91 9876543210',
        subscriptionPlan: 'pro',
        subscriptionStatus: 'active',
        isActive: true,
      },
      {
        name: 'City Care Clinic',
        code: 'CITY-02',
        address: 'MG Road, Delhi',
        contactNumber: '+91 8877665544',
        subscriptionPlan: 'basic',
        subscriptionStatus: 'active',
        isActive: true,
      },
      {
        name: 'Apex Trauma Center',
        code: 'APEX-03',
        address: 'Bandra, Mumbai',
        contactNumber: '+91 7766554433',
        subscriptionPlan: 'enterprise',
        subscriptionStatus: 'active',
        isActive: true,
      }
    ]);

    const shalom = hospitals[0];
    const cityCare = hospitals[1];

    // 4. Create Hospital Admins
    const shalomAdmin = await User.create({
      hospitalId: shalom._id,
      name: 'Bishnu Sahu',
      email: 'admin@shalom.com',
      passwordHash: await bcrypt.hash('Shalom@123', salt),
      role: 'hospital_admin',
      isActive: true,
    } as any);

    await User.create({
      hospitalId: cityCare._id,
      name: 'City Admin',
      email: 'admin@citycare.com',
      passwordHash: await bcrypt.hash('City@123', salt),
      role: 'hospital_admin',
      isActive: true,
    } as any);

    // 5. Create Staff for Shalom
    await User.insertMany([
      {
        hospitalId: shalom._id,
        name: 'Dr. Deepa Singh',
        email: 'staff@shalom.com',
        passwordHash: await bcrypt.hash('Shalom@123', salt),
        role: 'staff',
        isActive: true,
      },
      {
        hospitalId: shalom._id,
        name: 'Amit Kumar',
        email: 'engineer@shalom.com',
        passwordHash: await bcrypt.hash('Shalom@123', salt),
        role: 'engineer',
        isActive: true,
      },
      {
        hospitalId: shalom._id,
        name: 'Rahul Varma',
        email: 'rahul@shalom.com',
        passwordHash: await bcrypt.hash('Shalom@123', salt),
        role: 'engineer',
        isActive: true,
      }
    ]);

    // 6. Create Equipment for Shalom
    const equipments = await Equipment.insertMany([
      {
        hospitalId: shalom._id,
        name: 'MRI Scanner - Philips Pro',
        category: 'imaging',
        equipmentCode: 'MRI-001',
        serialNumber: 'PHL-882299',
        modelNumber: 'Pro-X1',
        status: 'active',
        condition: 'excellent',
        maintenanceFrequency: 'quarterly',
        nextMaintenanceDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        addedBy: shalomAdmin._id,
        isActive: true
      },
      {
        hospitalId: shalom._id,
        name: 'Patient Monitor - GE B450',
        category: 'monitoring',
        equipmentCode: 'MON-102',
        serialNumber: 'GE-441122',
        modelNumber: 'B450',
        status: 'under_maintenance',
        condition: 'good',
        maintenanceFrequency: 'monthly',
        nextMaintenanceDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        addedBy: shalomAdmin._id,
        isActive: true
      },
      {
        hospitalId: shalom._id,
        name: 'Ventilator - Drager Savina',
        category: 'respiratory',
        equipmentCode: 'VEN-203',
        serialNumber: 'DRG-112233',
        modelNumber: 'Savina 300',
        status: 'active',
        condition: 'good',
        maintenanceFrequency: 'monthly',
        nextMaintenanceDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        addedBy: shalomAdmin._id,
        isActive: true
      },
      {
        hospitalId: shalom._id,
        name: 'X-Ray Unit - Siemens',
        category: 'imaging',
        equipmentCode: 'XRY-405',
        serialNumber: 'SIE-556677',
        modelNumber: 'Multix',
        status: 'out_of_service',
        condition: 'poor',
        maintenanceFrequency: 'quarterly',
        nextMaintenanceDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        addedBy: shalomAdmin._id,
        isActive: true
      }
    ]);

    // 7. Create Maintenance Logs
    await MaintenanceLog.insertMany([
      {
        equipmentId: equipments[0]._id,
        hospitalId: shalom._id,
        performedBy: shalomAdmin._id,
        type: 'preventive',
        description: 'Monthly calibration and cleaning',
        cost: 5000,
        performedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        nextMaintenanceDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
      },
      {
        equipmentId: equipments[1]._id,
        hospitalId: shalom._id,
        performedBy: shalomAdmin._id,
        type: 'corrective',
        description: 'Replaced power module',
        cost: 12000,
        performedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        nextMaintenanceDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
      }
    ]);

    console.log('--- ENHANCED SEEDING COMPLETE ---');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
