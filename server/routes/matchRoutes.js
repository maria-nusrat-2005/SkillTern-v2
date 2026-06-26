const express = require('express');
const router = express.Router();
const { getDashboardMatches, getMatchAnalysis } = require('../controllers/matchController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Recommend and Match Score routes (restricted to students only)
router.get('/', protect, authorize('student'), getDashboardMatches);
router.get('/:internshipId', protect, authorize('student'), getMatchAnalysis);

module.exports = router;
