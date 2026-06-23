const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, admin } = require('../middleware/auth');
const { uploadEventImage } = require('../controllers/uploadController');

// Store files in memory (Buffer) — we stream them straight to Cloudinary
// without touching the filesystem. 5 MB limit is generous for event posters.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Only admins can upload event images
router.post('/image', protect, admin, upload.single('image'), uploadEventImage);

module.exports = router;
