const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  avatar: { type: String, default: '' },
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zip: { type: String, default: '' },
    country: { type: String, default: 'Morocco' }
  },
  role: {
    type: String,
    enum: ['client', 'admin', 'superadmin'],
    default: 'client'
  },
  permissions: [{
    type: String,
    enum: ['manage_products', 'manage_orders', 'manage_users', 'manage_admins', 'manage_coupons', 'manage_tickets', 'view_reports', 'manage_settings']
  }],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  isActive: { type: Boolean, default: true },
  lang: { type: String, enum: ['ar', 'fr', 'en'], default: 'ar' },
  theme: { type: String, enum: ['light', 'dark'], default: 'light' },
  lastLogin: Date,
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  subscription: {
    plan: { type: String, enum: ['none', 'weekly', 'monthly', 'yearly'], default: 'none' },
    startDate: Date,
    endDate: Date,
    autoRenew: { type: Boolean, default: false }
  }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.hasPermission = function(permission) {
  if (this.role === 'superadmin') return true;
  return this.permissions.includes(permission);
};

module.exports = mongoose.model('User', userSchema);
