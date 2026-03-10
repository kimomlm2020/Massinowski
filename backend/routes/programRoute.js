import express from 'express';
import { 
  addProgram, 
  listPrograms, 
  getProgram,        // NEW - single program
  updateProgram,     // NEW - edit program
  removeProgram,
  toggleProgramStatus // NEW - soft delete
} from '../controllers/programController.js';
import adminAuth from '../middleware/adminAuth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Create uploads directory
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, 'program-' + uniqueSuffix);
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, webp) are allowed'));
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File too large (max 5MB)' });
    }
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
};

// ==================== PUBLIC ROUTES ====================

// List all active programs
router.get('/list', listPrograms);

// Get single program by ID (for detail page)
router.get('/:programId', getProgram);  // NEW

// ==================== ADMIN ROUTES ====================

// Add new program
router.post(
  '/add', 
  adminAuth, 
  upload.single('image'), 
  handleMulterError,
  addProgram
);

// Update existing program (with optional new image)
router.put(
  '/update', 
  adminAuth, 
  upload.single('image'), 
  handleMulterError,
  updateProgram  // NEW
);

// Toggle program active status (soft delete)
router.post(
  '/toggle-status', 
  adminAuth, 
  toggleProgramStatus  // NEW
);

// Hard delete program (permanent removal)
router.post(
  '/remove', 
  adminAuth, 
  removeProgram
);

export default router;