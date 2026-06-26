const mongoose = require('mongoose');

const MatchRecordSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  internshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Internship',
    required: true,
  },
  score: { type: Number, required: true, min: 0, max: 100 },
  matchedSkills: [{ type: String }],
  missingSkills: [{ type: String }],
  recommendationReason: { type: String, default: '' },
  explanation: { type: String, default: '' },
  improvementSuggestions: [{
    skill: { type: String },
    potentialBoost: { type: Number },
    resourceUrl: { type: String },
    resourceName: { type: String }
  }]
}, { timestamps: true });

// Compound unique index: one cached score per student-internship pair
MatchRecordSchema.index({ studentId: 1, internshipId: 1 }, { unique: true });

module.exports = mongoose.model('MatchRecord', MatchRecordSchema);
