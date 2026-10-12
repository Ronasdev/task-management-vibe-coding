import mongoose from 'mongoose';
import { env } from './env.js';

mongoose.set('strictQuery', true);

export async function connectDB() {
  await mongoose.connect(env.MONGO_URI, {
    serverSelectionTimeoutMS: 10_000,
  });
  console.log('✅ MongoDB connecté');
}

export async function disconnectDB() {
  await mongoose.connection.close();
}
