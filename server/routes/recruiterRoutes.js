const express = require('express');
const router = express.Router();
const yup = require('yup');
const { getProfile, updateProfile } = require('../controllers/recruiterController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

// Validation Schema for recruiter profile updates
const updateProfileSchema = yup.object({
  companyName: yup.string().trim().max(100),
  logo: yup.string().trim(),
  website: yup.string().url('Must be a valid URL').trim(),
  industry: yup.string().trim(),
  companyDescription: yup.string().trim().max(2000),
});

// Routes — all require authentication + recruiter role
router.get('/profile', protect, authorize('recruiter'), getProfile);
router.put('/profile', protect, authorize('recruiter'), validate(updateProfileSchema), updateProfile);

module.exports = router;
