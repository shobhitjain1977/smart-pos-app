import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save } from 'lucide-react';
import { productAPI, customerAPI, invoiceAPI } from '../services/api';
import toast from 'react-hot-toast';

const NewInvoice = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [items, setItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, customersRes] = await Promise.all([
        productAPI.getAll({ isActive: true }),
        customerAPI.getAll()
      ]);
      setProducts(productsRes.data.products);
      setCustomers(customersRes.data.customers);
    } catch (error) {
      toast.error('Failed to load data');
    }
  };

  const addItem = () => {
    setItems([...items, {
      productId: '',
      quantity: 1,
      price: 0,
      taxRate: 0,
      discount: 0,
    }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;

    if (field === 'productId') {
      const product = products.find(p => p._id === value);
      if (product) {
        newItems[index].price = product.price;
        newItems[index].taxRate = product.taxRate;
      }
    }

    setItems(newItems);
  };

  const calculateItemTotal = (item) => {
    const subtotal = item.quantity * item.price;
    const tax = (subtotal * item.taxRate) / 100;
    return subtotal + tax - item.discount;
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const taxAmount = items.reduce((sum, item) => 
      sum + ((item.quantity * item.price * item.taxRate) / 100), 0
    );
    const discountAmount = items.reduce((sum, item) => sum + item.discount, 0);
    const totalAmount = subtotal + taxAmount - discountAmount;

    return { subtotal, taxAmount, discountAmount, totalAmount };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    const invalidItems = items.filter(item => !item.productId || item.quantity <= 0);
    if (invalidItems.length > 0) {
      toast.error('Please fill in all item details');
      return;
    }

    setLoading(true);

    try {
      const totals = calculateTotals();
      const invoiceData = {
        customerId: selectedCustomer || undefined,
        items: items.map(item => ({
          productId: item.productId,
          quantity: parseFloat(item.quantity),
          price: parseFloat(item.price),
          taxRate: parseFloat(item.taxRate),
          discount: parseFloat(item.discount) || 0,
        })),
        paymentMethod,
        paymentStatus: 'paid',
        notes,
        discountAmount: totals.discountAmount,
      };

      await invoiceAPI.create(invoiceData);
      toast.success('Invoice created successfully');
      navigate('/invoices');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">New Invoice</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Selection */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Customer Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer (Optional)
              </label>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="input-field"
              >
                <option value="">Walk-in Customer</option>
                {customers.map(customer => (
                  <option key={customer._id} value={customer._id}>
                    {customer.name} - {customer.phone}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="input-field"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Items</h2>
            <button
              type="button"
              onClick={addItem}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Item</span>
            </button>
          </div>

          {items.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No items added yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Tax %</th>
                    <th>Discount</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td className="min-w-[200px]">
                        <select
                          value={item.productId}
                          onChange={(e) => updateItem(index, 'productId', e.target.value)}
                          required
                          className="input-field"
                        >
                          <option value="">Select Product</option>
                          {products.map(product => (
                            <option key={product._id} value={product._id}>
                              {product.name} (Stock: {product.stock})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="min-w-[100px]">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          required
                          className="input-field"
                        />
                      </td>
                      <td className="min-w-[100px]">
                        <input
                          type="number"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => updateItem(index, 'price', e.target.value)}
                          required
                          className="input-field"
                        />
                      </td>
                      <td className="min-w-[80px]">
                        <input
                          type="number"
                          step="0.01"
                          value={item.taxRate}
                          onChange={(e) => updateItem(index, 'taxRate', e.target.value)}
                          className="input-field"
                        />
                      </td>
                      <td className="min-w-[100px]">
                        <input
                          type="number"
                          step="0.01"
                          value={item.discount}
                          onChange={(e) => updateItem(index, 'discount', e.target.value)}
                          className="input-field"
                        />
                      </td>
                      <td className="font-medium whitespace-nowrap">
                        ₹{calculateItemTotal(item).toFixed(2)}
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Summary</h2>
          <div className="space-y-2 max-w-md ml-auto">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal:</span>
              <span>₹{totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Tax:</span>
              <span>₹{totals.taxAmount.toFixed(2)}</span>
            </div>
            {totals.discountAmount > 0 && (
              <div className="flex justify-between text-gray-700">
                <span>Discount:</span>
                <span>-₹{totals.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
              <span>Total:</span>
              <span>₹{totals.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
              className="input-field"
              placeholder="Any additional notes..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/invoices')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || items.length === 0}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? 'Creating...' : 'Create Invoice'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewInvoice;
