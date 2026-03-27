import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Package, Users, Receipt, Plus } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { analyticsAPI } from '../services/api';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [period, setPeriod] = useState('today');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await analyticsAPI.getDashboard(period);
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${stats?.sales.totalRevenue?.toFixed(2) || '0.00'}`,
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      title: 'Total Invoices',
      value: stats?.sales.totalInvoices || '0',
      icon: Receipt,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Products',
      value: stats?.products.total || '0',
      icon: Package,
      color: 'bg-purple-500',
    },
    {
      title: 'Total Customers',
      value: stats?.customers.total || '0',
      icon: Users,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your business overview</p>
        </div>
        
        <Link to="/invoices/new" className="btn-primary flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>New Invoice</span>
        </Link>
      </div>

      {/* Period selector */}
      <div className="flex space-x-2">
        {['today', 'week', 'month', 'year'].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
              period === p
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Low Stock Alert */}
      {stats?.products.lowStock > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex items-center">
            <Package className="h-5 w-5 text-yellow-600 mr-3" />
            <p className="text-yellow-800">
              <span className="font-medium">{stats.products.lowStock}</span> products are running low on stock!{' '}
              <Link to="/products" className="underline font-medium">View Products</Link>
            </p>
          </div>
        </div>
      )}

      {/* Recent Invoices */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Invoices</h2>
          <Link to="/invoices" className="text-blue-600 hover:text-blue-700 font-medium">
            View All
          </Link>
        </div>

        {stats?.recentInvoices?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentInvoices.map((invoice) => (
                  <tr key={invoice._id}>
                    <td className="font-medium">{invoice.invoiceNumber}</td>
                    <td>{invoice.customerName || 'Walk-in'}</td>
                    <td>₹{invoice.totalAmount.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${
                        invoice.paymentStatus === 'paid' ? 'badge-success' :
                        invoice.paymentStatus === 'pending' ? 'badge-warning' :
                        'badge-danger'
                      }`}>
                        {invoice.paymentStatus}
                      </span>
                    </td>
                    <td>{new Date(invoice.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No recent invoices</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
