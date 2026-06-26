const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

// Mock Mongoose Models
jest.mock('../models/User');
jest.mock('../models/StudentProfile');
jest.mock('../models/RecruiterProfile');

const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const RecruiterProfile = require('../models/RecruiterProfile');

// Configure Mock Express App
const app = express();
app.use(express.json());
app.use(cookieParser());

// Import auth middleware & controllers
const { protect } = require('../middleware/authMiddleware');
const authRoutes = require('../routes/authRoutes');
app.use('/api/auth', authRoutes);

// Mock error handler
app.use((err, req, res, next) => {
  res.status(res.statusCode === 200 ? 500 : res.statusCode).json({
    success: false,
    message: err.message
  });
});

describe('Authentication API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new student user and return 201', async () => {
      // Mock no duplicate email
      User.findOne.mockResolvedValue(null);
      // Mock User.create
      User.create.mockResolvedValue({
        _id: 'mock_user_123',
        name: 'Jane Doe',
        email: 'jane@university.edu',
        role: 'student'
      });
      // Mock StudentProfile.create
      StudentProfile.create.mockResolvedValue({});

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@university.edu',
          password: 'Password1!',
          role: 'student'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Jane Doe');
      expect(response.body.data.token).toBeDefined();
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should reject duplicate email registration and return 400', async () => {
      // Mock duplicate email exists
      User.findOne.mockResolvedValue({ email: 'jane@university.edu' });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@university.edu',
          password: 'Password1!',
          role: 'student'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('should fail registration validation for weak passwords', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@university.edu',
          password: 'weak',
          role: 'student'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should authenticate user, set cookie, and return 200', async () => {
      const mockComparePassword = jest.fn().mockResolvedValue(true);
      User.findOne.mockResolvedValue({
        _id: 'mock_user_123',
        name: 'Jane Doe',
        email: 'jane@university.edu',
        role: 'student',
        comparePassword: mockComparePassword
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'jane@university.edu',
          password: 'Password1!'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should reject incorrect credentials and return 401', async () => {
      const mockComparePassword = jest.fn().mockResolvedValue(false);
      User.findOne.mockResolvedValue({
        email: 'jane@university.edu',
        comparePassword: mockComparePassword
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'jane@university.edu',
          password: 'WrongPassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should clear token cookie and return 200', async () => {
      const token = jwt.sign({ id: 'mock_user_123', role: 'student' }, 'fallback_secret_key');
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', [`token=${token}`]);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

});
