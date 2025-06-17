
import React, { useState } from 'react';
import { DashboardHeader } from './dashboard/DashboardHeader';
import { MetricsOverview } from './dashboard/MetricsOverview';
import { InventoryChart } from './dashboard/InventoryChart';
import { ProductTable } from './dashboard/ProductTable';
import { AIInsights } from './dashboard/AIInsights';
import { AlertsPanel } from './dashboard/AlertsPanel';
import { SalesSection } from './inventory/SalesSection';
import { PurchaseSection } from './inventory/PurchaseSection';
import { StockManagement } from './inventory/StockManagement';
import { SalesReturnSection } from './inventory/SalesReturnSection';
import { Reports } from '../pages/Reports';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const StockDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header with User Info */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Inventory Management System</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                <span className="font-medium">{user?.username}</span>
                <span className="text-gray-500">({user?.role})</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm mb-8 w-fit">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'inventory', label: 'Inventory' },
            { id: 'stock-management', label: 'Stock Management' },
            { id: 'sales', label: 'Sales' },
            { id: 'sales-returns', label: 'Sales Returns' },
            { id: 'purchases', label: 'Purchases' },
            { id: 'reports', label: 'Reports' },
            
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Panel */}
          <div className="lg:col-span-3 space-y-8">
            {activeTab === 'overview' && (
              <>
                <MetricsOverview />
                <InventoryChart />
              </>
            )}
            
            {activeTab === 'inventory' && <ProductTable />}
            
            {activeTab === 'stock-management' && <StockManagement />}
            
            {activeTab === 'sales' && <SalesSection />}
            
            {activeTab === 'sales-returns' && <SalesReturnSection />}
            
            {activeTab === 'purchases' && <PurchaseSection />}
            
            {activeTab === 'reports' && <Reports />}
            
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <AlertsPanel />
          </div>
        </div>
      </div>
    </div>
  );
};
