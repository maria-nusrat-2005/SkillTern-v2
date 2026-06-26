const fs = require('fs/promises');
const path = require('path');
const cloudinary = require('cloudinary').v2;

const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

/**
 * Uploads file buffer. Statically falls back to writing local disk space if Cloudinary env credentials are missing.
 * @param {Buffer} fileBuffer The file buffer
 * @param {string} originalName The original file name
 * @returns {Promise<Object>} { url, publicId }
 */
const uploadBuffer = async (fileBuffer, originalName) => {
  if (isCloudinaryConfigured) {
    return new Promise((resolve, reject) => {
      const publicId = `${Date.now()}_${originalName.split('.')[0]}`;
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: 'skilltern_cvs', 
          resource_type: 'raw',
          public_id: publicId
        },
        (error, result) => {
          if (error) reject(error);
          else resolve({ url: result.secure_url, publicId: `skilltern_cvs/${publicId}` });
        }
      );
      uploadStream.end(fileBuffer);
    });
  } else {
    // Local fallback
    const uploadsDir = path.join(__dirname, '..', 'uploads', 'cv');
    await fs.mkdir(uploadsDir, { recursive: true });

    const sanitizedName = `${Date.now()}_${originalName.replace(/\s+/g, '_')}`;
    const filePath = path.join(uploadsDir, sanitizedName);

    await fs.writeFile(filePath, fileBuffer);

    return { 
      url: `/uploads/cv/${sanizedName}`, 
      publicId: filePath // use absolute path as local identifier
    };
  }
};

/**
 * Deletes a file either from Cloudinary or local file system.
 * @param {string} url - File URL or relative path
 * @param {string} publicId - Cloudinary publicId or local file path
 */
const deleteFile = async (url, publicId) => {
  try {
    if (isCloudinaryConfigured && publicId && url.startsWith('http')) {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    } else {
      // Local clean up
      const filePath = publicId || path.join(__dirname, '..', 'uploads', 'cv', path.basename(url));
      await fs.unlink(filePath).catch(() => {});
    }
  } catch (error) {
    console.error('Failed to delete file from storage:', error);
  }
};

module.exports = {
  uploadBuffer,
  deleteFile
};
