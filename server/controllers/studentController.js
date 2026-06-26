const StudentProfile = require('../models/StudentProfile');
const Project = require('../models/Project');
const Resume = require('../models/Resume');

/**
 * @desc    Get current student's profile
 * @route   GET /api/students/profile
 * @access  Private (student only)
 */
const getProfile = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user.id });
    if (!profile) {
      res.status(404);
      return next(new Error('Student profile not found'));
    }

    res.status(200).json({
      success: true,
      message: 'Student profile retrieved successfully.',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update current student's profile
 * @route   PUT /api/students/profile
 * @access  Private (student only)
 */
const updateProfile = async (req, res, next) => {
  try {
    const {
      university,
      degree,
      graduationYear,
      skills,
      interests,
      portfolioLinks,
      githubProfile,
    } = req.body;

    const profile = await StudentProfile.findOne({ userId: req.user.id });
    if (!profile) {
      res.status(404);
      return next(new Error('Student profile not found'));
    }

    if (university !== undefined) profile.university = university;
    if (degree !== undefined) profile.degree = degree;
    if (graduationYear !== undefined) profile.graduationYear = graduationYear;
    if (skills !== undefined) profile.skills = skills;
    if (interests !== undefined) profile.interests = interests;
    if (portfolioLinks !== undefined) profile.portfolioLinks = portfolioLinks;
    if (githubProfile !== undefined) profile.githubProfile = githubProfile;

    // Recalculate profile completion
    const projectCount = await Project.countDocuments({ studentId: req.user.id });
    const resumeExists = await Resume.exists({ studentId: req.user.id });
    
    let score = 0;
    if (profile.university && profile.degree && profile.graduationYear) score += 20;
    if (profile.skills && profile.skills.length >= 3) score += 25;
    else if (profile.skills && profile.skills.length > 0) score += (profile.skills.length / 3) * 25;
    if (projectCount > 0) score += 20;
    if (profile.experiences && profile.experiences.length > 0) score += 15;
    if (resumeExists) score += 10;
    if (profile.githubProfile || (profile.portfolioLinks && profile.portfolioLinks.length > 0)) score += 10;
    profile.profileCompletion = Math.round(score);

    const updatedProfile = await profile.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get profile completion percentage
 * @route   GET /api/students/profile-completion
 * @access  Private (student only)
 */
const getProfileCompletion = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user.id });
    if (!profile) {
      res.status(404);
      return next(new Error('Student profile not found'));
    }

    const projectCount = await Project.countDocuments({ studentId: req.user.id });
    const resumeExists = await Resume.exists({ studentId: req.user.id });

    let score = 0;
    if (profile.university && profile.degree && profile.graduationYear) score += 20;
    if (profile.skills && profile.skills.length >= 3) score += 25;
    else if (profile.skills && profile.skills.length > 0) score += (profile.skills.length / 3) * 25;
    if (projectCount > 0) score += 20;
    if (profile.experiences && profile.experiences.length > 0) score += 15;
    if (resumeExists) score += 10;
    if (profile.githubProfile || (profile.portfolioLinks && profile.portfolioLinks.length > 0)) score += 10;
    
    const finalScore = Math.round(score);
    if (profile.profileCompletion !== finalScore) {
      profile.profileCompletion = finalScore;
      await profile.save();
    }

    res.status(200).json({
      success: true,
      message: 'Profile completion computed.',
      data: {
        profileCompletion: finalScore,
        breakdown: {
          personalInfo: (profile.university && profile.degree && profile.graduationYear) ? 20 : 0,
          skills: (profile.skills && profile.skills.length >= 3) ? 25 : (profile.skills ? Math.round((profile.skills.length / 3) * 25) : 0),
          projects: projectCount > 0 ? 20 : 0,
          experience: (profile.experiences && profile.experiences.length > 0) ? 15 : 0,
          cv: resumeExists ? 10 : 0,
          portfolio: (profile.githubProfile || (profile.portfolioLinks && profile.portfolioLinks.length > 0)) ? 10 : 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add technical skill
 * @route   POST /api/students/skills
 * @access  Private (student only)
 */
const addSkill = async (req, res, next) => {
  try {
    const { skill } = req.body;
    if (!skill) {
      res.status(400);
      return next(new Error('Skill name is required'));
    }

    const profile = await StudentProfile.findOne({ userId: req.user.id });
    if (!profile) {
      res.status(404);
      return next(new Error('Student profile not found'));
    }

    const normalized = skill.trim();
    if (!profile.skills.includes(normalized)) {
      profile.skills.push(normalized);
      await profile.save();
    }

    res.status(200).json({
      success: true,
      message: 'Skill added successfully.',
      data: profile.skills
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete technical skill
 * @route   DELETE /api/students/skills/:skillName
 * @access  Private (student only)
 */
const deleteSkill = async (req, res, next) => {
  try {
    const { skillName } = req.params;

    const profile = await StudentProfile.findOne({ userId: req.user.id });
    if (!profile) {
      res.status(404);
      return next(new Error('Student profile not found'));
    }

    profile.skills = profile.skills.filter(s => s.toLowerCase() !== decodeURIComponent(skillName).toLowerCase());
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Skill deleted successfully.',
      data: profile.skills
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add categories of interests
 * @route   POST /api/students/interests
 * @access  Private (student only)
 */
const addInterests = async (req, res, next) => {
  try {
    const { interests } = req.body; // array of interests
    if (!Array.isArray(interests)) {
      res.status(400);
      return next(new Error('Interests must be an array'));
    }

    const profile = await StudentProfile.findOne({ userId: req.user.id });
    if (!profile) {
      res.status(404);
      return next(new Error('Student profile not found'));
    }

    profile.interests = interests.map(i => i.trim());
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Interests updated successfully.',
      data: profile.interests
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add work experience
 * @route   POST /api/students/experience
 * @access  Private (student only)
 */
const addExperience = async (req, res, next) => {
  try {
    const { company, role, startDate, endDate, duration, description } = req.body;
    if (!company || !role) {
      res.status(400);
      return next(new Error('Company name and role are required'));
    }

    const profile = await StudentProfile.findOne({ userId: req.user.id });
    if (!profile) {
      res.status(404);
      return next(new Error('Student profile not found'));
    }

    profile.experiences.push({
      company,
      role,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      duration,
      description
    });

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Experience entry added successfully.',
      data: profile.experiences
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add education background
 * @route   POST /api/students/education
 * @access  Private (student only)
 */
const addEducation = async (req, res, next) => {
  try {
    const { school, degree, fieldOfStudy, startYear, endYear } = req.body;
    if (!school || !degree || !startYear) {
      res.status(400);
      return next(new Error('School, degree and start year are required'));
    }

    const profile = await StudentProfile.findOne({ userId: req.user.id });
    if (!profile) {
      res.status(404);
      return next(new Error('Student profile not found'));
    }

    profile.education.push({
      school,
      degree,
      fieldOfStudy,
      startYear: parseInt(startYear, 10),
      endYear: endYear ? parseInt(endYear, 10) : undefined
    });

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Education entry added successfully.',
      data: profile.education
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getProfileCompletion,
  addSkill,
  deleteSkill,
  addInterests,
  addExperience,
  addEducation
};
