const mongoose = require('mongoose');

const newsletterSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  content: { type: String, required: true },
  sentAt: { type: Date },
  recipients: [{ type: String }],
  totalSent: { type: Number, default: 0 },
  opened: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Newsletter', newsletterSchema);
