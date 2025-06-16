
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, DollarSign } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';

export const SalesSection = () => {
  const { products } = useProducts();

  // Mock sales data - in a real app, this would come from a sales hook/API
  const salesData = [
    {
      id: 'SALE001',
      productId: 'SKU001',
      productName: 'Wireless Bluetooth Headphones',
      quantity: 2,
      unitPrice: '$89.99',
      totalAmount: '$179.98',
      date: '2024-01-15',
      status: 'Completed'
    },
    {
      id: 'SALE002',
      productId: 'SKU002',
      productName: 'Cotton T-Shirt - Blue',
      quantity: 5,
      unitPrice: '$24.99',
      totalAmount: '$124.95',
      date: '2024-01-14',
      status: 'Completed'
    },
    {
      id: 'SALE003',
      productId: 'SKU004',
      productName: 'Running Shoes - Size 10',
      quantity: 1,
      unitPrice: '$129.99',
      totalAmount: '$129.99',
      date: '2024-01-13',
      status: 'Pending'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalSales = salesData.reduce((sum, sale) => 
    sum + parseFloat(sale.totalAmount.replace('$', '')), 0
  );

  return (
    <div className="space-y-6">
      {/* Sales Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold">{salesData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Sales Revenue</p>
                <p className="text-2xl font-bold">${totalSales.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Avg. Sale Value</p>
                <p className="text-2xl font-bold">${(totalSales / salesData.length).toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Sales ({salesData.length} records)</CardTitle>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Record New Sale
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Sale ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Product</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Quantity</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Unit Price</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Total</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {salesData.map((sale) => (
                  <tr key={sale.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 text-sm font-mono">{sale.id}</td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900">{sale.productName}</div>
                      <div className="text-sm text-gray-500">SKU: {sale.productId}</div>
                    </td>
                    <td className="py-4 px-4">{sale.quantity}</td>
                    <td className="py-4 px-4">{sale.unitPrice}</td>
                    <td className="py-4 px-4 font-semibold">{sale.totalAmount}</td>
                    <td className="py-4 px-4 text-sm">{new Date(sale.date).toLocaleDateString()}</td>
                    <td className="py-4 px-4">
                      <Badge className={getStatusColor(sale.status)}>
                        {sale.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {salesData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No sales records found. Record your first sale to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
