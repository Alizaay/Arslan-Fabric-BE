const express = require('express');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const DeliverySettings = require('../models/DeliverySettings');
const DeliveryArea = require('../models/DeliveryArea');
const Setting = require('../models/Setting');
const Wishlist = require('../models/Wishlist');

const router = express.Router();
const admin = auth('admin');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../uploads'),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

router.get('/stats', admin, async (_req, res) => {
  const [products, orders, newOrders, customers] = await Promise.all([
    Product.countDocuments(),
    Order.countDocuments(),
    Order.countDocuments({ status: 'new' }),
    User.countDocuments({ role: 'customer' }),
  ]);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const monthOrders = await Order.find({ createdAt: { $gte: monthStart } });
  const sales = monthOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  res.json({ products, orders, newOrders, customers, sales });
});

router.get('/products', admin, async (req, res) => {
  const products = await Product.find().populate('category').sort({ createdAt: -1 });
  res.json(products);
});

router.post('/products', admin, async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
});

router.get('/products/:id', admin, async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category');
  if (!product) return res.status(404).json({ message: 'Not found' });
  res.json(product);
});

router.put('/products/:id', admin, async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(product);
});

router.delete('/products/:id', admin, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

router.get('/categories', admin, async (_req, res) => {
  const categories = await Category.find().sort({ sortOrder: 1 });
  res.json(categories);
});

router.post('/categories', admin, async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json(category);
});

router.put('/categories/:id', admin, async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(category);
});

router.delete('/categories/:id', admin, async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

router.get('/orders', admin, async (req, res) => {
  const filter = {};
  if (req.query.status && req.query.status !== 'all') filter.status = req.query.status;
  const orders = await Order.find(filter).sort({ createdAt: -1 });
  res.json(orders);
});

router.get('/orders/:id', admin, async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Not found' });
  res.json(order);
});

router.patch('/orders/:id', admin, async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Not found' });
  Object.assign(order, req.body);
  if (req.body.status) {
    order.timeline.push({
      status: req.body.status,
      title: `Status updated to ${req.body.status}`,
      detail: req.body.trackingId ? `Tracking: ${req.body.trackingId}` : '',
    });
  }
  await order.save();
  res.json(order);
});

router.get('/customers', admin, async (_req, res) => {
  const customers = await User.find({ role: 'customer' }).select('-passwordHash');
  res.json(customers);
});

router.get('/customers/:id', admin, async (req, res) => {
  const customer = await User.findById(req.params.id).select('-passwordHash');
  const orders = await Order.find({ user: req.params.id }).sort({ createdAt: -1 });
  res.json({ customer, orders });
});

router.patch('/customers/:id', admin, async (req, res) => {
  const customer = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-passwordHash');
  res.json(customer);
});

router.get('/delivery/settings', admin, async (_req, res) => {
  const settings = (await DeliverySettings.findOne()) || (await DeliverySettings.create({}));
  res.json(settings);
});

router.put('/delivery/settings', admin, async (req, res) => {
  let settings = await DeliverySettings.findOne();
  if (!settings) settings = await DeliverySettings.create(req.body);
  else Object.assign(settings, req.body), await settings.save();
  res.json(settings);
});

router.get('/delivery/areas', admin, async (_req, res) => {
  res.json(await DeliveryArea.find().sort({ city: 1 }));
});

router.post('/delivery/areas', admin, async (req, res) => {
  res.status(201).json(await DeliveryArea.create(req.body));
});

router.put('/delivery/areas/:id', admin, async (req, res) => {
  res.json(await DeliveryArea.findByIdAndUpdate(req.params.id, req.body, { new: true }));
});

router.delete('/delivery/areas/:id', admin, async (req, res) => {
  await DeliveryArea.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

router.get('/settings', admin, async (_req, res) => {
  res.json(await Setting.find());
});

router.put('/settings', admin, async (req, res) => {
  const { key, value } = req.body;
  const setting = await Setting.findOneAndUpdate({ key }, { value }, { upsert: true, new: true });
  res.json(setting);
});

router.get('/wishlist-insights', admin, async (_req, res) => {
  const lists = await Wishlist.find().populate('products');
  const counts = {};
  lists.forEach((l) => {
    l.products.forEach((p) => {
      const id = String(p._id || p);
      counts[id] = counts[id] || { product: p, count: 0 };
      counts[id].count += 1;
    });
  });
  res.json(Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 10));
});

router.post('/upload', admin, upload.single('file'), (req, res) => {
  res.json({ url: `/uploads/${req.file.filename}` });
});

module.exports = router;
