# ⚡ Quick Start Guide

Get your Smart POS app running in 5 minutes!

---

## 📦 Step 1: Install Dependencies

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

---

## ⚙️ Step 2: Configure Environment

### Backend Configuration
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-pos
JWT_SECRET=change-this-to-a-random-secret-key
NODE_ENV=development
```

### Frontend Configuration
```bash
cd frontend
cp .env.example .env
```

The default `.env` should work:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🚀 Step 3: Start MongoDB

**Windows:** MongoDB should auto-start as a service

**macOS:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

---

## ▶️ Step 4: Run the Application

### Terminal 1 - Start Backend
```bash
cd backend
npm start
```

You should see:
```
✅ MongoDB Connected
🚀 Server running on port 5000
```

### Terminal 2 - Start Frontend
```bash
cd frontend
npm start
```

Your browser will automatically open to `http://localhost:3000`

---

## 🎉 Step 5: Start Using!

1. **Sign Up** - Create your account
2. **Add Products** - Go to Products → Add Product
3. **Create Invoice** - Go to Invoices → New Invoice
4. **View Dashboard** - See your sales analytics

---

## 🆘 Common Issues

**Can't connect to MongoDB?**
```bash
# Check if MongoDB is running
ps aux | grep mongod
```

**Port 5000 already in use?**
```bash
# Change port in backend/.env
PORT=5001
```

**CORS errors?**
- Make sure backend is running on port 5000
- Check frontend .env has correct API_URL

---

## 🌱 Want Sample Data?

**Skip manual data entry! Load sample products and customers:**

```bash
cd backend
npm run seed
```

This creates:
- ✅ Demo account: `demo@smartpos.com` / `demo123`
- ✅ 15 sample products
- ✅ 8 sample customers

**Login with demo credentials and start testing immediately!**

---

## 📱 Default Features Ready to Use

✅ Product Management  
✅ Customer Management  
✅ Invoice Generation  
✅ PDF Download  
✅ Sales Dashboard  
✅ Stock Tracking  

**That's it! Happy billing! 🎊**
