const mongoose = require('mongoose');

const deliverySettingsSchema = new mongoose.Schema(
  {
    standardCharge: { type: Number, default: 250 },
    freeShippingEnabled: { type: Boolean, default: true },
    freeShippingMin: { type: Number, default: 10000 },
    billingType: { type: String, enum: ['flat', 'city'], default: 'city' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DeliverySettings', deliverySettingsSchema);
