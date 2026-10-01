const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    label: String,
    firstName: String,
    lastName: String,
    phone: String,
    country: { type: String, default: 'Pakistan' },
    city: String,
    province: String,
    postalCode: String,
    addressLine: String,
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: String,
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    status: { type: String, enum: ['active', 'premium', 'inactive'], default: 'active' },
    storeCredit: { type: Number, default: 0 },
    addresses: [addressSchema],
    preferences: {
      emailNewsletter: { type: Boolean, default: true },
      smsTracking: { type: Boolean, default: false },
    },
    notes: String,
    gender: String,
    dateOfBirth: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
