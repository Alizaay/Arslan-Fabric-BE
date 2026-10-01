const express = require('express');
const Setting = require('../models/Setting');
const DeliverySettings = require('../models/DeliverySettings');
const DeliveryArea = require('../models/DeliveryArea');

const router = express.Router();

router.get('/public', async (req, res) => {
  try {
    const settings = await Setting.find();
    const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    const delivery = (await DeliverySettings.findOne()) || {};
    const areas = await DeliveryArea.find({ isActive: true });
    res.json({ ...map, delivery, areas });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
