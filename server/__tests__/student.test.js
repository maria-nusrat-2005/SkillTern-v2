const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

// Mock Mongoose Models & Services
jest.mock('../models/StudentProfile');
jest.mock('../models/Project');
jest.mock('../models/Resume');
jest.mock('../services/storageService');

const StudentProfile = require('../models/StudentProfile');
const Project = require('../models/Project');
const Resume = require('../models/Resume');
const storageService = require('../services/storageService');

const app = express();
app.use(express.json());
app.use(cookieParser());

const studentRoutes = require('../routes/studentRoutes');
const resumeRoutes = require('../routes/resumeRoutes');
app.use('/api/students', studentRoutes);
app.use('/api/resume', resumeRoutes);

// Error Handler
app.use((err, req, res, next) => {
  res.status(res.statusCode === 200 ? 400 : res.statusCode).json({
    success: false,
    message: err.message
  });
});

describe('Student Profile and Resume API', () => {
  let studentToken;

  beforeEach(() => {
    jest.clearAllMocks();
    studentToken = jwt.sign({ id: 'student_123', role: 'student' }, 'fallback_secret_key');
  });

  describe('GET /api/students/profile', () => {
    it('should retrieve student profile successfully', async () => {
      const mockProfile = {
        userId: 'student_123',
        university: 'Test University',
        degree: 'BS',
        graduationYear: 2027,
        skills: ['JavaScript'],
        interests: ['Development']
      };

      StudentProfile.findOne.mockResolvedValue(mockProfile);

      const response = await request(app)
        .get('/api/students/profile')
        .set('Cookie', [`token=${studentToken}`]);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.university).toBe('Test University');
    });

    it('should return 404 if profile does not exist', async () => {
      StudentProfile.findOne.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/students/profile')
        .set('Cookie', [`token=${studentToken}`]);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/students/profile', () => {
    it('should update student profile and return 200', async () => {
      const mockProfile = {
        userId: 'student_123',
        university: 'Old University',
        degree: 'BS',
        graduationYear: 2027,
        save: jest.fn().mockResolvedValue({
          userId: 'student_123',
          university: 'New University',
          degree: 'BS',
          graduationYear: 2027
        })
      };

      StudentProfile.findOne.mockResolvedValue(mockProfile);
      Project.countDocuments.mockResolvedValue(0);
      Resume.exists.mockResolvedValue(false);

      const response = await request(app)
        .put('/api/students/profile')
        .set('Cookie', [`token=${studentToken}`])
        .send({ university: 'New University' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockProfile.save).toHaveBeenCalled();
    });
  });

  describe('POST /api/resume/upload', () => {
    it('should upload PDF cv successfully and return url', async () => {
      storageService.uploadBuffer.mockResolvedValue({
        url: '/uploads/cv/123_resume.pdf',
        publicId: 'skilltern_cvs/123_resume'
      });
      Resume.findOne.mockResolvedValue(null);
      Resume.create.mockResolvedValue({
        studentId: 'student_123',
        fileUrl: '/uploads/cv/123_resume.pdf'
      });
      StudentProfile.findOneAndUpdate.mockResolvedValue({});

      const response = await request(app)
        .post('/api/resume/upload')
        .set('Cookie', [`token=${studentToken}`])
        .attach('cv', Buffer.from('mock pdf content'), 'resume.pdf');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.fileUrl).toBe('/uploads/cv/123_resume.pdf');
      expect(storageService.uploadBuffer).toHaveBeenCalled();
    });

    it('should upload DOCX cv successfully', async () => {
      storageService.uploadBuffer.mockResolvedValue({
        url: '/uploads/cv/123_resume.docx',
        publicId: 'skilltern_cvs/123_resume'
      });
      Resume.findOne.mockResolvedValue(null);
      Resume.create.mockResolvedValue({
        studentId: 'student_123',
        fileUrl: '/uploads/cv/123_resume.docx'
      });
      StudentProfile.findOneAndUpdate.mockResolvedValue({});

      const response = await request(app)
        .post('/api/resume/upload')
        .set('Cookie', [`token=${studentToken}`])
        .attach('cv', Buffer.from('mock docx content'), 'resume.docx');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.fileUrl).toBe('/uploads/cv/123_resume.docx');
    });

    it('should reject non-PDF/DOCX file formats with 400', async () => {
      const response = await request(app)
        .post('/api/resume/upload')
        .set('Cookie', [`token=${studentToken}`])
        .attach('cv', Buffer.from('image content'), 'avatar.png');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Only PDF and DOC');
    });

    it('should reject files larger than 5MB with 400', async () => {
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024); // 6MB
      const response = await request(app)
        .post('/api/resume/upload')
        .set('Cookie', [`token=${studentToken}`])
        .attach('cv', largeBuffer, 'huge_resume.pdf');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
