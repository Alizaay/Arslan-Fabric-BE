const express = require('express');
const Wishlist = require('../models/Wishlist');
const { auth } = require('../middleware/auth');

const router = express.Router();

async function getOrCreate(userId) {
  let list = await Wishlist.findOne({ user: userId }).populate('products');
  if (!list) list = await Wishlist.create({ user: userId, products: [] });
  return list;
}

router.get('/', auth(), async (req, res) => {
  const list = await getOrCreate(req.user.id);
  res.json(list.products);
});

router.post('/', auth(), async (req, res) => {
  const { productId } = req.body;
  const list = await getOrCreate(req.user.id);
  if (!list.products.find((p) => String(p) === productId)) {
    list.products.push(productId);
    await list.save();
  }
  const populated = await Wishlist.findById(list._id).populate('products');
  res.json(populated.products);
});

router.delete('/:productId', auth(), async (req, res) => {
  const list = await getOrCreate(req.user.id);
  list.products = list.products.filter((p) => String(p._id || p) !== req.params.productId);
  await list.save();
  res.json({ ok: true });
});

module.exports = router;
