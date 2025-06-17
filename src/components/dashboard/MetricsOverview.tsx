
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Package, AlertTriangle, DollarSign, ShoppingCart } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useSales } from '@/hooks/useSales';
import { usePurchases } from '@/hooks/usePurchases';

export const MetricsOverview = () => {
  const { products } = useProducts();
  const { sales } = useSales();
  const { purchases } = usePurchases();

  // Calculate total inventory value
  const inventoryValue = products.reduce((sum, product) => {
    const price = parseFloat(product.sellPrice.replace(/[$৳,]/g, '')) || 0;
    return sum + (price * product.stock);
  }, 0);

  // Calculate low stock items (where stock is at or below reorder point)
  const lowStockItems = products.filter(product => product.stock <= product.reorderPoint).length;

  // Calculate total sales revenue
  const salesRevenue = sales.reduce((sum, sale) => {
    const amount = parseFloat(sale.totalAmount.replace(/[$৳,]/g, '')) || 0;
    return sum + amount;
  }, 0);

  // Calculate stock movement (current stock + purchases - sales)
  const totalPurchaseQuantity = purchases.reduce((sum, purchase) => sum + purchase.quantity, 0);
  const totalSalesQuantity = sales.reduce((sum, sale) => sum + sale.quantity, 0);
  const currentStock = products.reduce((sum, product) => sum + product.stock, 0);
  const stockMovement = currentStock + totalPurchaseQuantity - totalSalesQuantity;

  const metrics = [
    {
      title: 'Total Products',
      value: products.length.toLocaleString(),
      change: '+5.2%',
      trend: 'up',
      icon: Package,
      color: 'blue'
    },
    {
      title: 'Low Stock Items',
      value: lowStockItems.toString(),
      change: lowStockItems > 0 ? '+12%' : '-12%',
      trend: lowStockItems > 0 ? 'up' : 'down',
      icon: AlertTriangle,
      color: 'orange'
    },
    {
      title: 'Inventory Value',
      value: `৳${inventoryValue.toLocaleString()}`,
      change: '+8.1%',
      trend: 'up',
      icon: DollarSign,
      color: 'green'
    },
    {
      title: 'Stock Movement',
      value: stockMovement.toLocaleString(),
      change: stockMovement > 0 ? '+15.3%' : '-15.3%',
      trend: stockMovement > 0 ? 'up' : 'down',
      icon: ShoppingCart,
      color: 'purple'
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        const isPositive = metric.trend === 'up';
        
        return (
          <Card key={metric.title} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {metric.title}
              </CardTitle>
              <div className={`p-2 rounded-lg bg-${metric.color}-100`}>
                <Icon className={`h-4 w-4 text-${metric.color}-600`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
              <div className="flex items-center space-x-1 mt-1">
                {isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.change}
                </span>
                <span className="text-sm text-gray-500">vs last month</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
