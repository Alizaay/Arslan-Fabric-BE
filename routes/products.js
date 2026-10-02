const express = require('express');
const Product = require('../models/Product');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const filter = { showOnWebsite: true };
    const Category = require('../models/Category');

    if (req.query.categorySlug) {
      const cat = await Category.findOne({ slug: req.query.categorySlug, websiteStatus: 'showing' });
      if (cat) filter.category = cat._id;
      else return res.json([]);
    } else if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.tag) filter.tags = req.query.tag;
    if (req.query.pieceType) filter.pieceType = req.query.pieceType;
    if (req.query.productType) filter.productType = new RegExp(req.query.productType, 'i');
    if (req.query.fabric) filter.fabric = new RegExp(req.query.fabric, 'i');
    if (req.query.featured === 'true') filter.featured = true;
    if (req.query.newArrival === 'true') filter.newArrival = true;
    if (req.query.sale === 'true') filter.salePrice = { $gt: 0 };
    if (req.query.search) {
      filter.$or = [
        { name: new RegExp(req.query.search, 'i') },
        { articleCode: new RegExp(req.query.search, 'i') },
      ];
    }

    let products = await Product.find(filter).populate('category').sort({ createdAt: -1 });

    if (req.query.minPrice) {
      products = products.filter((p) => (p.salePrice || p.price) >= Number(req.query.minPrice));
    }
    if (req.query.maxPrice) {
      products = products.filter((p) => (p.salePrice || p.price) <= Number(req.query.maxPrice));
    }
    if (req.query.sort === 'price-asc') {
      products.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
    } else if (req.query.sort === 'price-desc') {
      products.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
    }

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');
    if (!product || !product.showOnWebsite) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
