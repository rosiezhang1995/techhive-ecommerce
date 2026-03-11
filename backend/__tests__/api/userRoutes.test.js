import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import path from 'path';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../../index.js';
import User from '../../models/userModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

let mongoServer;

// Setup connection to a test MongoDB server
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

// Close connection after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Clear user data between tests
afterEach(async () => {
  await User.deleteMany({});
});

describe('User API', () => {
  // Test new user registration
  it('should register a new user', async () => {
    const res = await request(app).post('/api/users').send({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.email).toBe('test@example.com');
  });

  // Test user duplication check
  it('should not register duplicate user', async () => {
    await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashed'
    });

    const res = await request(app).post('/api/users').send({
      username: 'another',
      email: 'test@example.com',
      password: 'password123'
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/exists/i);
  });

  // Test user login
  it('should login a user and return user info', async () => {
    // Create a test user
    const user = new User({
      username: 'loginuser',
      email: 'login@example.com',
      password: await bcrypt.hash('password123', 10)
    });
    await user.save();

    const res = await request(app).post('/api/users/auth').send({
      email: 'login@example.com',
      password: 'password123'
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe('login@example.com');
    expect(res.headers['set-cookie']).toBeDefined(); // check if JWT has been set
  });

  // Test credential validation
  it('should reject login with invalid credentials', async () => {
    const res = await request(app).post('/api/users/auth').send({
      email: 'fake@example.com',
      password: 'wrongpassword'
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/invalid/i);
  });
});
