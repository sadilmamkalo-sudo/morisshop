const mongoose = require('mongoose');

const giftCardSchema = mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  amount: { type: Number, required: true },
  balance: { type: Number, required: true },
  senderName: { type: String },
  recipientEmail: { type: String },
  message: { type: String, maxlength: 500 },
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date },
  usedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  usedAt: { type: Date }
}, { timestamps: true });

giftCardSchema.index({ code: 1 });
giftCardSchema.index({ isActive: 1, expiresAt: 1 });

module.exports = mongoose.model('GiftCard', giftCardSchema);
