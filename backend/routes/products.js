const express = require('express');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all products
router.get('/', auth, async (req, res) => {
  try {
    const { search, category, isActive } = req.query;
    let query = { userId: req.userId };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json({ products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single product
router.get('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create product
router.post('/', auth, async (req, res) => {
  try {
    const product = new Product({
      ...req.body,
      userId: req.userId
    });

    await product.save();
    res.status(201).json({ product });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'SKU or Barcode already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// Update product
router.put('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'SKU or Barcode already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete product
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get low stock products
router.get('/alerts/low-stock', auth, async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;
    const products = await Product.find({
      userId: req.userId,
      stock: { $lte: threshold },
      isActive: true
    }).sort({ stock: 1 });

    res.json({ products });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
