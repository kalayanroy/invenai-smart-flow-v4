
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Printer, Download, Package, AlertTriangle, CheckCircle } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useSales } from '@/hooks/useSales';
import { usePurchases } from '@/hooks/usePurchases';

export const StockManagement = () => {
  const { products } = useProducts();
  const { sales } = useSales();
  const { purchases } = usePurchases();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Calculate stock movements
  const getProductMovements = (productId: string) => {
    const productSales = sales.filter(sale => sale.productId === productId);
    const productPurchases = purchases.filter(purchase => purchase.productId === productId);
    
    const totalSold = productSales.reduce((sum, sale) => sum + sale.quantity, 0);
    const totalPurchased = productPurchases.reduce((sum, purchase) => sum + purchase.quantity, 0);
    
    return { totalSold, totalPurchased };
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    const matchesStatus = !statusFilter || product.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get unique categories
  const categories = [...new Set(products.map(p => p.category))];

  // Print function
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Stock Management Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .header { text-align: center; margin-bottom: 30px; }
            .summary { margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Stock Management Report</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="summary">
            <p><strong>Total Products:</strong> ${filteredProducts.length}</p>
            <p><strong>Low Stock Items:</strong> ${filteredProducts.filter(p => p.status === 'Low Stock').length}</p>
            <p><strong>Out of Stock Items:</strong> ${filteredProducts.filter(p => p.status === 'Out of Stock').length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Reorder Point</th>
                <th>Status</th>
                <th>Total Sold</th>
                <th>Total Purchased</th>
              </tr>
            </thead>
            <tbody>
              ${filteredProducts.map(product => {
                const movements = getProductMovements(product.id);
                return `
                  <tr>
                    <td>${product.sku}</td>
                    <td>${product.name}</td>
                    <td>${product.category}</td>
                    <td>${product.stock}</td>
                    <td>${product.reorderPoint}</td>
                    <td>${product.status}</td>
                    <td>${movements.totalSold}</td>
                    <td>${movements.totalPurchased}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Export to CSV
  const handleExport = () => {
    const headers = ['SKU', 'Product Name', 'Category', 'Current Stock', 'Reorder Point', 'Status', 'Total Sold', 'Total Purchased'];
    const csvData = [
      headers.join(','),
      ...filteredProducts.map(product => {
        const movements = getProductMovements(product.id);
        return [
          product.sku,
          `"${product.name}"`,
          product.category,
          product.stock,
          product.reorderPoint,
          product.status,
          movements.totalSold,
          movements.totalPurchased
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'In Stock': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Low Stock': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'Out of Stock': return <Package className="h-4 w-4 text-red-600" />;
      default: return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

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
    <div className="space-y-6">
      {/* Stock Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">In Stock</p>
                <p className="text-2xl font-bold">{products.filter(p => p.status === 'In Stock').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold">{products.filter(p => p.status === 'Low Stock').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold">{products.filter(p => p.status === 'Out of Stock').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Stock Management</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePrint} className="flex items-center gap-2">
                <Printer className="h-4 w-4" />
                Print Report
              </Button>
              <Button variant="outline" onClick={handleExport} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="In Stock">In Stock</SelectItem>
                <SelectItem value="Low Stock">Low Stock</SelectItem>
                <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                <SelectItem value="Overstocked">Overstocked</SelectItem>
              </SelectContent>
            </Select>
            
            {(searchTerm || categoryFilter || statusFilter) && (
              <Button 
                variant="ghost" 
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('');
                  setStatusFilter('');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>

          {/* Stock Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Product</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Current Stock</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Reorder Point</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Total Sold</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Total Purchased</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Net Movement</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const movements = getProductMovements(product.id);
                  const netMovement = movements.totalPurchased - movements.totalSold;
                  
                  return (
                    <tr key={product.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(product.status)}
                          <div>
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm">{product.category}</td>
                      <td className="py-4 px-4">
                        <span className="font-semibold">{product.stock}</span>
                        <span className="text-sm text-gray-500 ml-1">{product.unit}</span>
                      </td>
                      <td className="py-4 px-4 text-sm">{product.reorderPoint}</td>
                      <td className="py-4 px-4">
                        <Badge className={getStatusColor(product.status)}>
                          {product.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-sm">{movements.totalSold}</td>
                      <td className="py-4 px-4 text-sm">{movements.totalPurchased}</td>
                      <td className="py-4 px-4">
                        <span className={`text-sm font-medium ${netMovement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {netMovement >= 0 ? '+' : ''}{netMovement}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No products found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
