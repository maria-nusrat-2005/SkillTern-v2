const Bookmark = require('../models/Bookmark');
const Internship = require('../models/Internship');

/**
 * @desc    Bookmark an internship posting
 * @route   POST /api/bookmarks
 * @access  Private (student only)
 */
const addBookmark = async (req, res, next) => {
  try {
    const { internshipId } = req.body;
    if (!internshipId) {
      res.status(400);
      return next(new Error('Internship ID is required.'));
    }

    const internship = await Internship.findById(internshipId);
    if (!internship) {
      res.status(404);
      return next(new Error('Internship not found.'));
    }

    // Pre-check for duplicate bookmark
    const existingBookmark = await Bookmark.findOne({ studentId: req.user.id, internshipId });
    if (existingBookmark) {
      res.status(400);
      return next(new Error('Internship is already bookmarked.'));
    }

    const bookmark = await Bookmark.create({
      studentId: req.user.id,
      internshipId
    });

    res.status(201).json({
      success: true,
      message: 'Internship bookmarked successfully.',
      data: bookmark
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all bookmarked internships
 * @route   GET /api/bookmarks
 * @access  Private (student only)
 */
const getBookmarks = async (req, res, next) => {
  try {
    const bookmarks = await Bookmark.find({ studentId: req.user.id })
      .populate({
        path: 'internshipId',
        match: { status: 'Published' }
      })
      .lean();

    // Filter out bookmarks where internship is no longer published or was hard deleted
    const activeBookmarks = bookmarks.filter(b => b.internshipId);

    res.status(200).json({
      success: true,
      message: 'Bookmarks retrieved successfully.',
      data: activeBookmarks
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove an internship bookmark
 * @route   DELETE /api/bookmarks/:id
 * @access  Private (student only)
 */
const deleteBookmark = async (req, res, next) => {
  try {
    const bookmark = await Bookmark.findOneAndDelete({
      _id: req.params.id,
      studentId: req.user.id
    });

    if (!bookmark) {
      res.status(404);
      return next(new Error('Bookmark not found or unauthorized.'));
    }

    res.status(200).json({
      success: true,
      message: 'Bookmark removed successfully.',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addBookmark,
  getBookmarks,
  deleteBookmark
};
