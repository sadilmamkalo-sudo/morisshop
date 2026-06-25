const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { protect, adminOnly } = require('../middleware/auth');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp|svg/;
  if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)) {
    cb(null, true);
  } else cb(new Error('Only images allowed (jpg, png, gif, webp, svg)'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/', protect, adminOnly, upload.array('images', 10), (req, res) => {
  try {
    const files = req.files.map(f => `/uploads/${f.filename}`);
    res.json({ images: files, message: 'Upload successful' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/single', protect, adminOnly, upload.single('image'), (req, res) => {
  try {
    res.json({ image: `/uploads/${req.file.filename}`, message: 'Upload successful' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/optimize', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image uploaded' });
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
    const outputPath = path.join(uploadDir, filename);
    await sharp(req.file.path)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath);
    fs.unlinkSync(req.file.path);
    res.json({ image: `/uploads/${filename}`, message: 'Image optimized' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/bulk', protect, adminOnly, upload.array('images', 20), async (req, res) => {
  try {
    const files = req.files.map(f => `/uploads/${f.filename}`);
    res.json({ images: files, message: `${files.length} files uploaded` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
