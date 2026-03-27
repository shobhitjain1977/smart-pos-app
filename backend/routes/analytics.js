const express = require('express');
const Invoice = require('../models/Invoice');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Dashboard overview
router.get('/dashboard', auth, async (req, res) => {
  try {
    const { period = 'today' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setHours(0, 0, 0, 0));
    }

    // Sales statistics
    const salesData = await Invoice.aggregate([
      {
        $match: {
          userId: req.userId,
          createdAt: { $gte: startDate },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalInvoices: { $sum: 1 },
          averageOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    const sales = salesData[0] || {
      totalRevenue: 0,
      totalInvoices: 0,
      averageOrderValue: 0
    };

    // Product statistics
    const totalProducts = await Product.countDocuments({ userId: req.userId });
    const lowStockProducts = await Product.countDocuments({
      userId: req.userId,
      stock: { $lte: 10 }
    });

    // Customer statistics
    const totalCustomers = await Customer.countDocuments({ userId: req.userId });

    // Recent invoices
    const recentInvoices = await Invoice.find({ userId: req.userId })
      .populate('customerId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      sales: {
        totalRevenue: sales.totalRevenue,
        totalInvoices: sales.totalInvoices,
        averageOrderValue: sales.averageOrderValue
      },
      products: {
        total: totalProducts,
        lowStock: lowStockProducts
      },
      customers: {
        total: totalCustomers
      },
      recentInvoices
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Sales chart data
router.get('/sales-chart', auth, async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    
    const now = new Date();
    let startDate;
    let groupBy;

    if (period === 'week') {
      startDate = new Date(now.setDate(now.getDate() - 7));
      groupBy = { $dayOfMonth: '$createdAt' };
    } else if (period === 'month') {
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      groupBy = { $dayOfMonth: '$createdAt' };
    } else {
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      groupBy = { $month: '$createdAt' };
    }

    const salesByDate = await Invoice.aggregate([
      {
        $match: {
          userId: req.userId,
          createdAt: { $gte: startDate },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({ salesByDate });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Top selling products
router.get('/top-products', auth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topProducts = await Invoice.aggregate([
      {
        $match: {
          userId: req.userId,
          paymentStatus: 'paid'
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          productName: { $first: '$items.productName' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' }
        }
      },
      {
        $sort: { totalRevenue: -1 }
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    res.json({ topProducts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Revenue by payment method
router.get('/payment-methods', auth, async (req, res) => {
  try {
    const paymentStats = await Invoice.aggregate([
      {
        $match: {
          userId: req.userId,
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          totalRevenue: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({ paymentStats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
