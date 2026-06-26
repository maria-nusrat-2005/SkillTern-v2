const express = require('express');
const router = express.Router();
const yup = require('yup');
const { submit, listApplications, updateStatus, getApplicationDetail, withdraw } = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

// Validation Schema for submitting an application
const submitSchema = yup.object({
  internshipId: yup.string().required('Internship ID is required'),
});

// Validation Schema for status update
const updateStatusSchema = yup.object({
  status: yup.string()
    .oneOf(
      ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Accepted', 'Completed', 'Rejected'],
      'Invalid status value'
    ),
  recruiterNotes: yup.string().trim().max(2000),
});

// Routes
router.post('/', protect, authorize('student'), validate(submitSchema), submit);
router.get('/', protect, listApplications);
router.get('/:id', protect, getApplicationDetail);
router.delete('/withdraw/:id', protect, authorize('student'), withdraw);
router.put('/:id/status', protect, authorize('recruiter'), validate(updateStatusSchema), updateStatus);

module.exports = router;
