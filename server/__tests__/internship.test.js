const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

// Mock Mongoose Models
jest.mock('../models/Internship');
jest.mock('../models/RecruiterProfile');
jest.mock('../models/StudentProfile');

const Internship = require('../models/Internship');
const RecruiterProfile = require('../models/RecruiterProfile');
const StudentProfile = require('../models/StudentProfile');

const app = express();
app.use(express.json());
app.use(cookieParser());

const internshipRoutes = require('../routes/internshipRoutes');
app.use('/api/internships', internshipRoutes);

// Error Handler
app.use((err, req, res, next) => {
  res.status(res.statusCode === 200 ? 500 : res.statusCode).json({
    success: false,
    message: err.message
  });
});

describe('Internships API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/internships', () => {
    it('should list published internships and return 200', async () => {
      const mockList = [
        { _id: 'internship_01', title: 'React Developer', status: 'Published', category: 'Frontend', location: 'Remote', requiredSkills: ['React'] }
      ];
      
      const mockFindChain = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockList)
      };

      Internship.find.mockReturnValue(mockFindChain);
      Internship.countDocuments.mockResolvedValue(1);

      const response = await request(app).get('/api/internships');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.internships.length).toBe(1);
    });
  });

  describe('POST /api/internships', () => {
    it('should allow verified recruiter to create an internship draft and return 201', async () => {
      const recruiterToken = jwt.sign({ id: 'recruiter_123', role: 'recruiter' }, 'fallback_secret_key');
      
      Internship.create.mockResolvedValue({
        _id: 'internship_new',
        recruiterId: 'recruiter_123',
        title: 'Backend Node Intern',
        status: 'Draft'
      });

      const response = await request(app)
        .post('/api/internships')
        .set('Cookie', [`token=${recruiterToken}`])
        .send({
          title: 'Backend Node Intern',
          category: 'Software Engineering',
          location: 'Hybrid',
          internshipType: 'Hybrid',
          description: 'A long description about Node.js engineering at company...',
          requiredSkills: ['Node.js'],
          duration: '3 months',
          stipend: '$1000/mo',
          applicationDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString() // future
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('Draft');
    });

    it('should block non-recruiter (student) from creating an internship', async () => {
      const studentToken = jwt.sign({ id: 'student_123', role: 'student' }, 'fallback_secret_key');

      const response = await request(app)
        .post('/api/internships')
        .set('Cookie', [`token=${studentToken}`])
        .send({
          title: 'React Dev'
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/internships/:id', () => {
    it('should allow owner recruiter to publish only if recruiter is verified', async () => {
      const recruiterToken = jwt.sign({ id: 'recruiter_123', role: 'recruiter' }, 'fallback_secret_key');
      
      const mockSave = jest.fn().mockResolvedValue({
        _id: 'internship_01',
        recruiterId: 'recruiter_123',
        status: 'Published'
      });

      Internship.findById.mockResolvedValue({
        _id: 'internship_01',
        recruiterId: 'recruiter_123',
        save: mockSave
      });

      // Recruiter is verified
      RecruiterProfile.findOne.mockResolvedValue({ verified: true });

      const response = await request(app)
        .put('/api/internships/internship_01')
        .set('Cookie', [`token=${recruiterToken}`])
        .send({
          status: 'Published'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should block owner recruiter from publishing if unverified', async () => {
      const recruiterToken = jwt.sign({ id: 'recruiter_123', role: 'recruiter' }, 'fallback_secret_key');

      Internship.findById.mockResolvedValue({
        _id: 'internship_01',
        recruiterId: 'recruiter_123'
      });

      // Recruiter is NOT verified
      RecruiterProfile.findOne.mockResolvedValue({ verified: false });

      const response = await request(app)
        .put('/api/internships/internship_01')
        .set('Cookie', [`token=${recruiterToken}`])
        .send({
          status: 'Published'
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('must be verified');
    });
  });
});
