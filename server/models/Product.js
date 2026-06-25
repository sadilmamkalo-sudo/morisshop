const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['size', 'color', 'other'], default: 'other' },
  price: { type: Number },
  stock: { type: Number, default: 0 },
  image: { type: String }
});

const productSchema = new mongoose.Schema({
  name: { ar: { type: String, required: true }, fr: { type: String, required: true }, en: { type: String, required: true } },
  description: { ar: { type: String, required: true }, fr: { type: String, required: true }, en: { type: String, required: true } },
  slug: { type: String, unique: true },
  price: { type: Number, required: true },
  oldPrice: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  category: { type: String, required: true },
  images: [{ type: String }],
  variants: [variantSchema],
  stock: { type: Number, required: true, default: 0 },
  isAvailable: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  tags: [{ type: String }]
}, { timestamps: true });

productSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.name.en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
