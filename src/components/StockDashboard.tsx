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
import { User, LogOut, Menu, X, BarChart3, Package, Boxes, ShoppingCart, RotateCcw, ShoppingBag, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

export const StockDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('overview');
  const [showSidebar, setShowSidebar] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'stock-management', label: 'Stock Mgmt', icon: Boxes },
    { id: 'sales', label: 'Sales', icon: ShoppingCart },
    { id: 'sales-returns', label: 'Returns', icon: RotateCcw },
    { id: 'purchases', label: 'Purchases', icon: ShoppingBag },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  React.useEffect(() => {
  console.log("Is mobile:", isMobile)
}, [isMobile])
  
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm border-b">
        <div className={`${isMobile ? 'px-4 py-3' : 'container mx-auto px-6 py-4'}`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="p-2"
                >
                  {showSidebar ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              )}
              <div>
                <h1 className={`font-bold text-gray-900 ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                  {isMobile ? 'InvenAI' : 'Inventory Management System'}
                </h1>
                {!isMobile && <p className="text-sm text-gray-500">Smart Inventory Control</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                <User className="h-4 w-4" />
                <span className="font-medium">{isMobile ? user?.username : user?.username}</span>
                {!isMobile && <span className="text-gray-500">({user?.role})</span>}
              </div>
              <Button 
                variant="outline" 
                size={isMobile ? "sm" : "sm"} 
                onClick={handleLogout} 
                className="flex items-center gap-1"
              >
                <LogOut className="h-3 w-3" />
                {!isMobile && 'Logout'}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className={`${isMobile ? 'px-2 py-4' : 'container mx-auto px-6 py-8'}`}>
        {/* Navigation - Mobile Sidebar / Desktop Tabs */}
        {isMobile ? (
          <>
            {/* Mobile Sidebar Overlay */}
            {showSidebar && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={() => setShowSidebar(false)}
              />
            )}
            
            {/* Mobile Sidebar */}
            <div className={`fixed left-0 top-0 h-full w-20 bg-white shadow-lg z-50 transform transition-transform duration-300 ${
              showSidebar ? 'translate-x-0' : '-translate-x-full'
            }`}>
              <div className="p-4 border-b">
                <div className="flex items-center justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSidebar(false)}
                    className="p-1"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="py-2">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`w-full px-4 py-4 transition-colors flex items-center justify-center ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                          : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                      title={tab.icon}>
                      <IconComponent className="h-5 w-5" />
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          /* Desktop Navigation Tabs */
          <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm mb-8 w-fit overflow-x-auto">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Main Content */}
        <div className={`${isMobile ? 'space-y-4' : 'grid grid-cols-1 lg:grid-cols-4 gap-8'}`}>
          {/* Main Panel */}
          <div className={`${isMobile ? '' : 'lg:col-span-3'} space-y-6`}>
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

          {/* Sidebar - Hidden on mobile unless overview tab */}
          {(!isMobile || activeTab === 'overview') && (
            <div className={`${isMobile ? '' : 'lg:col-span-1'}`}>
              <AlertsPanel />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};