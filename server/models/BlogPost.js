const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
  title: { ar: { type: String, required: true }, fr: { type: String, required: true }, en: { type: String, required: true } },
  content: { ar: { type: String, required: true }, fr: { type: String, required: true }, en: { type: String, required: true } },
  slug: { type: String, unique: true },
  image: { type: String, default: '' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tags: [{ type: String }],
  published: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('BlogPost', blogPostSchema);
