import React from 'react';
import { LucideProps } from 'lucide-react';
import {
  TrendingUp,
  TrendingDown,
  Package,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProducts } from '@/hooks/useProducts';
import { useSales } from '@/hooks/useSales';
import { usePurchases } from '@/hooks/usePurchases';
import { useIsMobile } from '@/hooks/use-mobile';

export const BdtSign = (props: LucideProps) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <text x="4" y="20" fontSize="33">৳</text>
  </svg>
);

export const MetricsOverview = () => {
  const { products } = useProducts();
  const { sales } = useSales();
  const { purchases } = usePurchases();
  const isMobile = useIsMobile();

  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stock <= p.reorderPoint).length;

  const totalSalesValue = sales.reduce((sum, sale) => {
    const price = typeof sale.unitPrice === 'string'
      ? parseFloat(sale.unitPrice.replace(/[৳$,]/g, '')) || 0
      : sale.unitPrice || 0;
    return sum + (price * sale.quantity);
  }, 0);

  const totalPurchaseValue = purchases.reduce((sum, purchase) => {
    const price = typeof purchase.unitPrice === 'string'
      ? parseFloat(purchase.unitPrice.replace(/[৳$,]/g, '')) || 0
      : purchase.unitPrice || 0;
    return sum + (price * purchase.quantity);
  }, 0);

  const totalCurrentStock = products.reduce((sum, product) => sum + product.stock, 0);
  const totalPurchaseQuantity = purchases.reduce((sum, purchase) => sum + purchase.quantity, 0);
  const totalSalesQuantity = sales.reduce((sum, sale) => sum + sale.quantity, 0);
  const stockMovement = totalCurrentStock + totalPurchaseQuantity - totalSalesQuantity;

  const metrics = [
    {
      title: 'Total Products',
      value: totalProducts.toString(),
      change: '+12%',
      changeType: 'positive' as const,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      watermark: <Package className="absolute right-1 bottom-1 opacity-10 h-12 w-12 text-blue-400" />,
    },
    {
      title: 'Sales Revenue',
      value: `${totalSalesValue.toLocaleString()}`,
      change: '+8.2%',
      changeType: 'positive' as const,
      icon: BdtSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      watermark: <BdtSign className="absolute right-1 bottom-1 opacity-10 h-12 w-12 text-green-400" />,
    },
    {
      title: 'Stock Movement',
      value: stockMovement.toString(),
      change: stockMovement >= 0 ? '+5.1%' : '-2.3%',
      changeType: stockMovement >= 0 ? 'positive' : 'negative',
      icon: TrendingUp,
      color: stockMovement >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: stockMovement >= 0 ? 'bg-green-50' : 'bg-red-50',
      watermark: <TrendingUp className="absolute right-1 bottom-1 opacity-10 h-12 w-12 text-green-400" />,
    },
    {
      title: 'Low Stock Items',
      value: lowStockProducts.toString(),
      change: '-15%',
      changeType: 'negative' as const,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      watermark: <AlertTriangle className="absolute right-1 bottom-1 opacity-10 h-12 w-12 text-orange-400" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 md:grid-cols-4">
      {metrics.map((metric, index) => (
        <Card
          key={index}
          className={`relative overflow-hidden transition duration-300 ${metric.bgColor} p-3 sm:p-4`}
        >
          {metric.watermark}

          <CardHeader className="flex flex-row items-center justify-between pb-1 z-10 relative">
            <CardTitle className="text-[10px] sm:text-xs text-gray-700 font-medium">
              {metric.title}
            </CardTitle>
            <div className="p-1 rounded-full bg-white/40">
              <metric.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${metric.color}`} />
            </div>
          </CardHeader>

          <CardContent className="pt-0 z-10 relative">
            <div className="text-lg sm:text-2xl font-bold text-gray-900">{metric.value}</div>
            <div className="flex items-center space-x-1 mt-1">
              {metric.changeType === 'positive' ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className="text-xs sm:text-sm font-medium text-gray-600">
                {metric.change}
              </span>
              <span className="text-[10px] sm:text-xs text-gray-500">
                vs last
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
