const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    required: true,
    enum: ['pdf', 'docx'],
  },
  fileSize: {
    type: Number,
    required: true,
  },
  cloudinaryId: {
    type: String,
    required: true,
  },
}, { timestamps: true });


module.exports = mongoose.model('Resume', ResumeSchema);
