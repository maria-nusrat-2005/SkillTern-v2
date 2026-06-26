const mongoose = require('mongoose');

const RecommendedItemSchema = new mongoose.Schema({
  internshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Internship',
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
});

const RecommendationHistorySchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recommendedInternships: [RecommendedItemSchema],
  generatedDate: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

RecommendationHistorySchema.index({ studentId: 1, generatedDate: -1 });

module.exports = mongoose.model('RecommendationHistory', RecommendationHistorySchema);
