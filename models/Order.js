const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    sku: String,
    size: String,
    color: String,
    quantity: Number,
    price: Number,
    image: String,
  },
  { _id: false }
);

const timelineSchema = new mongoose.Schema(
  {
    status: String,
    title: String,
    detail: String,
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    customerName: String,
    customerEmail: String,
    customerPhone: String,
    items: [orderItemSchema],
    shippingAddress: Object,
    paymentMethod: { type: String, default: 'cod' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'cod_collected'], default: 'pending' },
    status: {
      type: String,
      enum: ['new', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'new',
    },
    courier: String,
    trackingId: String,
    subtotal: Number,
    shipping: Number,
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: Number,
    timeline: [timelineSchema],
    internalNotes: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
