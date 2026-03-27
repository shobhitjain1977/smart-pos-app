require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const Customer = require('./models/Customer');

// Sample data
const sampleProducts = [
  { name: 'Laptop HP ProBook', category: 'Electronics', price: 45000, cost: 40000, stock: 15, sku: 'LAP001', taxRate: 18, unit: 'pcs' },
  { name: 'Mouse Logitech M235', category: 'Electronics', price: 500, cost: 350, stock: 50, sku: 'MOU001', taxRate: 18, unit: 'pcs' },
  { name: 'Keyboard Mechanical', category: 'Electronics', price: 2500, cost: 1800, stock: 30, sku: 'KEY001', taxRate: 18, unit: 'pcs' },
  { name: 'Monitor Dell 24"', category: 'Electronics', price: 12000, cost: 10000, stock: 20, sku: 'MON001', taxRate: 18, unit: 'pcs' },
  { name: 'USB Cable Type-C', category: 'Accessories', price: 150, cost: 80, stock: 100, sku: 'USB001', taxRate: 12, unit: 'pcs' },
  { name: 'Power Bank 10000mAh', category: 'Accessories', price: 1200, cost: 800, stock: 40, sku: 'PWR001', taxRate: 18, unit: 'pcs' },
  { name: 'Phone Case iPhone', category: 'Accessories', price: 300, cost: 150, stock: 60, sku: 'PHN001', taxRate: 12, unit: 'pcs' },
  { name: 'Headphones Sony', category: 'Electronics', price: 3500, cost: 2500, stock: 25, sku: 'HDP001', taxRate: 18, unit: 'pcs' },
  { name: 'Webcam Logitech C920', category: 'Electronics', price: 6500, cost: 5000, stock: 12, sku: 'WEB001', taxRate: 18, unit: 'pcs' },
  { name: 'HDMI Cable 2m', category: 'Accessories', price: 250, cost: 120, stock: 75, sku: 'HDM001', taxRate: 12, unit: 'pcs' },
  { name: 'External HDD 1TB', category: 'Storage', price: 4000, cost: 3200, stock: 18, sku: 'HDD001', taxRate: 18, unit: 'pcs' },
  { name: 'SSD Samsung 500GB', category: 'Storage', price: 5500, cost: 4500, stock: 22, sku: 'SSD001', taxRate: 18, unit: 'pcs' },
  { name: 'Router TP-Link', category: 'Networking', price: 1800, cost: 1200, stock: 28, sku: 'ROU001', taxRate: 18, unit: 'pcs' },
  { name: 'Printer HP DeskJet', category: 'Electronics', price: 8500, cost: 7000, stock: 8, sku: 'PRT001', taxRate: 18, unit: 'pcs' },
  { name: 'Pen Drive 32GB', category: 'Storage', price: 400, cost: 250, stock: 90, sku: 'PEN001', taxRate: 18, unit: 'pcs' },
];

const sampleCustomers = [
  {
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@example.com',
    phone: '9876543210',
    address: { street: '123 MG Road', city: 'Mumbai', state: 'Maharashtra', zipCode: '400001', country: 'India' },
    gstNumber: '27AABCU9603R1ZM'
  },
  {
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    phone: '9876543211',
    address: { street: '456 Brigade Road', city: 'Bangalore', state: 'Karnataka', zipCode: '560001', country: 'India' },
    gstNumber: '29AABCU9603R1ZN'
  },
  {
    name: 'Amit Patel',
    email: 'amit.patel@example.com',
    phone: '9876543212',
    address: { street: '789 CG Road', city: 'Ahmedabad', state: 'Gujarat', zipCode: '380001', country: 'India' },
  },
  {
    name: 'Sneha Reddy',
    email: 'sneha.reddy@example.com',
    phone: '9876543213',
    address: { street: '321 Banjara Hills', city: 'Hyderabad', state: 'Telangana', zipCode: '500034', country: 'India' },
    gstNumber: '36AABCU9603R1ZO'
  },
  {
    name: 'Vikram Singh',
    email: 'vikram.singh@example.com',
    phone: '9876543214',
    address: { street: '654 Connaught Place', city: 'Delhi', state: 'Delhi', zipCode: '110001', country: 'India' },
  },
  {
    name: 'Ananya Iyer',
    email: 'ananya.iyer@example.com',
    phone: '9876543215',
    address: { street: '987 T Nagar', city: 'Chennai', state: 'Tamil Nadu', zipCode: '600017', country: 'India' },
    gstNumber: '33AABCU9603R1ZP'
  },
  {
    name: 'Ravi Verma',
    email: 'ravi.verma@example.com',
    phone: '9876543216',
    address: { street: '147 Park Street', city: 'Kolkata', state: 'West Bengal', zipCode: '700016', country: 'India' },
  },
  {
    name: 'Kavya Nair',
    email: 'kavya.nair@example.com',
    phone: '9876543217',
    address: { street: '258 Marine Drive', city: 'Kochi', state: 'Kerala', zipCode: '682011', country: 'India' },
  },
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-pos', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Customer.deleteMany({});
    console.log('✅ Existing data cleared');

    // Create demo user
    console.log('👤 Creating demo user...');
    const demoUser = new User({
      name: 'Demo User',
      email: 'demo@smartpos.com',
      password: 'demo123', // Will be hashed by pre-save hook
      businessName: 'Demo Electronics Store',
      role: 'user'
    });
    await demoUser.save();
    console.log('✅ Demo user created');
    console.log('📧 Email: demo@smartpos.com');
    console.log('🔑 Password: demo123');

    // Create products
    console.log('\n📦 Creating products...');
    const products = await Product.insertMany(
      sampleProducts.map(p => ({ ...p, userId: demoUser._id }))
    );
    console.log(`✅ Created ${products.length} products`);

    // Create customers
    console.log('👥 Creating customers...');
    const customers = await Customer.insertMany(
      sampleCustomers.map(c => ({ ...c, userId: demoUser._id }))
    );
    console.log(`✅ Created ${customers.length} customers`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 Quick Start:');
    console.log('1. Start your backend: cd backend && npm start');
    console.log('2. Start your frontend: cd frontend && npm start');
    console.log('3. Login with: demo@smartpos.com / demo123');
    console.log('4. Explore pre-loaded products and customers!');

    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
