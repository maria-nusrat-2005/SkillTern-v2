const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

// Mock Mongoose Models
jest.mock('../models/Rating');
jest.mock('../models/Application');
jest.mock('../models/Internship');
jest.mock('../models/User');

const Rating = require('../models/Rating');
const Application = require('../models/Application');
const Internship = require('../models/Internship');

const app = express();
app.use(express.json());
app.use(cookieParser());

const ratingRoutes = require('../routes/ratingRoutes');
app.use('/api/ratings', ratingRoutes);

// Error Handler
app.use((err, req, res, next) => {
  res.status(res.statusCode === 200 ? 500 : res.statusCode).json({
    success: false,
    message: err.message
  });
});

describe('Ratings & Feedback API Endpoints (Double-Blind)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/ratings', () => {
    it('should allow student to submit review if application status is Completed', async () => {
      const studentToken = jwt.sign({ id: 'student_123', role: 'student' }, 'fallback_secret_key');
      
      Internship.findById.mockResolvedValue({
        _id: 'internship_abc',
        recruiterId: 'recruiter_789'
      });

      // Application is Completed
      Application.findOne.mockResolvedValue({
        _id: 'app_123',
        status: 'Completed'
      });

      Rating.findOne.mockResolvedValue(null); // No existing review
      Rating.create.mockResolvedValue({
        _id: 'rating_new',
        reviewerId: 'student_123',
        revieweeId: 'recruiter_789',
        rating: 5
      });

      const response = await request(app)
        .post('/api/ratings')
        .set('Cookie', [`token=${studentToken}`])
        .send({
          internshipId: 'internship_abc',
          revieweeId: 'recruiter_789',
          rating: 5,
          review: 'Great mentorship!'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should reject review submission if application status is not Completed', async () => {
      const studentToken = jwt.sign({ id: 'student_123', role: 'student' }, 'fallback_secret_key');

      Internship.findById.mockResolvedValue({
        _id: 'internship_abc',
        recruiterId: 'recruiter_789'
      });

      // Application is Accepted (Not Completed)
      Application.findOne.mockResolvedValue(null); // findOne returns null for Completed search

      const response = await request(app)
        .post('/api/ratings')
        .set('Cookie', [`token=${studentToken}`])
        .send({
          internshipId: 'internship_abc',
          revieweeId: 'recruiter_789',
          rating: 5
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('after it has been marked as Completed');
    });
  });

  describe('GET /api/ratings/status', () => {
    it('should return reviews status and enforce double-blind mask details', async () => {
      const studentToken = jwt.sign({ id: 'student_123', role: 'student' }, 'fallback_secret_key');

      Internship.findById.mockResolvedValue({
        _id: 'internship_abc',
        recruiterId: 'recruiter_789'
      });

      const mockStudentRating = {
        internshipId: 'internship_abc',
        reviewerId: 'student_123',
        revieweeId: 'recruiter_789',
        type: 'StudentToCompany',
        rating: 5,
        review: 'Excellent!'
      };

      // Mock only student has reviewed
      Rating.findOne
        .mockImplementationOnce(() => ({
          lean: () => Promise.resolve(mockStudentRating)
        })) // StudentRating call
        .mockImplementationOnce(() => ({
          lean: () => Promise.resolve(null)
        })); // RecruiterRating call

      const response = await request(app)
        .get('/api/ratings/status?internshipId=internship_abc&studentId=student_123')
        .set('Cookie', [`token=${studentToken}`]);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.studentReviewed).toBe(true);
      expect(response.body.data.recruiterReviewed).toBe(false);
      // Student can see their own review content even if recruiter hasn't reviewed yet
      expect(response.body.data.studentReview).not.toBeNull();
      // Recruiter review is null
      expect(response.body.data.recruiterReview).toBeNull();
    });
  });
});
