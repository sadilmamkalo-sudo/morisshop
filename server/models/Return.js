const mongoose = require('mongoose');

const returnSchema = mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, quantity: Number, reason: String }],
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'refunded'], default: 'pending' },
  refundAmount: { type: Number, default: 0 },
  adminNote: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Return', returnSchema);
