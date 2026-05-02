import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User';
import Hospital from '../models/Hospital';
import Equipment from '../models/Equipment';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB for full seeding...');

    await User.deleteMany({});
    await Hospital.deleteMany({});
    await Equipment.deleteMany({});
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

    // 3. Create a Hospital
    const hospital = await Hospital.create({
      name: 'Shalom Medical Center',
      code: 'SHM001',
      subscriptionPlan: 'enterprise',
      isActive: true,
      address: {
        street: '123 Medical Park',
        city: 'Mumbai',
        state: 'Maharashtra',
        zip: '400001'
      },
      contactEmail: 'admin@shalom.com'
    } as any);
    console.log('Created Hospital: Shalom Medical Center (SHM001)');

    // 4. Create Hospital Admin
    const hospitalAdmin = await User.create({
      hospitalId: hospital._id,
      name: 'Dr. Rahul Sharma',
      email: 'admin@shalom.com',
      passwordHash: await bcrypt.hash('Shalom@123', salt),
      role: 'hospital_admin',
      isActive: true,
    } as any);
    console.log('Created Hospital Admin: admin@shalom.com / Shalom@123');

    // 5. Create Engineer
    const engineer = await User.create({
      hospitalId: hospital._id,
      name: 'Amit Kumar',
      email: 'engineer@shalom.com',
      passwordHash: await bcrypt.hash('Shalom@123', salt),
      role: 'engineer',
      isActive: true,
    } as any);
    console.log('Created Engineer: engineer@shalom.com / Shalom@123');

    // 6. Create some Equipment
    const equipments = [
      {
        hospitalId: hospital._id,
        name: 'MRI Scanner - Philips Pro',
        category: 'imaging',
        equipmentCode: 'MRI-001',
        serialNumber: 'PHL-882299',
        modelNumber: 'Pro-X1',
        status: 'active',
        condition: 'excellent',
        maintenanceFrequency: 'quarterly',
        nextMaintenanceDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        addedBy: hospitalAdmin._id,
        isActive: true
      },
      {
        hospitalId: hospital._id,
        name: 'Patient Monitor - GE B450',
        category: 'monitoring',
        equipmentCode: 'MON-102',
        serialNumber: 'GE-441122',
        modelNumber: 'B450',
        status: 'under_maintenance',
        condition: 'good',
        maintenanceFrequency: 'monthly',
        nextMaintenanceDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        addedBy: hospitalAdmin._id,
        isActive: true
      }
    ];

    await Equipment.insertMany(equipments);
    console.log('Created initial equipment items.');

    console.log('--- SEEDING COMPLETE ---');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
