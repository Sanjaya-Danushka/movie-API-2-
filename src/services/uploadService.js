import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for images
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 2 // Max 2 files (poster and backdrop)
  }
});

// Upload middleware for single file
export const uploadSingle = (fieldName) => upload.single(fieldName);

// Upload middleware for multiple files
export const uploadMultiple = (fieldName, maxCount = 2) => upload.array(fieldName, maxCount);

// Get file URL
export const getFileUrl = (filename) => {
  return `/uploads/${filename}`;
};

// Validate uploaded file
export const validateUploadedFile = (file, required = true) => {
  if (!file && required) {
    throw new Error('File is required');
  }
  
  if (file && !file.mimetype.startsWith('image/')) {
    throw new Error('Only image files are allowed');
  }
  
  if (file && file.size > 5 * 1024 * 1024) {
    throw new Error('File size must be less than 5MB');
  }
  
  return true;
};

export default upload;
