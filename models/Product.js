const mongoose = require('mongoose');
const slugify = require('slugify');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  description: { type: String },
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  category: { type: String },
  tags: [String],
  createdAt: { type: Date, default: Date.now }
});

ProductSchema.pre('validate', function(next) {
  if (this.name) this.slug = slugify(this.name, { lower: true, strict: true });
  next();
});

ProductSchema.virtual('finalPrice').get(function() {
  const disc = Math.max(0, Math.min(this.discount, 100));
  return this.price - (this.price * disc / 100);
});

module.exports = mongoose.model('Product', ProductSchema);
