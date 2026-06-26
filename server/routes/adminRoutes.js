const express = require('express');
const router = express.Router();
const { listRecruiters, verifyRecruiter } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Enforce admin-only access for all recruiter moderation routes
router.use(protect);
router.use(authorize('admin'));

router.get('/recruiters', listRecruiters);
router.put('/recruiters/:userId/verify', verifyRecruiter);

module.exports = router;
