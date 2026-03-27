import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Receipt, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Invoices', href: '/invoices', icon: Receipt },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-30 h-screen w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-bold text-blue-600">Smart POS</h1>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="mb-3 px-4">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 w-full transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top header */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex items-center space-x-4 ml-auto">
              <span className="text-sm text-gray-600">
                {user?.businessName || 'My Business'}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
