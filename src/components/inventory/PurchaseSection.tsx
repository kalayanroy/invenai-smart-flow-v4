
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, ShoppingCart, Package, DollarSign } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';

export const PurchaseSection = () => {
  const { products } = useProducts();

  // Mock purchase data - in a real app, this would come from a purchases hook/API
  const purchaseData = [
    {
      id: 'PUR001',
      productId: 'SKU001',
      productName: 'Wireless Bluetooth Headphones',
      supplier: 'Tech Supplies Co.',
      quantity: 50,
      unitPrice: '$60.00',
      totalAmount: '$3,000.00',
      date: '2024-01-10',
      status: 'Received'
    },
    {
      id: 'PUR002',
      productId: 'SKU002',
      productName: 'Cotton T-Shirt - Blue',
      supplier: 'Fashion Wholesale Ltd.',
      quantity: 100,
      unitPrice: '$15.00',
      totalAmount: '$1,500.00',
      date: '2024-01-08',
      status: 'Received'
    },
    {
      id: 'PUR003',
      productId: 'SKU003',
      productName: 'Garden Watering Can',
      supplier: 'Garden Supply Inc.',
      quantity: 25,
      unitPrice: '$20.00',
      totalAmount: '$500.00',
      date: '2024-01-12',
      status: 'Pending'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Received': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Ordered': return 'bg-blue-100 text-blue-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalPurchases = purchaseData.reduce((sum, purchase) => 
    sum + parseFloat(purchase.totalAmount.replace('$', '').replace(',', '')), 0
  );

  return (
    <div className="space-y-6">
      {/* Purchase Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Purchases</p>
                <p className="text-2xl font-bold">{purchaseData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Purchase Cost</p>
                <p className="text-2xl font-bold">${totalPurchases.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Items Purchased</p>
                <p className="text-2xl font-bold">
                  {purchaseData.reduce((sum, purchase) => sum + purchase.quantity, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Purchase Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Purchase Orders ({purchaseData.length} records)</CardTitle>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Purchase Order
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Purchase ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Product</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Supplier</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Quantity</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Unit Price</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Total</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {purchaseData.map((purchase) => (
                  <tr key={purchase.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 text-sm font-mono">{purchase.id}</td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900">{purchase.productName}</div>
                      <div className="text-sm text-gray-500">SKU: {purchase.productId}</div>
                    </td>
                    <td className="py-4 px-4 text-sm">{purchase.supplier}</td>
                    <td className="py-4 px-4">{purchase.quantity}</td>
                    <td className="py-4 px-4">{purchase.unitPrice}</td>
                    <td className="py-4 px-4 font-semibold">{purchase.totalAmount}</td>
                    <td className="py-4 px-4 text-sm">{new Date(purchase.date).toLocaleDateString()}</td>
                    <td className="py-4 px-4">
                      <Badge className={getStatusColor(purchase.status)}>
                        {purchase.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {purchaseData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No purchase records found. Create your first purchase order to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
