const Internship = require('../models/Internship');
const RecruiterProfile = require('../models/RecruiterProfile');
const StudentProfile = require('../models/StudentProfile');
const jwt = require('jsonwebtoken');

/**
 * @desc    List internships with pagination, search, and filters
 * @route   GET /api/internships
 * @access  Public
 */
const list = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      location,
      internshipType,
      category,
    } = req.query;

    const query = { status: 'Published' };

    // Text search on title
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    // Filter by location
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    // Filter by type
    if (internshipType) {
      query.internshipType = internshipType;
    }
    // Filter by category
    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [internships, total] = await Promise.all([
      Internship.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Internship.countDocuments(query),
    ]);

    // Check optional authentication token in cookie/headers
    let token = req.cookies.token;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    let matchedInternships = internships;
    if (token) {
      try {
        const secret = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || 'fallback_secret_key';
        const decoded = jwt.verify(token, secret);
        if (decoded && decoded.role === 'student') {
          const studentProfile = await StudentProfile.findOne({ userId: decoded.id }).lean();
          if (studentProfile) {
            const matchingService = require('../services/matchingService');
            const MatchRecord = require('../models/MatchRecord');
            
            matchedInternships = await Promise.all(internships.map(async (internship) => {
              const matchAnalysis = matchingService.calculateScore(studentProfile, internship);
              
              await MatchRecord.findOneAndUpdate(
                { studentId: decoded.id, internshipId: internship._id },
                {
                  score: matchAnalysis.score,
                  matchedSkills: matchAnalysis.matchedSkills,
                  missingSkills: matchAnalysis.missingSkills,
                  recommendationReason: matchAnalysis.recommendationReason
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
              );

              return {
                ...internship,
                match: {
                  score: matchAnalysis.score,
                  matchedSkills: matchAnalysis.matchedSkills,
                  missingSkills: matchAnalysis.missingSkills,
                  recommendationReason: matchAnalysis.recommendationReason
                }
              };
            }));
          }
        }
      } catch (err) {
        // Token invalid or expired; proceed without matching scores
      }
    }

    res.status(200).json({
      success: true,
      message: 'Internships retrieved successfully.',
      data: {
        internships: matchedInternships,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single internship by ID
 * @route   GET /api/internships/:id
 * @access  Public
 */
const getById = async (req, res, next) => {
  try {
    const internship = await Internship.findById(req.params.id).lean();
    if (!internship) {
      res.status(404);
      return next(new Error('Internship not found'));
    }

    // Populate recruiter company name for display
    const recruiterProfile = await RecruiterProfile.findOne(
      { userId: internship.recruiterId }
    ).select('companyName logo website').lean();

    // Check optional authentication token in cookie/headers
    let token = req.cookies.token;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    let matchData = null;
    if (token) {
      try {
        const secret = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || 'fallback_secret_key';
        const decoded = jwt.verify(token, secret);
        if (decoded && decoded.role === 'student') {
          const studentProfile = await StudentProfile.findOne({ userId: decoded.id }).lean();
          if (studentProfile) {
            const matchingService = require('../services/matchingService');
            const MatchRecord = require('../models/MatchRecord');
            const matchAnalysis = matchingService.calculateScore(studentProfile, internship);
            
            await MatchRecord.findOneAndUpdate(
              { studentId: decoded.id, internshipId: internship._id },
              {
                score: matchAnalysis.score,
                matchedSkills: matchAnalysis.matchedSkills,
                missingSkills: matchAnalysis.missingSkills,
                recommendationReason: matchAnalysis.recommendationReason
              },
              { upsert: true, new: true, setDefaultsOnInsert: true }
            );

            matchData = {
              score: matchAnalysis.score,
              matchedSkills: matchAnalysis.matchedSkills,
              missingSkills: matchAnalysis.missingSkills,
              recommendationReason: matchAnalysis.recommendationReason,
              potentialImprovements: matchAnalysis.potentialImprovements
            };
          }
        }
      } catch (err) {
        // Token validation failed, ignore
      }
    }

    res.status(200).json({
      success: true,
      message: 'Internship retrieved successfully.',
      data: {
        ...internship,
        company: recruiterProfile || null,
        match: matchData,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new internship posting
 * @route   POST /api/internships
 * @access  Private (recruiter only)
 */
const create = async (req, res, next) => {
  try {
    const {
      title,
      category,
      location,
      internshipType,
      description,
      requiredSkills,
      responsibilities,
      duration,
      stipend,
      applicationDeadline,
    } = req.body;

    const internship = await Internship.create({
      recruiterId: req.user.id,
      title,
      category,
      location,
      internshipType,
      description,
      requiredSkills: requiredSkills || [],
      responsibilities: responsibilities || [],
      duration,
      stipend,
      applicationDeadline,
      status: 'Draft',
    });

    res.status(201).json({
      success: true,
      message: 'Internship created successfully.',
      data: internship,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an internship posting
 * @route   PUT /api/internships/:id
 * @access  Private (recruiter owner only)
 */
const update = async (req, res, next) => {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship) {
      res.status(404);
      return next(new Error('Internship not found'));
    }

    // Ownership check
    if (internship.recruiterId.toString() !== req.user.id) {
      res.status(403);
      return next(new Error('Not authorized to update this internship'));
    }

    // Update allowed fields
    const allowedFields = [
      'title', 'category', 'location', 'internshipType',
      'description', 'requiredSkills', 'responsibilities',
      'duration', 'stipend', 'applicationDeadline', 'status',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        internship[field] = req.body[field];
      }
    });

    // Verify recruiter is verified before publishing
    if (req.body.status === 'Published') {
      const recruiterProfile = await RecruiterProfile.findOne({ userId: req.user.id });
      if (!recruiterProfile || !recruiterProfile.verified) {
        res.status(403);
        return next(new Error('Your company profile must be verified by an admin before publishing internships'));
      }
    }

    const updatedInternship = await internship.save();

    res.status(200).json({
      success: true,
      message: 'Internship updated successfully.',
      data: updatedInternship,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete (archive) an internship posting
 * @route   DELETE /api/internships/:id
 * @access  Private (recruiter owner or admin)
 */
const deleteInternship = async (req, res, next) => {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship) {
      res.status(404);
      return next(new Error('Internship not found'));
    }

    // Ownership or admin check
    const isOwner = internship.recruiterId.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      res.status(403);
      return next(new Error('Not authorized to delete this internship'));
    }

    // Soft delete by archiving
    internship.status = 'Archived';
    await internship.save();

    res.status(200).json({
      success: true,
      message: 'Internship archived successfully.',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Search internships with specific filters
 * @route   GET /api/internships/search
 * @access  Public
 */
const searchInternships = async (req, res, next) => {
  try {
    const {
      category,
      location,
      skills,
      stipend,
      duration,
      search
    } = req.query;

    const query = { status: 'Published' };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    if (duration) {
      query.duration = { $regex: duration, $options: 'i' };
    }
    if (stipend) {
      query.stipend = { $regex: stipend, $options: 'i' };
    }
    if (skills) {
      const skillsList = skills.split(',').map(s => s.trim().toLowerCase());
      query.requiredSkills = { $in: skillsList.map(s => new RegExp(s, 'i')) };
    }

    const internships = await Internship.find(query).sort({ createdAt: -1 }).lean();

    res.status(200).json({
      success: true,
      message: 'Search completed successfully.',
      data: internships
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { list, getById, create, update, deleteInternship, searchInternships };
