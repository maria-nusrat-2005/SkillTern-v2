const RecruiterProfile = require('../models/RecruiterProfile');

/**
 * @desc    Get current recruiter's company profile
 * @route   GET /api/recruiters/profile
 * @access  Private (recruiter only)
 */
const getProfile = async (req, res, next) => {
  try {
    const profile = await RecruiterProfile.findOne({ userId: req.user.id });
    if (!profile) {
      res.status(404);
      return next(new Error('Recruiter profile not found'));
    }

    res.status(200).json({
      success: true,
      message: 'Recruiter profile retrieved successfully.',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update current recruiter's company profile
 * @route   PUT /api/recruiters/profile
 * @access  Private (recruiter only)
 */
const updateProfile = async (req, res, next) => {
  try {
    const { companyName, logo, website, industry, companyDescription } = req.body;

    const profile = await RecruiterProfile.findOne({ userId: req.user.id });
    if (!profile) {
      res.status(404);
      return next(new Error('Recruiter profile not found'));
    }

    if (companyName !== undefined) profile.companyName = companyName;
    if (logo !== undefined) profile.logo = logo;
    if (website !== undefined) profile.website = website;
    if (industry !== undefined) profile.industry = industry;
    if (companyDescription !== undefined) profile.companyDescription = companyDescription;

    const updatedProfile = await profile.save();

    res.status(200).json({
      success: true,
      message: 'Recruiter profile updated successfully.',
      data: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile };
