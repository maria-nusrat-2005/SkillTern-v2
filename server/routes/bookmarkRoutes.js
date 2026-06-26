const express = require('express');
const router = express.Router();
const yup = require('yup');
const { addBookmark, getBookmarks, deleteBookmark } = require('../controllers/bookmarkController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const bookmarkSchema = yup.object({
  internshipId: yup.string().required('Internship ID is required').matches(/^[0-9a-fA-F]{24}$/, 'Invalid internship ID format'),
});

router.use(protect);
router.use(authorize('student'));

router.post('/', validate(bookmarkSchema), addBookmark);
router.get('/', getBookmarks);
router.delete('/:id', deleteBookmark);

module.exports = router;
