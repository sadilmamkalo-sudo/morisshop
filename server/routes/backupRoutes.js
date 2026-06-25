const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { protect, superAdminOnly } = require('../middleware/auth');

const backupsDir = path.join(__dirname, '..', 'backups');
if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true });

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

router.post('/', protect, superAdminOnly, async (req, res) => {
  try {
    const collections = await mongoose.connection.db.collections();
    const data = {};
    for (const col of collections) {
      const name = col.collectionName;
      if (name.startsWith('system')) continue;
      data[name] = await col.find({}).toArray();
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.json`;
    fs.writeFileSync(path.join(backupsDir, filename), JSON.stringify(data, null, 2));
    res.status(201).json({ message: 'Backup created', filename });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', protect, superAdminOnly, async (req, res) => {
  try {
    const files = fs.readdirSync(backupsDir).filter(f => f.endsWith('.json')).map(f => {
      const stats = fs.statSync(path.join(backupsDir, f));
      return { name: f, size: stats.size, createdAt: stats.birthtime };
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(files);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/restore', protect, superAdminOnly, upload.single('backup'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No backup file uploaded' });
    const data = JSON.parse(req.file.buffer.toString());
    for (const [collectionName, documents] of Object.entries(data)) {
      if (collectionName.startsWith('system')) continue;
      const col = mongoose.connection.db.collection(collectionName);
      await col.deleteMany({});
      if (documents.length) {
        await col.insertMany(documents);
      }
    }
    res.json({ message: 'Restore completed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
