const express = require('express');
const router = express.Router();
const LoyaltyPoint = require('../models/LoyaltyPoint');
const { protect } = require('../middleware/auth');

const TIER_THRESHOLDS = { bronze: 0, silver: 500, gold: 1500, platinum: 3000 };
const POINTS_PER_DH = 1;

const getTier = (points) => {
  if (points >= 3000) return 'platinum';
  if (points >= 1500) return 'gold';
  if (points >= 500) return 'silver';
  return 'bronze';
};

router.get('/', protect, async (req, res) => {
  try {
    let lp = await LoyaltyPoint.findOne({ user: req.user._id });
    if (!lp) lp = await LoyaltyPoint.create({ user: req.user._id });
    res.json(lp);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const addPoints = async (userId, orderTotal) => {
  try {
    const points = Math.floor(orderTotal * POINTS_PER_DH);
    let lp = await LoyaltyPoint.findOne({ user: userId });
    if (!lp) lp = await LoyaltyPoint.create({ user: userId });
    lp.points += points;
    lp.lifetimePoints += points;
    lp.tier = getTier(lp.lifetimePoints);
    await lp.save();
    return lp;
  } catch (err) {
    console.error('Loyalty points error:', err.message);
  }
};

const redeemPoints = async (userId, points) => {
  try {
    let lp = await LoyaltyPoint.findOne({ user: userId });
    if (!lp || lp.points < points) return null;
    lp.points -= points;
    await lp.save();
    return points * 0.5;
  } catch (err) {
    console.error('Redeem error:', err.message);
    return null;
  }
};

module.exports = router;
module.exports.addPoints = addPoints;
module.exports.redeemPoints = redeemPoints;
