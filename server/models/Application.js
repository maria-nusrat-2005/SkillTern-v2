const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  internshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Internship',
    required: true,
    index: true,
  },
  status: {
    type: String,
    default: 'Applied',
    enum: ['Applied', 'Under Review', 'Shortlisted', 'Accepted', 'Completed', 'Rejected'],
  },
  appliedAt: { type: Date, default: Date.now },
  recruiterNotes: { type: String, default: '' },
}, { timestamps: true });

// Compound unique index: prevent duplicate applications
ApplicationSchema.index({ studentId: 1, internshipId: 1 }, { unique: true });
// Compound index for recruiter applicant queries
ApplicationSchema.index({ internshipId: 1, status: 1 });

module.exports = mongoose.model('Application', ApplicationSchema);
