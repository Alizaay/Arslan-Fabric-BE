const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const DeliverySettings = require('../models/DeliverySettings');
const DeliveryArea = require('../models/DeliveryArea');
const { auth } = require('../middleware/auth');

const router = express.Router();

async function calcShipping(city, subtotal) {
  const settings = (await DeliverySettings.findOne()) || { standardCharge: 250, freeShippingEnabled: true, freeShippingMin: 10000 };
  if (settings.freeShippingEnabled && subtotal >= settings.freeShippingMin) return 0;
  if (settings.billingType === 'city' && city) {
    const area = await DeliveryArea.findOne({ city: new RegExp(`^${city}$`, 'i'), isActive: true });
    if (area) return area.charge;
  }
  return settings.standardCharge;
}

function nextOrderNumber() {
  return `#AF${Math.floor(1000 + Math.random() * 9000)}`;
}

router.post('/', async (req, res) => {
  try {
    const { email, items, shippingAddress, paymentMethod, userId } = req.body;
    if (!items?.length) return res.status(400).json({ message: 'Cart is empty' });

    const orderItems = [];
    let subtotal = 0;
    for (const line of items) {
      const product = await Product.findById(line.productId);
      if (!product) continue;
      const qty = line.quantity || 1;
      const price = product.salePrice || product.price;
      subtotal += price * qty;
      orderItems.push({
        product: product._id,
        name: product.name,
        sku: product.articleCode,
        size: line.size,
        color: line.color || product.color,
        quantity: qty,
        price,
        image: product.images?.[0],
      });
    }

    const shipping = await calcShipping(shippingAddress?.city, subtotal);
    const tax = 0;
    const discount = 0;
    const total = subtotal + shipping + tax - discount;

    const order = await Order.create({
      orderNumber: nextOrderNumber(),
      user: userId || undefined,
      customerName: `${shippingAddress?.firstName || ''} ${shippingAddress?.lastName || ''}`.trim(),
      customerEmail: email,
      customerPhone: shippingAddress?.phone,
      items: orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      status: 'new',
      subtotal,
      shipping,
      tax,
      discount,
      total,
      timeline: [
        { status: 'placed', title: 'Order placed', detail: 'Awaiting confirmation' },
      ],
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/track', async (req, res) => {
  try {
    const { orderNumber, email, phone } = req.query;
    if (!orderNumber) return res.status(400).json({ message: 'Order number required' });
    const order = await Order.findOne({ orderNumber }).populate('items.product');
    if (!order) return res.status(404).json({ message: "We couldn't find that order." });
    const contact = (email || phone || '').toLowerCase();
    const matchEmail = order.customerEmail?.toLowerCase() === contact;
    const matchPhone = order.customerPhone?.includes(phone || '');
    if (contact && !matchEmail && !matchPhone) {
      return res.status(404).json({ message: "We couldn't find that order." });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/mine', auth(), async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(orders);
});

module.exports = router;
