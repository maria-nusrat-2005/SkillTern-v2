const mongoose = require('mongoose');

const StudentProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  university: { type: String, trim: true, default: '' },
  degree: { type: String, trim: true, default: '' },
  graduationYear: { type: Number, required: true },
  skills: [{ type: String, index: true }],
  interests: [{ type: String }],
  projects: [{
    title: { type: String, required: true },
    description: { type: String, required: true },
    technologies: [{ type: String }]
  }],
  experiences: [{
    company: { type: String, required: true },
    role: { type: String, required: true },
    startDate: { type: Date },
    endDate: { type: Date },
    duration: { type: String },
    description: { type: String }
  }],
  education: [{
    school: { type: String, required: true },
    degree: { type: String, required: true },
    fieldOfStudy: { type: String },
    startYear: { type: Number, required: true },
    endYear: { type: Number }
  }],
  cvUrl: { type: String, default: '' },
  portfolioLinks: [{ type: String }],
  githubProfile: { type: String, default: '' },
  profileCompletion: { type: Number, default: 0 },
  matchPreferences: {
    locations: [{ type: String }],
    roles: [{ type: String }],
    internshipTypes: [{ type: String, enum: ['Remote', 'Hybrid', 'On-site'] }]
  }
}, { timestamps: true });

module.exports = mongoose.model('StudentProfile', StudentProfileSchema);
