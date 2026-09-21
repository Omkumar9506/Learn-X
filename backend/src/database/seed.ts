import 'reflect-metadata';
import mongoose from 'mongoose';
import { config } from 'dotenv';
import bcrypt from 'bcrypt';
import { User, UserSchema } from '../users/entities/user.entity.js';
import { Category, CategorySchema } from '../categories/entities/category.entity.js';
import { UserRole } from '../common/constants/enums.js';

config();

async function runSeed() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/learnx';
  console.log('🚀 Connecting to MongoDB for LearnX database seeding...');
  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB:', mongoUri);

  const UserModel = mongoose.model(User.name, UserSchema);
  const CategoryModel = mongoose.model(Category.name, CategorySchema);

  // 1. Seed Categories
  console.log('🌱 Seeding Categories...');
  const categoriesData = [
    {
      name: 'Full-Stack & Web Development',
      slug: 'web-development',
      description: 'Modern full-stack engineering with Next.js, React, Node.js, and TypeScript.',
      icon: 'Globe',
    },
    {
      name: 'Backend & Systems Architecture',
      slug: 'backend-systems',
      description: 'Scalable backends, NestJS, Go, microservices, and distributed architecture.',
      icon: 'Server',
    },
    {
      name: 'DevOps & Cloud Engineering',
      slug: 'devops-cloud',
      description: 'Docker, Kubernetes, AWS, Terraform, and high-availability production clusters.',
      icon: 'Cloud',
    },
    {
      name: 'Database Engineering & Performance',
      slug: 'database-engineering',
      description: 'PostgreSQL indexing, query optimization, data modeling, and Redis caching.',
      icon: 'Database',
    },
    {
      name: 'AI Engineering & Machine Learning',
      slug: 'ai-ml',
      description: 'LLM agents, LangChain, vector databases, and Python AI backends.',
      icon: 'Cpu',
    },
  ];

  for (const cat of categoriesData) {
    const existing = await CategoryModel.findOne({ slug: cat.slug });
    if (!existing) {
      await CategoryModel.create(cat);
      console.log(`  + Created category: ${cat.name}`);
    } else {
      console.log(`  = Category already exists: ${cat.name}`);
    }
  }

  // 2. Seed Admin User
  console.log('🌱 Seeding Admin User...');
  const defaultPassword = await bcrypt.hash('Password123!', 10);

  const existingAdmin = await UserModel.findOne({ email: 'admin@learnx.dev' });
  if (!existingAdmin) {
    await UserModel.create({
      name: 'System Administrator',
      email: 'admin@learnx.dev',
      password: defaultPassword,
      role: UserRole.ADMIN,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
      bio: 'Core Platform Engineering & Infrastructure Oversight',
      isActive: true,
    });
    console.log('  + Created admin user: admin@learnx.dev');
  } else {
    console.log('  = Admin user already exists: admin@learnx.dev');
  }

  console.log('🎉 LearnX Database Seed Completed Successfully!');
  console.log('----------------------------------------------------');
  console.log('Platform Accounts:');
  console.log('Admin: admin@learnx.dev / Password123!');
  console.log('----------------------------------------------------');

  await mongoose.disconnect();
}

runSeed().catch((err) => {
  console.error('❌ Database seed failed:', err);
  process.exit(1);
});
