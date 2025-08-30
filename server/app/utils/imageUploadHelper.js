const path = require('path');
const fs = require('fs');
const mime = require('mime-types');

const ensureUploadDir = (uploadDir) => {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
};

const getFileExtension = (file) => {
  console.log('getFileExtension file object:', file);
  let ext = '';
  if (file.originalname && file.originalname.lastIndexOf('.') !== -1) {
    ext = file.originalname.substring(file.originalname.lastIndexOf('.'));
  } else if (file.mimetype) {
    ext = '.' + (mime.extension(file.mimetype) || 'jpg');
  } else {
    ext = '.jpg';
  }
  return ext;
};

const sanitizeName = (name) => {
  return name
    .replace(/[^a-zA-Z0-9-_\.]/g, '_') // Replace unsafe chars
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/_+/g, '_'); // Collapse multiple underscores
};

const getUploadFilename = (file) => {
  const ext = getFileExtension(file);
  let baseName = '';
  if (file.originalname && file.originalname.lastIndexOf('.') !== -1) {
    baseName = file.originalname.substring(0, file.originalname.lastIndexOf('.'));
  } else if (file.originalname) {
    baseName = file.originalname;
  } else {
    baseName = 'file';
  }
  baseName = sanitizeName(baseName);
  return Date.now() + '-' + baseName + '-' + Math.round(Math.random() * 1E9) + ext;
};

module.exports = {
  ensureUploadDir,
  getFileExtension,
  getUploadFilename,
};
