
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

export const StockDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <DashboardHeader />
      
      <div className="container mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm mb-8 w-fit">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'inventory', label: 'Inventory' },
            { id: 'stock-management', label: 'Stock Management' },
            { id: 'sales', label: 'Sales' },
            { id: 'purchases', label: 'Purchases' },
            { id: 'analytics', label: 'AI Analytics' },
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
            
            {activeTab === 'purchases' && <PurchaseSection />}
            
            {activeTab === 'analytics' && <AIInsights />}
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
