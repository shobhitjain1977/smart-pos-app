# 📡 API Documentation

Base URL: `http://localhost:5000/api`

---

## 🔐 Authentication

### Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "businessName": "John's Store" // optional
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "businessName": "John's Store"
  }
}
```

---

### Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "businessName": "John's Store"
  }
}
```

---

### Get Current User
**GET** `/auth/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "businessName": "John's Store"
  }
}
```

---

## 📦 Products

### Get All Products
**GET** `/products`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `search` - Search by name, SKU, or barcode
- `category` - Filter by category
- `isActive` - Filter by active status (true/false)

**Response:**
```json
{
  "products": [
    {
      "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
      "name": "Product Name",
      "description": "Product description",
      "sku": "SKU123",
      "barcode": "1234567890",
      "price": 99.99,
      "cost": 50.00,
      "stock": 100,
      "category": "Electronics",
      "unit": "pcs",
      "taxRate": 18,
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### Get Single Product
**GET** `/products/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "product": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "name": "Product Name",
    "price": 99.99,
    "stock": 100
  }
}
```

---

### Create Product
**POST** `/products`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "New Product",
  "description": "Product description",
  "sku": "SKU123",
  "barcode": "1234567890",
  "price": 99.99,
  "cost": 50.00,
  "stock": 100,
  "category": "Electronics",
  "unit": "pcs",
  "taxRate": 18
}
```

**Response:**
```json
{
  "product": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "name": "New Product",
    "price": 99.99
  }
}
```

---

### Update Product
**PUT** `/products/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Updated Product Name",
  "price": 89.99,
  "stock": 150
}
```

---

### Delete Product
**DELETE** `/products/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Product deleted successfully"
}
```

---

### Get Low Stock Products
**GET** `/products/alerts/low-stock`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `threshold` - Stock threshold (default: 10)

---

## 👥 Customers

### Get All Customers
**GET** `/customers`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `search` - Search by name, email, or phone

---

### Get Single Customer
**GET** `/customers/:id`

**Headers:**
```
Authorization: Bearer <token>
```

---

### Create Customer
**POST** `/customers`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Customer Name",
  "email": "customer@example.com",
  "phone": "1234567890",
  "address": {
    "street": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001",
    "country": "India"
  },
  "gstNumber": "27AABCU9603R1ZM"
}
```

---

### Update Customer
**PUT** `/customers/:id`

**Headers:**
```
Authorization: Bearer <token>
```

---

### Delete Customer
**DELETE** `/customers/:id`

**Headers:**
```
Authorization: Bearer <token>
```

---

## 🧾 Invoices

### Get All Invoices
**GET** `/invoices`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `startDate` - Filter by start date
- `endDate` - Filter by end date
- `paymentStatus` - Filter by status (paid/pending/cancelled)
- `customerId` - Filter by customer

---

### Get Single Invoice
**GET** `/invoices/:id`

**Headers:**
```
Authorization: Bearer <token>
```

---

### Create Invoice
**POST** `/invoices`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "customerId": "64a1b2c3d4e5f6g7h8i9j0k1", // optional
  "items": [
    {
      "productId": "64a1b2c3d4e5f6g7h8i9j0k2",
      "quantity": 2,
      "price": 99.99,
      "taxRate": 18,
      "discount": 10
    }
  ],
  "paymentMethod": "cash", // cash, card, upi, other
  "paymentStatus": "paid", // paid, pending, cancelled
  "notes": "Optional notes",
  "discountAmount": 20
}
```

**Response:**
```json
{
  "invoice": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k3",
    "invoiceNumber": "INV-123456-1",
    "totalAmount": 219.98,
    "paymentStatus": "paid"
  }
}
```

---

### Download Invoice PDF
**GET** `/invoices/:id/pdf`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** PDF file download

---

### Update Invoice Status
**PATCH** `/invoices/:id/status`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "paymentStatus": "paid"
}
```

---

## 📊 Analytics

### Get Dashboard Data
**GET** `/analytics/dashboard`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `period` - today, week, month, year

**Response:**
```json
{
  "sales": {
    "totalRevenue": 15000.00,
    "totalInvoices": 45,
    "averageOrderValue": 333.33
  },
  "products": {
    "total": 150,
    "lowStock": 5
  },
  "customers": {
    "total": 30
  },
  "recentInvoices": [...]
}
```

---

### Get Sales Chart Data
**GET** `/analytics/sales-chart`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `period` - week, month, year

---

### Get Top Products
**GET** `/analytics/top-products`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` - Number of products (default: 10)

---

### Get Payment Methods Stats
**GET** `/analytics/payment-methods`

**Headers:**
```
Authorization: Bearer <token>
```

---

## ❌ Error Responses

All endpoints may return these error responses:

**400 Bad Request:**
```json
{
  "error": "Validation error message"
}
```

**401 Unauthorized:**
```json
{
  "error": "No authentication token, access denied"
}
```

**404 Not Found:**
```json
{
  "error": "Resource not found"
}
```

**500 Server Error:**
```json
{
  "error": "Server error"
}
```

---

## 🔑 Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Token expires in 7 days.
