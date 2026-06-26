const express = require('express');
const router = express.Router();
const { uploadResume, updateResume, deleteResume, downloadResume } = require('../controllers/resumeController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Lock to Student role
router.use(protect);
router.use(authorize('student'));

router.post('/upload', upload, uploadResume);
router.put('/update', upload, updateResume);
router.delete('/delete', deleteResume);
router.get('/download', downloadResume);

module.exports = router;
