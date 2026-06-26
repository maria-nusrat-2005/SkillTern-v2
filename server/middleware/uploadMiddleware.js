const multer = require('multer');

// Store file in memory as buffer before uploading to storage CDN or writing to disk
const storage = multer.memoryStorage();

// Validate file type (Only PDF and DOCX documents accepted)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and DOCX documents are accepted.'), false);
  }
};

// Set limits (Max file size: 5MB)
const limits = {
  fileSize: 5 * 1024 * 1024 // 5MB
};

const upload = multer({
  storage,
  fileFilter,
  limits
}).single('cv');

module.exports = upload;
