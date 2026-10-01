const mongoose = require('mongoose');

const deliveryAreaSchema = new mongoose.Schema(
  {
    city: { type: String, required: true, unique: true },
    charge: { type: Number, required: true },
    estimatedTime: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DeliveryArea', deliveryAreaSchema);
