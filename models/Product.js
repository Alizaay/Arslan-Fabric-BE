const mongoose = require('mongoose');

const sizeInventorySchema = new mongoose.Schema(
  {
    size: String,
    quantity: { type: Number, default: 0 },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    articleCode: { type: String, required: true, unique: true },
    description: String,
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    productType: String,
    pieceType: String,
    fabric: String,
    color: String,
    season: String,
    price: { type: Number, required: true },
    salePrice: Number,
    stock: { type: Number, default: 0 },
    sizeInventory: [sizeInventorySchema],
    images: [String],
    tags: [String],
    featured: { type: Boolean, default: false },
    newArrival: { type: Boolean, default: false },
    showOnWebsite: { type: Boolean, default: true },
    availabilityStatus: {
      type: String,
      enum: ['in_stock', 'low_stock', 'out_of_stock'],
      default: 'in_stock',
    },
    ratingAvg: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
