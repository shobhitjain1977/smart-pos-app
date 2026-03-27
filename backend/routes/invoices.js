const express = require('express');
const PDFDocument = require('pdfkit');
const Invoice = require('../models/Invoice');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all invoices
router.get('/', auth, async (req, res) => {
  try {
    const { startDate, endDate, paymentStatus, customerId } = req.query;
    let query = { userId: req.userId };

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    if (customerId) {
      query.customerId = customerId;
    }

    const invoices = await Invoice.find(query)
      .populate('customerId', 'name phone email')
      .sort({ createdAt: -1 });

    res.json({ invoices });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single invoice
router.get('/:id', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      userId: req.userId
    }).populate('customerId', 'name phone email address');

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json({ invoice });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create invoice
router.post('/', auth, async (req, res) => {
  try {
    const { items, customerId, paymentMethod, paymentStatus, notes, discountAmount } = req.body;

    // ✅ ADD THIS LINE HERE 👇
    const invoiceNumber = `INV-${Date.now()}`;

    // Calculate totals
    let subtotal = 0;
    let taxAmount = 0;

    const processedItems = await Promise.all(items.map(async (item) => {
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      const itemSubtotal = item.quantity * item.price;
      const itemTax = (itemSubtotal * (item.taxRate || 0)) / 100;
      const itemTotal = itemSubtotal + itemTax - (item.discount || 0);

      subtotal += itemSubtotal;
      taxAmount += itemTax;

      // Update product stock
      product.stock -= item.quantity;
      await product.save();

      return {
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        price: item.price,
        taxRate: item.taxRate || 0,
        discount: item.discount || 0,
        total: itemTotal
      };
    }));

    const totalAmount = subtotal + taxAmount - (discountAmount || 0);

    // Get customer details
    let customerData = {};
    if (customerId) {
      const customer = await Customer.findById(customerId);
      if (customer) {
        customerData = {
          customerId: customer._id,
          customerName: customer.name,
          customerPhone: customer.phone,
          customerEmail: customer.email
        };

        // Update customer stats
        customer.totalPurchases += totalAmount;
        customer.lastPurchaseDate = new Date();
        await customer.save();
      }
    }

    const invoice = new Invoice({
      invoiceNumber, // ✅ ADD THIS LINE
      ...customerData,
      items: processedItems,
      subtotal,
      taxAmount,
      discountAmount: discountAmount || 0,
      totalAmount,
      paymentMethod: paymentMethod || 'cash',
      paymentStatus: paymentStatus || 'paid',
      notes,
      userId: req.userId
    });

    await invoice.save();
    res.status(201).json({ invoice });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Generate PDF
router.get('/:id/pdf', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      userId: req.userId
    }).populate('userId', 'name businessName email');

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);

    doc.pipe(res);

    // Header
    doc.fontSize(20).text(invoice.userId.businessName || 'Smart POS', 50, 50);
    doc.fontSize(10).text(invoice.userId.email, 50, 75);
    
    doc.fontSize(16).text('INVOICE', 400, 50);
    doc.fontSize(10).text(`#${invoice.invoiceNumber}`, 400, 70);
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 400, 85);

    // Customer details
    doc.fontSize(12).text('Bill To:', 50, 120);
    doc.fontSize(10).text(invoice.customerName || 'Walk-in Customer', 50, 140);
    if (invoice.customerPhone) doc.text(invoice.customerPhone, 50, 155);
    if (invoice.customerEmail) doc.text(invoice.customerEmail, 50, 170);

    // Table header
    const tableTop = 220;
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Item', 50, tableTop);
    doc.text('Qty', 250, tableTop);
    doc.text('Price', 320, tableTop);
    doc.text('Tax', 390, tableTop);
    doc.text('Total', 460, tableTop);

    // Table rows
    doc.font('Helvetica');
    let yPosition = tableTop + 20;

    invoice.items.forEach((item) => {
      doc.text(item.productName, 50, yPosition, { width: 190 });
      doc.text(item.quantity, 250, yPosition);
      doc.text(`₹${item.price.toFixed(2)}`, 320, yPosition);
      doc.text(`${item.taxRate}%`, 390, yPosition);
      doc.text(`₹${item.total.toFixed(2)}`, 460, yPosition);
      yPosition += 25;
    });

    // Totals
    yPosition += 20;
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Subtotal:', 350, yPosition);
    doc.text(`₹${invoice.subtotal.toFixed(2)}`, 460, yPosition, { align: 'right' });

    yPosition += 20;
    doc.text('Tax:', 350, yPosition);
    doc.text(`₹${invoice.taxAmount.toFixed(2)}`, 460, yPosition, { align: 'right' });

    if (invoice.discountAmount > 0) {
      yPosition += 20;
      doc.text('Discount:', 350, yPosition);
      doc.text(`-₹${invoice.discountAmount.toFixed(2)}`, 460, yPosition, { align: 'right' });
    }

    yPosition += 20;
    doc.fontSize(12).text('Total:', 350, yPosition);
    doc.text(`₹${invoice.totalAmount.toFixed(2)}`, 460, yPosition, { align: 'right' });

    // Footer
    doc.fontSize(10).font('Helvetica').text(
      'Thank you for your business!',
      50,
      700,
      { align: 'center' }
    );

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update invoice status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { paymentStatus },
      { new: true }
    );

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json({ invoice });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete invoice
router.delete('/:id', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
