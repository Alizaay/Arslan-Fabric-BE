const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    coverImage: String,
    showOnHomepage: { type: Boolean, default: false },
    navVisible: { type: Boolean, default: true },
    websiteStatus: { type: String, enum: ['showing', 'hidden'], default: 'showing' },
    sortOrder: { type: Number, default: 0 },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
