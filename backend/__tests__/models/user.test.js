import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '../../models/userModel.js';

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


describe('User Model', () => {
  // Test new user creation
  it('should create a new user successfully', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };

    const user = new User(userData);
    const savedUser = await user.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.username).toBe(userData.username);
    expect(savedUser.email).toBe(userData.email);
    expect(savedUser.isAdmin).toBe(false); // default value
  });

  // Test required fields
  it('should require username, email, and password', async () => {
    const user = new User({});

    let error;
    try {
      await user.save();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.errors.username).toBeDefined();
    expect(error.errors.email).toBeDefined();
    expect(error.errors.password).toBeDefined();
  });

  // Test duplicated user check
  it('should not allow duplicate emails', async () => {
    const user1 = new User({
      username: 'user1',
      email: 'dup@example.com',
      password: 'pass1'
    });

    // Create duplicated user data
    const user2 = new User({
      username: 'user2',
      email: 'dup@example.com',
      password: 'pass2'
    });

    await user1.save();

    let error;
    try {
      await user2.save();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.code).toBe(11000); // MangoDB duplicate data error code
  });
});
