
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Package, TrendingDown, Clock } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useIsMobile } from '@/hooks/use-mobile';

export const AlertsPanel = () => {
  const { products } = useProducts();
  const isMobile = useIsMobile();

  const lowStockProducts = products.filter(product => 
    product.current_stock <= product.reorder_level
  );

  const outOfStockProducts = products.filter(product => 
    product.current_stock === 0
  );

  const alerts = [
    ...lowStockProducts.map(product => ({
      id: `low-${product.id}`,
      type: 'warning',
      icon: AlertTriangle,
      title: 'Low Stock Alert',
      message: `${product.name} has only ${product.current_stock} units left`,
      time: '2 hours ago',
      priority: 'medium'
    })),
    ...outOfStockProducts.map(product => ({
      id: `out-${product.id}`,
      type: 'danger',
      icon: Package,
      title: 'Out of Stock',
      message: `${product.name} is completely out of stock`,
      time: '1 hour ago',
      priority: 'high'
    }))
  ].slice(0, isMobile ? 3 : 5);

  return (
    <Card className={`${isMobile ? 'mt-4' : ''}`}>
      <CardHeader>
        <CardTitle className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-gray-900 flex items-center gap-2`}>
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          {isMobile ? 'Alerts' : 'Recent Alerts'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No alerts at the moment</p>
            <p className="text-sm text-gray-400">All inventory levels are normal</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className={`p-2 rounded-full ${
                alert.type === 'danger' ? 'bg-red-100' : 'bg-orange-100'
              }`}>
                <alert.icon className={`h-4 w-4 ${
                  alert.type === 'danger' ? 'text-red-600' : 'text-orange-600'
                }`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`${isMobile ? 'text-sm' : 'text-sm'} font-medium text-gray-900`}>
                    {alert.title}
                  </h4>
                  <Badge variant={alert.type === 'danger' ? 'destructive' : 'secondary'} className="text-xs">
                    {alert.priority}
                  </Badge>
                </div>
                
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 mb-2`}>
                  {isMobile && alert.message.length > 40 
                    ? `${alert.message.substring(0, 40)}...`
                    : alert.message}
                </p>
                
                <div className="flex items-center text-xs text-gray-400">
                  <Clock className="h-3 w-3 mr-1" />
                  {alert.time}
                </div>
              </div>
            </div>
          ))
        )}
        
        {alerts.length > 0 && (
          <div className="pt-4 border-t">
            <button className={`w-full ${isMobile ? 'text-sm' : 'text-sm'} text-blue-600 hover:text-blue-800 font-medium`}>
              View All Alerts ({lowStockProducts.length + outOfStockProducts.length})
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
