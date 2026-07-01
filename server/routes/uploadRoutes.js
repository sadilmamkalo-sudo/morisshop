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

const handleMulter = (mw) => (req, res, next) => {
  mw(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ message: 'Image too large (max 5MB each)' });
      if (err.code === 'LIMIT_UNEXPECTED_FILE') return res.status(400).json({ message: 'Too many files at once (max 20)' });
      return res.status(400).json({ message: err.message });
    }
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
};

router.post('/', protect, adminOnly, handleMulter(upload.array('images', 20)), (req, res) => {
  const files = req.files.map(f => `/uploads/${f.filename}`);
  res.json({ images: files, message: 'Upload successful' });
});

router.post('/single', protect, adminOnly, handleMulter(upload.single('image')), (req, res) => {
  res.json({ image: `/uploads/${req.file.filename}`, message: 'Upload successful' });
});

router.post('/optimize', protect, adminOnly, handleMulter(upload.single('image')), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No image uploaded' });
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
  const outputPath = path.join(uploadDir, filename);
  await sharp(req.file.path)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(outputPath);
  fs.unlinkSync(req.file.path);
  res.json({ image: `/uploads/${filename}`, message: 'Image optimized' });
});

router.post('/bulk', protect, adminOnly, handleMulter(upload.array('images', 20)), async (req, res) => {
  const files = req.files.map(f => `/uploads/${f.filename}`);
  res.json({ images: files, message: `${files.length} files uploaded` });
});

module.exports = router;
