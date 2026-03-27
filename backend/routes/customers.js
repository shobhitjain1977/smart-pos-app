const express = require('express');
const Customer = require('../models/Customer');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all customers
router.get('/', auth, async (req, res) => {
  try {
    const { search } = req.query;
    let query = { userId: req.userId };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const customers = await Customer.find(query).sort({ createdAt: -1 });
    res.json({ customers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single customer
router.get('/:id', auth, async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ customer });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create customer
router.post('/', auth, async (req, res) => {
  try {
    const customer = new Customer({
      ...req.body,
      userId: req.userId
    });

    await customer.save();
    res.status(201).json({ customer });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update customer
router.put('/:id', auth, async (req, res) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ customer });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete customer
router.delete('/:id', auth, async (req, res) => {
  try {
    const customer = await Customer.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get top customers
router.get('/analytics/top-customers', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const customers = await Customer.find({ userId: req.userId })
      .sort({ totalPurchases: -1 })
      .limit(limit);

    res.json({ customers });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
