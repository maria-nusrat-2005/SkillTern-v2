const express = require('express');
const router = express.Router();
const {
  getDashboardRecommendations,
  getRecommendationDetails,
  getRecommendationHistory,
  getSkillGapReport
} = require('../controllers/matchController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('student'));

router.get('/', getDashboardRecommendations);
router.get('/history', getRecommendationHistory);
router.get('/skill-gap/:internshipId', getSkillGapReport);
router.get('/:id', getRecommendationDetails);

module.exports = router;
