const StudentProfile = require('../models/StudentProfile');
const Internship = require('../models/Internship');
const MatchRecord = require('../models/MatchRecord');
const Project = require('../models/Project');
const RecommendationHistory = require('../models/RecommendationHistory');
const matchingService = require('../services/matchingService');

/**
 * @desc    Get matching internships recommendations feed for the logged-in student (Legacy Endpoint)
 * @route   GET /api/matches
 * @access  Private (student only)
 */
const getDashboardMatches = async (req, res, next) => {
  try {
    const recommendations = await matchingService.getRecsForStudent(req.user.id);
    
    res.status(200).json({
      success: true,
      message: 'Recommendations retrieved successfully.',
      data: recommendations
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get detailed match analysis and skill gap report for a specific internship (Legacy Endpoint)
 * @route   GET /api/matches/:internshipId
 * @access  Private (student only)
 */
const getMatchAnalysis = async (req, res, next) => {
  try {
    const { internshipId } = req.params;

    const [studentProfile, projects, internship] = await Promise.all([
      StudentProfile.findOne({ userId: req.user.id }).lean(),
      Project.find({ studentId: req.user.id }).lean(),
      Internship.findById(internshipId).lean()
    ]);

    if (!studentProfile) {
      res.status(404);
      return next(new Error('Student profile not found. Please complete profile onboarding.'));
    }

    if (!internship) {
      res.status(404);
      return next(new Error('Internship not found.'));
    }

    const analysis = matchingService.calculateScore(studentProfile, projects, internship);

    // Sync match records cache
    await MatchRecord.findOneAndUpdate(
      { studentId: req.user.id, internshipId: internship._id },
      {
        score: analysis.score,
        matchedSkills: analysis.matchedSkills,
        missingSkills: analysis.missingSkills,
        explanation: analysis.explanation,
        recommendationReason: analysis.explanation,
        improvementSuggestions: analysis.improvementSuggestions
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Match analysis retrieved successfully.',
      data: {
        internshipId: internship._id,
        title: internship.title,
        score: analysis.score,
        matchedSkills: analysis.matchedSkills,
        missingSkills: analysis.missingSkills,
        recommendationReason: analysis.explanation,
        explanation: analysis.explanation,
        potentialImprovements: analysis.improvementSuggestions, // legacy key
        improvementSuggestions: analysis.improvementSuggestions
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get recommendations feed
 * @route   GET /api/recommendations
 * @access  Private (student only)
 */
const getDashboardRecommendations = async (req, res, next) => {
  try {
    const recommendations = await matchingService.getRecsForStudent(req.user.id);
    
    // Save to history
    if (recommendations.length > 0) {
      await RecommendationHistory.create({
        studentId: req.user.id,
        recommendedInternships: recommendations.slice(0, 5).map(r => ({
          internshipId: r._id,
          score: r.match.score
        }))
      });
    }

    res.status(200).json({
      success: true,
      message: 'Recommendations feed retrieved.',
      data: recommendations
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get recommendation details by internship ID
 * @route   GET /api/recommendations/:id
 * @access  Private (student only)
 */
const getRecommendationDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [studentProfile, projects, internship] = await Promise.all([
      StudentProfile.findOne({ userId: req.user.id }).lean(),
      Project.find({ studentId: req.user.id }).lean(),
      Internship.findById(id).lean()
    ]);

    if (!studentProfile || !internship) {
      res.status(404);
      return next(new Error('Required details not found.'));
    }

    const analysis = matchingService.calculateScore(studentProfile, projects, internship);

    res.status(200).json({
      success: true,
      message: 'Recommendation details retrieved.',
      data: analysis
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get historical recommendations list
 * @route   GET /api/recommendations/history
 * @access  Private (student only)
 */
const getRecommendationHistory = async (req, res, next) => {
  try {
    const history = await RecommendationHistory.find({ studentId: req.user.id })
      .populate('recommendedInternships.internshipId')
      .sort({ generatedDate: -1 })
      .lean();

    res.status(200).json({
      success: true,
      message: 'Recommendation history log retrieved.',
      data: history
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get skill gap breakdown report for an internship
 * @route   GET /api/recommendations/skill-gap/:internshipId
 * @access  Private (student only)
 */
const getSkillGapReport = async (req, res, next) => {
  try {
    const { internshipId } = req.params;
    const [studentProfile, projects, internship] = await Promise.all([
      StudentProfile.findOne({ userId: req.user.id }).lean(),
      Project.find({ studentId: req.user.id }).lean(),
      Internship.findById(internshipId).lean()
    ]);

    if (!studentProfile || !internship) {
      res.status(404);
      return next(new Error('Student profile or internship not found.'));
    }

    const analysis = matchingService.calculateScore(studentProfile, projects, internship);

    res.status(200).json({
      success: true,
      message: 'Skill gap analysis completed.',
      data: {
        internshipId: internship._id,
        title: internship.title,
        score: analysis.score,
        matchedSkills: analysis.matchedSkills,
        missingSkills: analysis.missingSkills,
        improvementSuggestions: analysis.improvementSuggestions
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardMatches,
  getMatchAnalysis,
  getDashboardRecommendations,
  getRecommendationDetails,
  getRecommendationHistory,
  getSkillGapReport
};
