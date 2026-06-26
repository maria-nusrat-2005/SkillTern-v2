const Resume = require('../models/Resume');
const StudentProfile = require('../models/StudentProfile');
const storageService = require('../services/storageService');

/**
 * @desc    Upload a new CV
 * @route   POST /api/resume/upload
 * @access  Private (student only)
 */
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      return next(new Error('No file uploaded. Please upload a PDF or DOCX file.'));
    }

    const fileType = req.file.originalname.endsWith('.docx') ? 'docx' : 'pdf';
    const fileSize = req.file.size;

    // Check if user already has a resume
    const existingResume = await Resume.findOne({ studentId: req.user.id });
    if (existingResume) {
      res.status(400);
      return next(new Error('Resume already exists. Use PUT /resume/update to replace it.'));
    }

    // Upload to storage
    const uploadResult = await storageService.uploadBuffer(req.file.buffer, req.file.originalname);

    // Save to Resume model
    const resume = await Resume.create({
      studentId: req.user.id,
      fileUrl: uploadResult.url,
      fileName: req.file.originalname,
      fileType,
      fileSize,
      cloudinaryId: uploadResult.publicId
    });

    // Sync student profile cvUrl
    await StudentProfile.findOneAndUpdate(
      { userId: req.user.id },
      { cvUrl: uploadResult.url }
    );

    res.status(201).json({
      success: true,
      message: 'CV uploaded successfully.',
      data: resume
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Replace current CV
 * @route   PUT /api/resume/update
 * @access  Private (student only)
 */
const updateResume = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      return next(new Error('No file uploaded. Please select a replacement file.'));
    }

    const fileType = req.file.originalname.endsWith('.docx') ? 'docx' : 'pdf';
    const fileSize = req.file.size;

    const resume = await Resume.findOne({ studentId: req.user.id });
    if (!resume) {
      res.status(404);
      return next(new Error('No existing resume found to update. Use POST /resume/upload.'));
    }

    // Delete old file
    await storageService.deleteFile(resume.fileUrl, resume.cloudinaryId);

    // Upload new file
    const uploadResult = await storageService.uploadBuffer(req.file.buffer, req.file.originalname);

    // Update Resume record
    resume.fileUrl = uploadResult.url;
    resume.fileName = req.file.originalname;
    resume.fileType = fileType;
    resume.fileSize = fileSize;
    resume.cloudinaryId = uploadResult.publicId;
    await resume.save();

    // Sync student profile cvUrl
    await StudentProfile.findOneAndUpdate(
      { userId: req.user.id },
      { cvUrl: uploadResult.url }
    );

    res.status(200).json({
      success: true,
      message: 'CV updated successfully.',
      data: resume
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete current CV
 * @route   DELETE /api/resume/delete
 * @access  Private (student only)
 */
const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ studentId: req.user.id });
    if (!resume) {
      res.status(404);
      return next(new Error('No resume found to delete.'));
    }

    // Delete from storage
    await storageService.deleteFile(resume.fileUrl, resume.cloudinaryId);

    // Delete from database
    await Resume.deleteOne({ _id: resume._id });

    // Sync student profile cvUrl
    await StudentProfile.findOneAndUpdate(
      { userId: req.user.id },
      { cvUrl: '' }
    );

    res.status(200).json({
      success: true,
      message: 'CV deleted successfully.',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Download CV
 * @route   GET /api/resume/download
 * @access  Private (student only)
 */
const downloadResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ studentId: req.user.id });
    if (!resume) {
      res.status(404);
      return next(new Error('No resume found.'));
    }

    // Redirect to CV download URL (local path or Cloudinary link)
    res.redirect(resume.fileUrl);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadResume,
  updateResume,
  deleteResume,
  downloadResume
};
