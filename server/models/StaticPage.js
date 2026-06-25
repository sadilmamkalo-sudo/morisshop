const mongoose = require('mongoose');

const staticPageSchema = new mongoose.Schema({
  slug: { type: String, unique: true, required: true },
  title: { ar: { type: String, required: true }, fr: { type: String, required: true }, en: { type: String, required: true } },
  content: { ar: { type: String, required: true }, fr: { type: String, required: true }, en: { type: String, required: true } },
  published: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('StaticPage', staticPageSchema);
