const mongoose = require('mongoose');

const BookmarkSchema = new mongoose.Schema({
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
}, { timestamps: true });

// Compound unique index: prevent duplicate bookmarks
BookmarkSchema.index({ studentId: 1, internshipId: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', BookmarkSchema);
