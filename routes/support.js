const express = require('express');
const SupportTicket = require('../models/SupportTicket');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/tickets', auth(), async (req, res) => {
  try {
    const ticketNumber = `#SUP-${Date.now().toString().slice(-6)}`;
    const ticket = await SupportTicket.create({
      ticketNumber,
      user: req.user.id,
      ...req.body,
      status: 'open',
    });
    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/tickets', auth(), async (req, res) => {
  const tickets = await SupportTicket.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(tickets);
});

module.exports = router;
