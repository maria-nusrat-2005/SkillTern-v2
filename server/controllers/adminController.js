const RecruiterProfile = require('../models/RecruiterProfile');

/**
 * @desc    List all recruiters for admin verification dashboard
 * @route   GET /api/admin/recruiters
 * @access  Private (Admin only)
 */
const listRecruiters = async (req, res, next) => {
  try {
    const recruiters = await RecruiterProfile.find()
      .populate('userId', 'name email role profileImage')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      message: 'Recruiter profiles retrieved successfully.',
      data: recruiters
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify recruiter profile
 * @route   PUT /api/admin/recruiters/:userId/verify
 * @access  Private (Admin only)
 */
const verifyRecruiter = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const recruiterProfile = await RecruiterProfile.findOne({ userId });

    if (!recruiterProfile) {
      res.status(404);
      return next(new Error('Recruiter profile not found.'));
    }

    recruiterProfile.verified = true;
    const updatedProfile = await recruiterProfile.save();

    res.status(200).json({
      success: true,
      message: 'Recruiter profile verified successfully.',
      data: updatedProfile
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listRecruiters,
  verifyRecruiter
};
