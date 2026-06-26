const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { createReview, getInternshipReviews, getUserReviews, getReviewStatus } = require('../controllers/ratingController');
const { protect } = require('../middleware/authMiddleware');

// Custom inline middleware to handle optional auth details for public double-blind queries
const optionalProtect = (req, res, next) => {
  let token = req.cookies.token;
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (token) {
    try {
      const secret = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || 'fallback_secret_key';
      const decoded = jwt.verify(token, secret);
      req.user = decoded;
    } catch (err) {
      // Proceed as guest if token is invalid or expired
    }
  }
  next();
};

// Routes configuration
router.post('/', protect, createReview);
router.get('/status', protect, getReviewStatus);
router.get('/internship/:internshipId', optionalProtect, getInternshipReviews);
router.get('/user/:userId', optionalProtect, getUserReviews);

module.exports = router;
