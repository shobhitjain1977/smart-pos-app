# 🏗️ Project Architecture & Technical Overview

Understanding how the Smart POS system works under the hood.

---

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT SIDE                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              React Frontend (Port 3000)               │  │
│  │                                                        │  │
│  │  • React Router (Navigation)                          │  │
│  │  • Context API (State Management)                     │  │
│  │  • Axios (HTTP Client)                                │  │
│  │  • Tailwind CSS (Styling)                             │  │
│  │  • Chart.js (Data Visualization)                      │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↕ HTTP/HTTPS
┌─────────────────────────────────────────────────────────────┐
│                        SERVER SIDE                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │            Node.js + Express (Port 5000)              │  │
│  │                                                        │  │
│  │  • RESTful API Endpoints                              │  │
│  │  • JWT Authentication Middleware                      │  │
│  │  • Express Validators                                 │  │
│  │  • CORS Configuration                                 │  │
│  │  • PDFKit (PDF Generation)                            │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↕ Mongoose ODM
┌─────────────────────────────────────────────────────────────┐
│                       DATABASE LAYER                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           MongoDB (Port 27017)                        │  │
│  │                                                        │  │
│  │  Collections:                                         │  │
│  │  • users                                              │  │
│  │  • products                                           │  │
│  │  • customers                                          │  │
│  │  • invoices                                           │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow

### Example: Creating an Invoice

```
1. USER ACTION
   └─ User clicks "Create Invoice" in React app
   
2. FRONTEND PROCESSING
   └─ Form validation
   └─ Prepare invoice data
   └─ Call invoiceAPI.create(data)
   
3. HTTP REQUEST
   └─ POST /api/invoices
   └─ Headers: { Authorization: Bearer <JWT> }
   └─ Body: { customerId, items, paymentMethod, ... }
   
4. BACKEND AUTH MIDDLEWARE
   └─ Extract JWT from header
   └─ Verify token signature
   └─ Decode userId from token
   └─ Attach user to request object
   
5. ROUTE HANDLER
   └─ Validate request data
   └─ Calculate totals (subtotal, tax, discounts)
   └─ Check product stock availability
   
6. DATABASE OPERATIONS
   └─ Fetch product details
   └─ Update product stock (deduct quantities)
   └─ Update customer stats (total purchases)
   └─ Create invoice document
   └─ Save to MongoDB
   
7. RESPONSE
   └─ Return invoice object with ID
   └─ Status: 201 Created
   
8. FRONTEND UPDATE
   └─ Show success notification
   └─ Redirect to invoices list
   └─ Update dashboard stats
```

---

## 🗂️ Database Schema Design

### User Collection
```javascript
{
  _id: ObjectId,
  name: String,          // "John Doe"
  email: String,         // "john@example.com" (unique)
  password: String,      // Hashed with bcrypt
  role: String,          // "user" or "admin"
  businessName: String,  // "John's Store"
  createdAt: Date
}
```

### Product Collection
```javascript
{
  _id: ObjectId,
  name: String,          // Required
  description: String,
  sku: String,           // Unique, optional
  barcode: String,       // Unique, optional
  price: Number,         // Required, selling price
  cost: Number,          // Cost price for profit tracking
  stock: Number,         // Current inventory count
  category: String,
  unit: String,          // "pcs", "kg", "ltr", "box"
  taxRate: Number,       // Percentage (0-100)
  isActive: Boolean,     // Product visibility
  userId: ObjectId,      // Reference to User
  createdAt: Date,
  updatedAt: Date
}

// Indexes
Index: { userId: 1, sku: 1 }
Index: { userId: 1, barcode: 1 }
Index: { userId: 1, stock: 1 }
```

### Customer Collection
```javascript
{
  _id: ObjectId,
  name: String,          // Required
  email: String,
  phone: String,         // Required
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  gstNumber: String,
  totalPurchases: Number,      // Running total
  lastPurchaseDate: Date,
  userId: ObjectId,            // Reference to User
  createdAt: Date,
  updatedAt: Date
}

// Indexes
Index: { userId: 1, totalPurchases: -1 }
```

### Invoice Collection
```javascript
{
  _id: ObjectId,
  invoiceNumber: String,       // Auto-generated, unique
  customerId: ObjectId,         // Optional, Reference to Customer
  customerName: String,         // Denormalized for history
  customerPhone: String,
  customerEmail: String,
  
  items: [
    {
      productId: ObjectId,      // Reference to Product
      productName: String,      // Denormalized
      quantity: Number,
      price: Number,            // Price at time of sale
      taxRate: Number,
      discount: Number,
      total: Number             // Calculated total for this item
    }
  ],
  
  subtotal: Number,             // Sum of item subtotals
  taxAmount: Number,            // Sum of all taxes
  discountAmount: Number,       // Total discounts
  totalAmount: Number,          // Final amount
  
  paymentMethod: String,        // "cash", "card", "upi", "other"
  paymentStatus: String,        // "paid", "pending", "cancelled"
  notes: String,
  
  userId: ObjectId,             // Reference to User
  createdAt: Date
}

// Indexes
Index: { userId: 1, createdAt: -1 }
Index: { invoiceNumber: 1 }
Index: { userId: 1, paymentStatus: 1 }
```

---

## 🔐 Authentication Flow

### JWT Token Structure
```javascript
Header: {
  "alg": "HS256",
  "typ": "JWT"
}

Payload: {
  "userId": "64a1b2c3d4e5f6g7h8i9j0k1",
  "iat": 1642435200,    // Issued at
  "exp": 1643040000     // Expires in 7 days
}

Signature: HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  JWT_SECRET
)
```

### Authentication Middleware
```javascript
// How it works:
1. Extract token from Authorization header
2. Verify token signature using JWT_SECRET
3. Decode payload to get userId
4. Fetch user from database
5. Attach user object to request
6. Continue to route handler

// If any step fails → 401 Unauthorized
```

---

## 📡 API Design Patterns

### RESTful Conventions

```
Resource: Products

GET    /api/products          → List all products
GET    /api/products/:id      → Get single product
POST   /api/products          → Create new product
PUT    /api/products/:id      → Update product
DELETE /api/products/:id      → Delete product

Same pattern for customers, invoices, etc.
```

### Response Format

**Success Response:**
```javascript
{
  "products": [...],        // Data
  "message": "Success"      // Optional
}
```

**Error Response:**
```javascript
{
  "error": "Product not found"
}
```

**Validation Errors:**
```javascript
{
  "errors": [
    {
      "field": "price",
      "message": "Price must be a positive number"
    }
  ]
}
```

---

## 🎨 Frontend Architecture

### Component Hierarchy

```
App
├── Router
│   ├── PublicRoute
│   │   ├── Login
│   │   └── Register
│   │
│   └── PrivateRoute
│       └── Layout
│           ├── Sidebar
│           ├── Header
│           └── Outlet
│               ├── Dashboard
│               ├── Products
│               ├── Customers
│               ├── Invoices
│               └── NewInvoice
```

### State Management

**Global State (Context API):**
- Authentication state
- Current user data
- Auth methods (login, logout, register)

**Local State (useState):**
- Component-specific data
- Form inputs
- Loading states
- Modal visibility

**Server State (API calls):**
- Products list
- Customers list
- Invoices list
- Dashboard analytics

---

## 🔧 Key Technical Decisions

### Why MongoDB over SQL?
- **Flexibility**: Schema-less design allows easy modifications
- **JSON Native**: Direct mapping between API and database
- **Scalability**: Easy horizontal scaling
- **Developer Experience**: Mongoose ODM simplifies queries

### Why JWT over Sessions?
- **Stateless**: No server-side session storage
- **Scalable**: Works across multiple servers
- **Mobile-Friendly**: Easy token storage
- **Performance**: No database lookups per request

### Why React Context over Redux?
- **Simplicity**: Less boilerplate code
- **Built-in**: No external dependencies
- **Sufficient**: App doesn't need complex state management
- **Learning Curve**: Easier for beginners

### Why Tailwind CSS?
- **Utility-First**: Faster development
- **Consistency**: Design system built-in
- **Responsive**: Mobile-first by default
- **Performance**: Purges unused CSS in production

---

## 🔄 Business Logic Examples

### Stock Deduction
```javascript
// When invoice is created:
for (item of invoiceItems) {
  product = await Product.findById(item.productId);
  product.stock -= item.quantity;
  await product.save();
}
```

### Invoice Number Generation
```javascript
// Format: INV-{timestamp}-{count}
const count = await Invoice.countDocuments();
const timestamp = Date.now().toString().slice(-6);
invoiceNumber = `INV-${timestamp}-${count + 1}`;
// Example: INV-456789-42
```

### Tax Calculation
```javascript
// Per item:
itemSubtotal = quantity * price;
itemTax = (itemSubtotal * taxRate) / 100;
itemTotal = itemSubtotal + itemTax - discount;

// Invoice totals:
subtotal = sum(all itemSubtotals);
taxAmount = sum(all itemTaxes);
total = subtotal + taxAmount - totalDiscount;
```

### Customer Stats Update
```javascript
// On invoice creation:
customer.totalPurchases += invoice.totalAmount;
customer.lastPurchaseDate = new Date();
await customer.save();
```

---

## 🛡️ Security Measures

### Password Security
```javascript
// Registration:
1. User submits plain password
2. Generate salt (10 rounds)
3. Hash password with bcrypt
4. Store only hashed password

// Login:
1. User submits plain password
2. Retrieve hashed password from DB
3. Compare using bcrypt.compare()
4. Return match result
```

### Input Validation
```javascript
// Backend (express-validator):
body('email').isEmail(),
body('password').isLength({ min: 6 }),
body('price').isNumeric().isFloat({ min: 0 })

// Frontend (HTML5 + React):
<input type="email" required />
<input type="number" min="0" step="0.01" />
```

### CORS Configuration
```javascript
// Only allow requests from frontend domain
cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
})
```

---

## 📊 Performance Considerations

### Database Optimization
- **Indexes** on frequently queried fields (userId, invoiceNumber)
- **Lean queries** for read-only operations
- **Projection** to fetch only needed fields
- **Connection pooling** for concurrent requests

### Frontend Optimization
- **Code splitting** with React.lazy()
- **Memoization** with React.memo()
- **Debouncing** search inputs
- **Pagination** for large lists (future enhancement)

---

## 🧪 Testing Strategy

### Backend Tests (Recommended)
```javascript
// Unit Tests:
- Model validation
- Utility functions
- Business logic calculations

// Integration Tests:
- API endpoints
- Auth middleware
- Database operations

// Tools: Jest, Supertest
```

### Frontend Tests (Recommended)
```javascript
// Unit Tests:
- Component rendering
- Form validation
- Utility functions

// Integration Tests:
- User flows
- API integration
- State management

// Tools: Jest, React Testing Library
```

---

## 📈 Scalability Path

### Current Architecture (Small Business)
- Single server
- MongoDB on same server
- < 1000 requests/day
- < 100 concurrent users

### Growth Path (Medium Business)
- Separate API and DB servers
- Add Redis for caching
- Implement rate limiting
- CDN for static assets
- Load balancer for multiple API instances

### Enterprise Scale
- Microservices architecture
- Message queues (RabbitMQ, Kafka)
- Elasticsearch for search
- Read replicas for MongoDB
- Containerization (Docker, Kubernetes)

---

**This architecture is designed to be simple enough to understand but robust enough for production use! 🚀**
