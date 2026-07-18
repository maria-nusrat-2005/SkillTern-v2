const Application = require('../models/Application');
const Internship = require('../models/Internship');
const StudentProfile = require('../models/StudentProfile');

/**
 * @desc    Submit a new application
 * @route   POST /api/applications
 * @access  Private (student only)
 */
const submit = async (req, res, next) => {
  try {
    const { internshipId } = req.body;
    const studentId = req.user.id;

    // Verify the internship exists and is published
    const internship = await Internship.findById(internshipId);
    if (!internship) {
      res.status(404);
      return next(new Error('Internship not found'));
    }
    if (internship.status !== 'Published') {
      res.status(400);
      return next(new Error('This internship is not currently accepting applications'));
    }

    // Check application deadline
    if (new Date() > new Date(internship.applicationDeadline)) {
      res.status(400);
      return next(new Error('The application deadline for this internship has passed'));
    }

    // Check for duplicate application
    const existingApplication = await Application.findOne({ studentId, internshipId });
    if (existingApplication) {
      res.status(400);
      return next(new Error('You have already applied to this internship'));
    }

    const application = await Application.create({
      studentId,
      internshipId,
      status: 'Applied',
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully.',
      data: application,
    });
  } catch (error) {
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      res.status(400);
      return next(new Error('You have already applied to this internship'));
    }
    next(error);
  }
};

/**
 * @desc    List applications (role-aware)
 * @route   GET /api/applications
 * @access  Private
 */
const listApplications = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    let query = {};

    if (req.user.role === 'student') {
      // Students see their own applications
      query.studentId = req.user.id;
    } else if (req.user.role === 'recruiter') {
      // Recruiters see applications for their postings
      const recruiterInternships = await Internship.find(
        { recruiterId: req.user.id }
      ).select('_id').lean();

      const internshipIds = recruiterInternships.map((i) => i._id);
      query.internshipId = { $in: internshipIds };
    } else if (req.user.role === 'admin') {
      // Admin sees all applications
    }

    if (status) {
      query.status = status;
    }

    const [applications, total] = await Promise.all([
      Application.find(query)
        .populate('studentId', 'name email profileImage')
        .populate('internshipId', 'title category location recruiterId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Application.countDocuments(query),
    ]);

    // Populate student profiles for the returned applications
    const studentIds = applications.map(app => app.studentId?._id).filter(Boolean);
    const studentProfiles = await StudentProfile.find({ userId: { $in: studentIds } }).lean();
    const profileMap = {};
    studentProfiles.forEach(p => {
      profileMap[p.userId.toString()] = p;
    });

    const processedApplications = applications.map(app => {
      if (app.studentId?._id) {
        app.studentProfile = profileMap[app.studentId._id.toString()] || null;
      } else {
        app.studentProfile = null;
      }
      return app;
    });

    res.status(200).json({
      success: true,
      message: 'Applications retrieved successfully.',
      data: {
        applications: processedApplications,
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
 * @desc    Update application status (recruiter reviews)
 * @route   PUT /api/applications/:id/status
 * @access  Private (recruiter only)
 */
const updateStatus = async (req, res, next) => {
  try {
    const { status, recruiterNotes } = req.body;

    const application = await Application.findById(req.params.id)
      .populate('internshipId', 'recruiterId');

    if (!application) {
      res.status(404);
      return next(new Error('Application not found'));
    }

    // Verify the recruiter owns the internship this application belongs to
    if (application.internshipId.recruiterId.toString() !== req.user.id) {
      res.status(403);
      return next(new Error('Not authorized to update this application'));
    }

    if (status) application.status = status;
    if (recruiterNotes !== undefined) application.recruiterNotes = recruiterNotes;

    const updated = await application.save();

    res.status(200).json({
      success: true,
      message: 'Application status updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single application details
 * @route   GET /api/applications/:id
 * @access  Private (role-aware)
 */
const getApplicationDetail = async (req, res, next) => {
  try {
    const query = { _id: req.params.id };
    if (req.user.role === 'student') {
      query.studentId = req.user.id;
    } else if (req.user.role === 'recruiter') {
      const recruiterInternships = await Internship.find({ recruiterId: req.user.id }).select('_id').lean();
      const internshipIds = recruiterInternships.map(i => i._id);
      query.internshipId = { $in: internshipIds };
    }

    const application = await Application.findOne(query)
      .populate('studentId', 'name email profileImage')
      .populate('internshipId')
      .lean();

    if (!application) {
      res.status(404);
      return next(new Error('Application not found or unauthorized.'));
    }

    const studentProfile = await StudentProfile.findOne({ userId: application.studentId?._id }).lean();
    application.studentProfile = studentProfile || null;

    res.status(200).json({
      success: true,
      message: 'Application details retrieved.',
      data: application
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Withdraw application
 * @route   DELETE /api/applications/withdraw/:id
 * @access  Private (student only)
 */
const withdraw = async (req, res, next) => {
  try {
    const application = await Application.findOne({ _id: req.params.id, studentId: req.user.id });
    if (!application) {
      res.status(404);
      return next(new Error('Application not found or unauthorized.'));
    }

    await Application.deleteOne({ _id: application._id });

    res.status(200).json({
      success: true,
      message: 'Application withdrawn successfully.',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { submit, listApplications, updateStatus, getApplicationDetail, withdraw };
