const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true,
  },
  technologies: [{
    type: String,
    trim: true,
  }],
  githubUrl: {
    type: String,
    trim: true,
  },
  liveUrl: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

ProjectSchema.index({ studentId: 1 });
ProjectSchema.index({ technologies: 1 });

module.exports = mongoose.model('Project', ProjectSchema);
