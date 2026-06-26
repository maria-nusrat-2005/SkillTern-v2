const mongoose = require('mongoose');

const InternshipSchema = new mongoose.Schema({
  recruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: { type: String, required: true, trim: true },
  category: { type: String, required: true, index: true, trim: true },
  location: { type: String, required: true, trim: true },
  internshipType: {
    type: String,
    required: true,
    enum: ['Remote', 'Hybrid', 'On-site'],
  },
  description: { type: String, required: true },
  requiredSkills: [{ type: String, index: true }],
  responsibilities: [{ type: String }],
  duration: { type: String, required: true },
  stipend: { type: String, required: true },
  applicationDeadline: { type: Date, required: true },
  status: {
    type: String,
    default: 'Draft',
    enum: ['Draft', 'Published', 'Closed', 'Archived'],
    index: true,
  },
}, { timestamps: true });

// Compound index for public feed queries (published, sorted by deadline)
InternshipSchema.index({ status: 1, applicationDeadline: -1 });

module.exports = mongoose.model('Internship', InternshipSchema);
