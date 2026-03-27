import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Download, Search } from 'lucide-react';
import { invoiceAPI } from '../services/api';
import toast from 'react-hot-toast';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    const filtered = invoices.filter(invoice =>
      invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredInvoices(filtered);
  }, [searchTerm, invoices]);

  const fetchInvoices = async () => {
    try {
      const response = await invoiceAPI.getAll();
      setInvoices(response.data.invoices);
      setFilteredInvoices(response.data.invoices);
    } catch (error) {
      toast.error('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (id, invoiceNumber) => {
    try {
      const response = await invoiceAPI.downloadPDF(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      toast.error('Failed to download invoice');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
        <Link to="/invoices/new" className="btn-primary flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>New Invoice</span>
        </Link>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search invoices..."
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Items</th>
              <th>Amount</th>
              <th>Payment Method</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((invoice) => (
              <tr key={invoice._id}>
                <td className="font-medium">{invoice.invoiceNumber}</td>
                <td>
                  <div>
                    <div className="font-medium">{invoice.customerName || 'Walk-in Customer'}</div>
                    {invoice.customerPhone && (
                      <div className="text-xs text-gray-500">{invoice.customerPhone}</div>
                    )}
                  </div>
                </td>
                <td>{new Date(invoice.createdAt).toLocaleDateString()}</td>
                <td>{invoice.items?.length || 0} items</td>
                <td className="font-medium">₹{invoice.totalAmount.toFixed(2)}</td>
                <td>
                  <span className="badge badge-info capitalize">{invoice.paymentMethod}</span>
                </td>
                <td>
                  <span className={`badge ${
                    invoice.paymentStatus === 'paid' ? 'badge-success' :
                    invoice.paymentStatus === 'pending' ? 'badge-warning' :
                    'badge-danger'
                  }`}>
                    {invoice.paymentStatus}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => handleDownloadPDF(invoice._id, invoice.invoiceNumber)}
                    className="text-blue-600 hover:text-blue-700"
                    title="Download PDF"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredInvoices.length === 0 && (
          <p className="text-gray-500 text-center py-8">No invoices found</p>
        )}
      </div>
    </div>
  );
};

export default Invoices;
