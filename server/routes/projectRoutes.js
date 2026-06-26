const express = require('express');
const router = express.Router();
const yup = require('yup');
const { createProject, getProjects, updateProject, deleteProject } = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const projectSchema = yup.object({
  title: yup.string().required('Project title is required').trim(),
  description: yup.string().required('Project description is required').trim(),
  technologies: yup.array().of(yup.string().trim()).required('Technologies array is required'),
  githubUrl: yup.string().trim().url('Invalid GitHub URL'),
  liveUrl: yup.string().trim().url('Invalid Live Demo URL').nullable().optional(),
});

const updateProjectSchema = yup.object({
  title: yup.string().trim(),
  description: yup.string().trim(),
  technologies: yup.array().of(yup.string().trim()),
  githubUrl: yup.string().trim().url('Invalid GitHub URL'),
  liveUrl: yup.string().trim().url('Invalid Live Demo URL').nullable().optional(),
});

router.use(protect);
router.use(authorize('student'));

router.post('/', validate(projectSchema), createProject);
router.get('/', getProjects);
router.put('/:id', validate(updateProjectSchema), updateProject);
router.delete('/:id', deleteProject);

module.exports = router;
