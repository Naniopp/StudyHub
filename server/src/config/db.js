import mongoose from 'mongoose';
import { User, Task, Quiz } from '../models.js';

export async function connectDB(uri = process.env.MONGODB_URI) {
  if (!uri) throw new Error('MONGODB_URI is required');
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const collections = [User.collection.collectionName, Task.collection.collectionName, Quiz.collection.collectionName, 'sessions'];
  for (const name of collections) {
    const exists = await db.listCollections({ name }, { nameOnly: true }).hasNext();
    if (!exists) await db.createCollection(name);
  }
  await Promise.all([User.createIndexes(), Task.createIndexes(), Quiz.createIndexes()]);
  return mongoose.connection;
}
