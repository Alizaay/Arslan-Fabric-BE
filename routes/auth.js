const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password required' });
    }
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: 'Email already registered' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      passwordHash,
      role: 'customer',
    });
    const token = signToken(user);
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user) return res.status(401).json({ message: 'Email or password is incorrect.' });
    if (user.status === 'inactive') return res.status(403).json({ message: 'Account disabled' });
    const ok = await bcrypt.compare(password || '', user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Email or password is incorrect.' });
    const token = signToken(user);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/me', require('../middleware/auth').auth(), async (req, res) => {
  const user = await User.findById(req.user.id).select('-passwordHash');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

router.patch('/me', require('../middleware/auth').auth(), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { name, phone, gender, dateOfBirth, preferences, notes } = req.body;
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (gender !== undefined) user.gender = gender;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    if (preferences) user.preferences = { ...user.preferences?.toObject?.() || user.preferences, ...preferences };
    if (notes !== undefined) user.notes = notes;
    await user.save();
    res.json(await User.findById(user._id).select('-passwordHash'));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/me/addresses', require('../middleware/auth').auth(), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (req.body.isDefault) user.addresses.forEach((a) => { a.isDefault = false; });
    user.addresses.push(req.body);
    await user.save();
    res.status(201).json(await User.findById(user._id).select('-passwordHash'));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/me/addresses/:addressId', require('../middleware/auth').auth(), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const addr = user.addresses.id(req.params.addressId);
    if (!addr) return res.status(404).json({ message: 'Address not found' });
    if (req.body.isDefault) user.addresses.forEach((a) => { a.isDefault = false; });
    Object.assign(addr, req.body);
    await user.save();
    res.json(await User.findById(user._id).select('-passwordHash'));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/me/addresses/:addressId', require('../middleware/auth').auth(), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const addr = user.addresses.id(req.params.addressId);
    if (!addr) return res.status(404).json({ message: 'Address not found' });
    user.addresses.pull(req.params.addressId);
    await user.save();
    res.json(await User.findById(user._id).select('-passwordHash'));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
