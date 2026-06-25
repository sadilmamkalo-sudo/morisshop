const mongoose = require('mongoose');

const liveChatSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  messages: [{
    sender: { type: String, enum: ['user', 'admin'], required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  status: { type: String, enum: ['open', 'closed'], default: 'open' }
}, { timestamps: true });

module.exports = mongoose.model('LiveChat', liveChatSchema);
