const express = require('express');
const router = express.Router();
const yup = require('yup');
const {
  getProfile,
  updateProfile,
  getProfileCompletion,
  addSkill,
  deleteSkill,
  addInterests,
  addExperience,
  addEducation
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

// Validation Schema for profile updates
const updateProfileSchema = yup.object({
  university: yup.string().trim(),
  degree: yup.string().trim(),
  graduationYear: yup.number().integer()
    .min(new Date().getFullYear() - 10)
    .max(new Date().getFullYear() + 10),
  skills: yup.array().of(yup.string().trim()),
  interests: yup.array().of(yup.string().trim()),
  portfolioLinks: yup.array().of(yup.string().url().trim()),
  githubProfile: yup.string().trim(),
});

const skillSchema = yup.object({
  skill: yup.string().required('Skill name is required').trim(),
});

const interestsSchema = yup.object({
  interests: yup.array().of(yup.string().trim()).required('Interests array is required'),
});

const experienceSchema = yup.object({
  company: yup.string().required('Company name is required').trim(),
  role: yup.string().required('Role is required').trim(),
  startDate: yup.date().optional(),
  endDate: yup.date().optional(),
  duration: yup.string().trim(),
  description: yup.string().trim(),
});

const educationSchema = yup.object({
  school: yup.string().required('School name is required').trim(),
  degree: yup.string().required('Degree name is required').trim(),
  fieldOfStudy: yup.string().trim(),
  startYear: yup.number().integer().required('Start year is required'),
  endYear: yup.number().integer().optional(),
});

// Student middleware stack (All require protect + student authorization)
router.use(protect);
router.use(authorize('student'));

router.get('/profile', getProfile);
router.put('/profile', validate(updateProfileSchema), updateProfile);
router.get('/profile-completion', getProfileCompletion);
router.post('/skills', validate(skillSchema), addSkill);
router.delete('/skills/:skillName', deleteSkill);
router.post('/interests', validate(interestsSchema), addInterests);
router.post('/experience', validate(experienceSchema), addExperience);
router.post('/education', validate(educationSchema), addEducation);

module.exports = router;
