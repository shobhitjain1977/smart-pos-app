# 💻 Smart POS & Billing Web App

A full-stack Point of Sale (POS) and Billing system built with **React**, **Node.js**, **Express**, and **MongoDB**. Perfect for small businesses to manage products, customers, sales, and generate professional invoices.

---

## 🚀 Features

### 👤 User Features
- **Authentication**: Secure login/signup with JWT tokens
- **Dashboard**: Real-time business analytics and sales overview
- **Product Management**: Full CRUD operations for products
  - SKU & barcode support
  - Stock tracking with low-stock alerts
  - Category management
  - Tax rate configuration
- **Customer Management**: Complete customer database
  - Contact details
  - Address management
  - Purchase history
  - GST number support
- **Invoice Generation**: 
  - Create professional invoices
  - Automatic calculations (tax, discounts, totals)
  - PDF download
  - Multiple payment methods (Cash, Card, UPI)
  - Stock auto-deduction
- **Search & Filter**: Quick search across products, customers, and invoices
- **Analytics**: Sales reports and business insights

---

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI framework
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Chart.js** - Data visualization
- **Axios** - API calls
- **Lucide React** - Icons
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **PDFKit** - Invoice PDF generation
- **CORS** - Cross-origin requests

---

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v4 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** package manager

---

## 🔧 Installation & Setup

### 1. Clone or Extract the Project

```bash
cd smart-pos-app
```

### 2. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env file and configure:
# - MongoDB connection string
# - JWT secret key
# - Port number (default: 5000)
```

**Example `.env` file:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-pos
JWT_SECRET=your-secret-key-change-this-to-something-random
NODE_ENV=development
```

### 3. Frontend Setup

```bash
# Open a new terminal and navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# The .env should contain:
REACT_APP_API_URL=http://localhost:5000/api
```

---

## ▶️ Running the Application

### Start MongoDB

**On Windows:**
```bash
# MongoDB should be running as a service
# Or start manually:
mongod
```

**On macOS/Linux:**
```bash
sudo systemctl start mongod
# Or
brew services start mongodb-community
```

### Start Backend Server

```bash
# From backend folder
cd backend
npm run dev
# OR
npm start

# Server will run on http://localhost:5000
```

### Start Frontend

```bash
# From frontend folder (in a new terminal)
cd frontend
npm start

# React app will open at http://localhost:3000
```

---

## 🎯 Usage Guide

### 1. **First Time Setup**

1. Open `http://localhost:3000` in your browser
2. Click "Sign Up" to create an account
3. Fill in:
   - Your name
   - Email
   - Business name (optional)
   - Password (min 6 characters)
4. Click "Sign Up"

### 2. **Add Products**

1. Go to **Products** page
2. Click **"Add Product"**
3. Fill in product details:
   - Name (required)
   - Price (required)
   - Stock quantity (required)
   - SKU, barcode, category, etc.
4. Click **"Create"**

### 3. **Add Customers** (Optional)

1. Go to **Customers** page
2. Click **"Add Customer"**
3. Fill in customer details
4. Click **"Create"**

### 4. **Create Invoice**

1. Go to **Invoices** page
2. Click **"New Invoice"**
3. Select customer (or leave as walk-in)
4. Click **"Add Item"** to add products
5. Select product, quantity, adjust price/tax/discount
6. Choose payment method
7. Click **"Create Invoice"**
8. Download PDF if needed

### 5. **View Dashboard**

- See total revenue, invoices, products, customers
- View recent invoices
- Check low-stock alerts
- Filter by time period (Today, Week, Month, Year)

---

## 🎨 Default Credentials

After installation, you can create your own account. There are no pre-configured credentials.

---

## 📱 Features Breakdown

### Product Management
- ✅ Add/Edit/Delete products
- ✅ Track inventory levels
- ✅ Set tax rates per product
- ✅ Low stock alerts
- ✅ SKU and barcode support
- ✅ Category filtering

### Invoice System
- ✅ Multi-item invoices
- ✅ Automatic tax calculation
- ✅ Discount support
- ✅ PDF generation
- ✅ Payment tracking
- ✅ Stock auto-deduction

### Customer Management
- ✅ Customer database
- ✅ Purchase history
- ✅ Contact management
- ✅ Address storage
- ✅ GST support

### Analytics
- ✅ Sales overview
- ✅ Revenue tracking
- ✅ Recent transactions
- ✅ Stock alerts
- ✅ Time-period filters

---

## 🗂️ Project Structure

```
smart-pos-app/
├── backend/
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   ├── server.js        # Entry point
│   └── package.json
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/  # Reusable components
    │   ├── pages/       # Page components
    │   ├── context/     # React Context (Auth)
    │   ├── services/    # API service layer
    │   ├── App.js       # Main app component
    │   └── index.js     # Entry point
    └── package.json
```

---

## 🐛 Troubleshooting

### MongoDB Connection Error

**Error:** `MongoNetworkError: failed to connect to server`

**Solution:**
```bash
# Make sure MongoDB is running
sudo systemctl status mongod

# Or check if mongod process is running
ps aux | grep mongod
```

### Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Kill the process using port 5000
lsof -ti:5000 | xargs kill -9

# Or change port in backend/.env
PORT=5001
```

### CORS Error

**Error:** `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution:**
- Make sure backend is running on `http://localhost:5000`
- Check `REACT_APP_API_URL` in frontend/.env
- Verify CORS is enabled in backend/server.js

### Cannot Find Module Error

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 🔐 Security Notes

- Change `JWT_SECRET` in `.env` to a strong random string
- Never commit `.env` files to version control
- Use HTTPS in production
- Implement rate limiting for production
- Add input validation on frontend

---

## 🚀 Deployment

### Backend (Example: Heroku)

```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create app
heroku create your-pos-backend

# Add MongoDB addon
heroku addons:create mongolab

# Set environment variables
heroku config:set JWT_SECRET=your-secret-key

# Deploy
git push heroku main
```

### Frontend (Example: Vercel/Netlify)

```bash
# Build frontend
npm run build

# Deploy to Vercel
vercel --prod

# Or Netlify
netlify deploy --prod
```

---

## 📈 Future Enhancements

- [ ] Email invoice delivery
- [ ] Barcode scanning integration
- [ ] Multi-store support
- [ ] Expense tracking
- [ ] Employee management
- [ ] Advanced reporting
- [ ] Mobile app (React Native)
- [ ] Payment gateway integration
- [ ] Inventory forecasting

---

## 👨‍💻 Contributing

Feel free to fork this project and submit pull requests for any improvements!

---

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

---

## 📧 Support

For issues or questions, please open an issue on GitHub or contact the developer.

---

**Built with ❤️ for small businesses**
