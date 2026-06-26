const express = require('express');
const router = express.Router();
const yup = require('yup');
const {
  list,
  getById,
  create,
  update,
  deleteInternship,
  searchInternships,
} = require('../controllers/internshipController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

// Validation Schema for creating/updating internships
const internshipSchema = yup.object({
  title: yup.string().required('Title is required').trim().max(100),
  category: yup.string().required('Category is required').trim(),
  location: yup.string().required('Location is required').trim(),
  internshipType: yup.string().required('Internship type is required')
    .oneOf(['Remote', 'Hybrid', 'On-site']),
  description: yup.string().required('Description is required')
    .min(50, 'Description must be at least 50 characters'),
  requiredSkills: yup.array().of(yup.string().trim())
    .min(1, 'At least 1 required skill is mandatory'),
  responsibilities: yup.array().of(yup.string().trim()),
  duration: yup.string().required('Duration description is required'),
  stipend: yup.string().required('Stipend description is required'),
  applicationDeadline: yup.date().required('Application deadline is required')
    .min(new Date(), 'Deadline must be in the future'),
});

// Partial schema for updates (no fields required)
const updateInternshipSchema = yup.object({
  title: yup.string().trim().max(100),
  category: yup.string().trim(),
  location: yup.string().trim(),
  internshipType: yup.string().oneOf(['Remote', 'Hybrid', 'On-site']),
  description: yup.string().min(50, 'Description must be at least 50 characters'),
  requiredSkills: yup.array().of(yup.string().trim()),
  responsibilities: yup.array().of(yup.string().trim()),
  duration: yup.string(),
  stipend: yup.string(),
  applicationDeadline: yup.date(),
  status: yup.string().oneOf(['Draft', 'Published', 'Closed', 'Archived']),
});

// Routes
router.get('/', list);
router.get('/search', searchInternships);
router.get('/:id', getById);
router.post('/', protect, authorize('recruiter'), validate(internshipSchema), create);
router.put('/:id', protect, authorize('recruiter'), validate(updateInternshipSchema), update);
router.delete('/:id', protect, authorize('recruiter', 'admin'), deleteInternship);

module.exports = router;
