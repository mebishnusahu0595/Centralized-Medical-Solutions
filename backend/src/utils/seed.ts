import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User';

dotenv.config();

const seedSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('MongoDB connected for seeding...');

    const email = process.env.SUPER_ADMIN_EMAIL || 'admin@yourdomain.com';
    const password = process.env.SUPER_ADMIN_PASSWORD || 'ChangeThisOnFirstLogin!';

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log('Super Admin already exists.');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const superAdmin = await User.create({
      name: 'Super Admin',
      email,
      passwordHash,
      role: 'super_admin',
      isActive: true,
    });

    console.log(`Super Admin created successfully with email: ${superAdmin.email}`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding Super Admin:', error);
    process.exit(1);
  }
};

seedSuperAdmin();
