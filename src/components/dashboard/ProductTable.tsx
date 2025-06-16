
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, MoreHorizontal } from 'lucide-react';

const products = [
  {
    id: 'SKU001',
    name: 'Wireless Bluetooth Headphones',
    category: 'Electronics',
    stock: 245,
    reorderPoint: 50,
    price: '$89.99',
    status: 'In Stock',
    aiRecommendation: 'Increase order quantity by 20%'
  },
  {
    id: 'SKU002',
    name: 'Cotton T-Shirt - Blue',
    category: 'Clothing',
    stock: 12,
    reorderPoint: 25,
    price: '$24.99',
    status: 'Low Stock',
    aiRecommendation: 'Reorder immediately'
  },
  {
    id: 'SKU003',
    name: 'Garden Watering Can',
    category: 'Home & Garden',
    stock: 0,
    reorderPoint: 15,
    price: '$34.99',
    status: 'Out of Stock',
    aiRecommendation: 'Critical: Lost sales opportunity'
  },
  {
    id: 'SKU004',
    name: 'Running Shoes - Size 10',
    category: 'Sports',
    stock: 78,
    reorderPoint: 30,
    price: '$129.99',
    status: 'In Stock',
    aiRecommendation: 'Optimal stock level'
  },
  {
    id: 'SKU005',
    name: 'Programming Textbook',
    category: 'Books',
    stock: 156,
    reorderPoint: 20,
    price: '$59.99',
    status: 'Overstocked',
    aiRecommendation: 'Consider promotion to reduce inventory'
  },
];

export const ProductTable = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock': return 'bg-green-100 text-green-800';
      case 'Low Stock': return 'bg-yellow-100 text-yellow-800';
      case 'Out of Stock': return 'bg-red-100 text-red-800';
      case 'Overstocked': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Inventory</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Product</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">SKU</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Stock</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">AI Recommendation</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.category} • {product.price}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm font-mono">{product.id}</td>
                  <td className="py-4 px-4">
                    <div className="text-sm">
                      <div className="font-medium">{product.stock} units</div>
                      <div className="text-gray-500">Reorder at {product.reorderPoint}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge className={getStatusColor(product.status)}>
                      {product.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded-lg max-w-xs">
                      {product.aiRecommendation}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
