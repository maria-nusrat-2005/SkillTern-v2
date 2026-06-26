const mongoose = require('mongoose');

const RecruiterProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  companyName: { type: String, trim: true, default: '' },
  logo: { type: String, default: '' },
  website: { type: String, trim: true },
  industry: { type: String, trim: true },
  companyDescription: { type: String, trim: true },
  verified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('RecruiterProfile', RecruiterProfileSchema);
