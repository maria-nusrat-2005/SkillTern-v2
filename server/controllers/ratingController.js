const Rating = require('../models/Rating');
const Application = require('../models/Application');
const Internship = require('../models/Internship');
const User = require('../models/User');

/**
 * @desc    Submit rating and review for an internship
 * @route   POST /api/ratings
 * @access  Private (Student to Company or Company to Student)
 */
const createReview = async (req, res, next) => {
  try {
    const { internshipId, revieweeId, rating, review } = req.body;
    const reviewerId = req.user.id;
    const reviewerRole = req.user.role;

    // Validate rating range
    if (!rating || rating < 1 || rating > 5) {
      res.status(400);
      return next(new Error('Rating must be between 1 and 5.'));
    }

    const internship = await Internship.findById(internshipId);
    if (!internship) {
      res.status(404);
      return next(new Error('Internship not found.'));
    }

    let type = '';
    if (reviewerRole === 'student') {
      // Students review recruiters
      type = 'StudentToCompany';

      // Verify application status is Completed
      const application = await Application.findOne({
        internshipId,
        studentId: reviewerId,
        status: 'Completed'
      });

      if (!application) {
        res.status(400);
        return next(new Error('You can only review an internship after it has been marked as Completed.'));
      }

      // Verify reviewee matches recruiter ID of the internship
      if (internship.recruiterId.toString() !== revieweeId) {
        res.status(400);
        return next(new Error('Invalid reviewee. You must review the recruiter who posted the internship.'));
      }

    } else if (reviewerRole === 'recruiter') {
      // Recruiters review students
      type = 'CompanyToStudent';

      // Verify the recruiter owns this internship
      if (internship.recruiterId.toString() !== reviewerId) {
        res.status(403);
        return next(new Error('Not authorized. You can only review students who completed internships posted by you.'));
      }

      // Verify student completed the internship
      const application = await Application.findOne({
        internshipId,
        studentId: revieweeId,
        status: 'Completed'
      });

      if (!application) {
        res.status(400);
        return next(new Error('You can only review a student after their internship is marked as Completed.'));
      }
    } else {
      res.status(403);
      return next(new Error('Administrators cannot submit reviews.'));
    }

    // Check for duplicate reviews (prevent multiple submissions)
    const existingRating = await Rating.findOne({ internshipId, reviewerId });
    if (existingRating) {
      res.status(400);
      return next(new Error('You have already submitted a review for this internship.'));
    }

    // Create review
    const newRating = await Rating.create({
      internshipId,
      reviewerId,
      revieweeId,
      type,
      rating,
      review: review || ''
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully.',
      data: newRating
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get reviews for a specific internship (Student reviews of company)
 * @route   GET /api/ratings/internship/:internshipId
 * @access  Public (Enforces double-blind rules)
 */
const getInternshipReviews = async (req, res, next) => {
  try {
    const { internshipId } = req.params;

    // Find StudentToCompany reviews for the internship
    const reviews = await Rating.find({ internshipId, type: 'StudentToCompany' })
      .populate('reviewerId', 'name profileImage')
      .lean();

    const visibleReviews = [];

    for (const r of reviews) {
      const isOwner = req.user && req.user.id === r.reviewerId._id.toString();

      if (isOwner) {
        // Reviewer can always see their own review
        visibleReviews.push(r);
      } else {
        // Check if corresponding recruiter-to-student review exists to unlock double-blind
        const partnerReview = await Rating.findOne({
          internshipId: r.internshipId,
          reviewerId: r.revieweeId, // Recruiter
          revieweeId: r.reviewerId._id, // Student
          type: 'CompanyToStudent'
        });

        if (partnerReview) {
          visibleReviews.push(r);
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'Reviews retrieved successfully.',
      data: visibleReviews
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get reviews received by a user (Student or Recruiter)
 * @route   GET /api/ratings/user/:userId
 * @access  Public (Enforces double-blind rules)
 */
const getUserReviews = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const reviews = await Rating.find({ revieweeId: userId })
      .populate('reviewerId', 'name profileImage')
      .lean();

    const visibleReviews = [];

    for (const r of reviews) {
      const isOwner = req.user && req.user.id === r.reviewerId._id.toString();

      if (isOwner) {
        // Reviewer can always see their own review
        visibleReviews.push(r);
      } else {
        // Determine the required partner review type to unlock feedback
        const partnerType = r.type === 'StudentToCompany' ? 'CompanyToStudent' : 'StudentToCompany';

        const partnerReview = await Rating.findOne({
          internshipId: r.internshipId,
          reviewerId: r.revieweeId, // The person who was reviewed (reviewee)
          revieweeId: r.reviewerId._id, // The person who reviewed (reviewer)
          type: partnerType
        });

        if (partnerReview) {
          visibleReviews.push(r);
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'Reviews retrieved successfully.',
      data: visibleReviews
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get double-blind review status for student-internship pair
 * @route   GET /api/ratings/status
 * @access  Private
 */
const getReviewStatus = async (req, res, next) => {
  try {
    const { internshipId, studentId } = req.query;

    if (!internshipId || !studentId) {
      res.status(400);
      return next(new Error('internshipId and studentId are required.'));
    }

    const internship = await Internship.findById(internshipId);
    if (!internship) {
      res.status(404);
      return next(new Error('Internship not found.'));
    }

    const isStudent = req.user.id === studentId;
    const isRecruiter = req.user.id === internship.recruiterId.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isStudent && !isRecruiter && !isAdmin) {
      res.status(403);
      return next(new Error('Not authorized to view review status.'));
    }

    const [studentRating, recruiterRating] = await Promise.all([
      Rating.findOne({ internshipId, reviewerId: studentId, type: 'StudentToCompany' }).lean(),
      Rating.findOne({ internshipId, reviewerId: internship.recruiterId, revieweeId: studentId, type: 'CompanyToStudent' }).lean()
    ]);

    const studentReviewed = !!studentRating;
    const recruiterReviewed = !!recruiterRating;
    const bothReviewed = studentReviewed && recruiterReviewed;

    // Filter detail content based on double-blind completion rules
    let studentReviewData = null;
    if (studentRating) {
      if (bothReviewed || req.user.id === studentId || isAdmin) {
        studentReviewData = studentRating;
      }
    }

    let recruiterReviewData = null;
    if (recruiterRating) {
      if (bothReviewed || req.user.id === internship.recruiterId.toString() || isAdmin) {
        recruiterReviewData = recruiterRating;
      }
    }

    res.status(200).json({
      success: true,
      message: 'Review status retrieved successfully.',
      data: {
        studentReviewed,
        recruiterReviewed,
        studentReview: studentReviewData,
        recruiterReview: recruiterReviewData
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getInternshipReviews,
  getUserReviews,
  getReviewStatus
};
