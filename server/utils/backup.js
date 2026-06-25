const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const createBackup = async () => {
  const backupsDir = path.join(__dirname, '..', 'backups');
  if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true });
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
  console.log(`Backup created: ${filename}`);
  return filename;
};

module.exports = { createBackup };
