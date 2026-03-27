const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: String,
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  taxRate: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  total: Number
});

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  customerName: String,
  customerPhone: String,
  customerEmail: String,
  items: [invoiceItemSchema],
  subtotal: {
    type: Number,
    required: true,
    default: 0
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'other'],
    default: 'cash'
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'pending', 'cancelled'],
    default: 'paid'
  },
  notes: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate invoice number before saving
invoiceSchema.pre('save', async function(next) {
  if (!this.invoiceNumber) {
    const count = await mongoose.model('Invoice').countDocuments();
    const timestamp = Date.now().toString().slice(-6);
    this.invoiceNumber = `INV-${timestamp}-${count + 1}`;
  }
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);
