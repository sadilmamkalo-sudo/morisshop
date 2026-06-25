const mongoose = require('mongoose');

const loyaltyPointSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  points: { type: Number, default: 0 },
  lifetimePoints: { type: Number, default: 0 },
  tier: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum'], default: 'bronze' }
}, { timestamps: true });

module.exports = mongoose.model('LoyaltyPoint', loyaltyPointSchema);
