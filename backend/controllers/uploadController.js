const { uploadImage, isCloudinaryConfigured } = require('../config/cloudinary');

/**
 * POST /api/upload/image
 * Accepts a multipart/form-data file (field name: "image").
 * Returns { url } on success.
 *
 * If Cloudinary is not configured (dev / no .env), falls back to returning
 * a placeholder so the admin form still works end-to-end without a cloud
 * account.
 */
exports.uploadEventImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    // File type guard (multer fileFilter handles this too, but belt-and-braces)
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ success: false, message: 'Only image files are allowed' });
    }

    if (!isCloudinaryConfigured()) {
      // Demo fallback — return an Unsplash placeholder so the form still works
      const placeholders = [
        'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
        'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800',
        'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
        'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800',
      ];
      const url = placeholders[Math.floor(Math.random() * placeholders.length)];
      return res.json({
        success: true,
        url,
        demo: true,
        message: 'Cloudinary not configured — using placeholder. Set CLOUDINARY_* env vars for real uploads.',
      });
    }

    const url = await uploadImage(req.file.buffer, 'encorehub/events');
    res.json({ success: true, url });
  } catch (err) {
    console.error('Image upload error:', err);
    res.status(500).json({ success: false, message: 'Image upload failed: ' + err.message });
  }
};
