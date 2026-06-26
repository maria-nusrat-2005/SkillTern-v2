const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
  internshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Internship',
    required: true,
  },
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  revieweeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['StudentToCompany', 'CompanyToStudent'],
  },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, default: '' },
}, { timestamps: true });

// Prevent duplicate reviews (one review per reviewer per internship)
RatingSchema.index({ internshipId: 1, reviewerId: 1 }, { unique: true });

module.exports = mongoose.model('Rating', RatingSchema);
