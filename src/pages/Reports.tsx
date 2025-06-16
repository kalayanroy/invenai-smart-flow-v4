import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Filter, Calendar, Package, ShoppingCart, RefreshCw, TrendingUp, DollarSign } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useSales } from '@/hooks/useSales';
import { usePurchases } from '@/hooks/usePurchases';
import { useSalesReturns } from '@/hooks/useSalesReturns';

export const Reports = () => {
  const { products } = useProducts();
  const { sales } = useSales();
  const { purchases } = usePurchases();
  const { returns } = useSalesReturns();
  
  const [activeReport, setActiveReport] = useState('inventory');
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const reportTypes = [
    { id: 'inventory', label: 'Inventory Report', icon: Package },
    { id: 'sales', label: 'Sales Report', icon: ShoppingCart },
    { id: 'purchases', label: 'Purchase Report', icon: TrendingUp },
    { id: 'returns', label: 'Sales Returns Report', icon: RefreshCw },
    { id: 'profit-loss', label: 'Profit & Loss Report', icon: DollarSign },
    { id: 'analytics', label: 'Analytics Report', icon: FileText }
  ];

  const categories = [...new Set(products.map(p => p.category))];

  const filterDataByDate = (data: any[], dateField: string) => {
    if (dateFilter === 'all') return data;
    
    const now = new Date();
    let filterDate = new Date();
    
    switch (dateFilter) {
      case 'today':
        filterDate.setDate(now.getDate());
        break;
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case 'custom':
        if (startDate && endDate) {
          return data.filter(item => {
            const itemDate = new Date(item[dateField]);
            return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
          });
        }
        return data;
      default:
        return data;
    }
    
    return data.filter(item => new Date(item[dateField]) >= filterDate);
  };

  const calculateProfitLoss = () => {
    const filteredSales = filterDataByDate(sales.filter(s => s.status === 'Completed'), 'date');
    const filteredPurchases = filterDataByDate(purchases.filter(p => p.status === 'Received'), 'date');
    const filteredReturns = filterDataByDate(returns.filter(r => r.status === 'Processed'), 'returnDate');

    const totalRevenue = filteredSales.reduce((sum, sale) => {
      const amount = parseFloat(sale.totalAmount.replace('৳', '').replace(',', '')) || 0;
      return sum + amount;
    }, 0);

    const totalCosts = filteredPurchases.reduce((sum, purchase) => {
      const amount = parseFloat(purchase.totalAmount.replace('৳', '').replace(',', '')) || 0;
      return sum + amount;
    }, 0);

    const totalRefunds = filteredReturns.reduce((sum, returnItem) => {
      const amount = parseFloat(returnItem.totalRefund.replace('৳', '').replace(',', '')) || 0;
      return sum + amount;
    }, 0);

    const netRevenue = totalRevenue - totalRefunds;
    const grossProfit = netRevenue - totalCosts;
    const profitMargin = netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalCosts,
      totalRefunds,
      netRevenue,
      grossProfit,
      profitMargin,
      salesCount: filteredSales.length,
      purchaseCount: filteredPurchases.length,
      returnCount: filteredReturns.length
    };
  };

  const getFilteredData = () => {
    switch (activeReport) {
      case 'inventory':
        return products.filter(product => {
          const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
          const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
          return matchesCategory && matchesStatus;
        });
      case 'sales':
        return filterDataByDate(sales, 'date').filter(sale => {
          const matchesStatus = statusFilter === 'all' || sale.status === statusFilter;
          return matchesStatus;
        });
      case 'purchases':
        return filterDataByDate(purchases, 'date').filter(purchase => {
          const matchesStatus = statusFilter === 'all' || purchase.status === statusFilter;
          return matchesStatus;
        });
      case 'returns':
        return filterDataByDate(returns, 'returnDate').filter(returnItem => {
          const matchesStatus = statusFilter === 'all' || returnItem.status === statusFilter;
          return matchesStatus;
        });
      case 'profit-loss':
        return calculateProfitLoss();
      default:
        return [];
    }
  };

  const generatePDF = () => {
    const data = getFilteredData();
    const reportTitle = reportTypes.find(r => r.id === activeReport)?.label || 'Report';
    
    let content = `
      <html>
        <head>
          <title>${reportTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .filters { background: #f5f5f5; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .summary { margin: 20px 0; padding: 15px; background: #e3f2fd; border-radius: 5px; }
            .profit-summary { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .metric { padding: 10px; background: white; border-radius: 5px; text-align: center; }
            .positive { color: #10b981; }
            .negative { color: #ef4444; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${reportTitle}</h1>
            <p>Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>
          
          <div class="filters">
            <strong>Applied Filters:</strong><br>
            Date Filter: ${dateFilter}<br>
            ${categoryFilter !== 'all' ? `Category: ${categoryFilter}<br>` : ''}
            ${statusFilter !== 'all' ? `Status: ${statusFilter}<br>` : ''}
            ${startDate && endDate ? `Date Range: ${startDate} to ${endDate}<br>` : ''}
          </div>
    `;

    // Generate content based on report type
    if (activeReport === 'profit-loss') {
      const profitData = data as any;
      content += `
        <div class="summary">
          <h3>Profit & Loss Summary</h3>
          <div class="profit-summary">
            <div class="metric">
              <h4>Total Revenue</h4>
              <p style="font-size: 24px; font-weight: bold;">৳${profitData.totalRevenue.toLocaleString()}</p>
            </div>
            <div class="metric">
              <h4>Total Costs</h4>
              <p style="font-size: 24px; font-weight: bold;">৳${profitData.totalCosts.toLocaleString()}</p>
            </div>
            <div class="metric">
              <h4>Total Refunds</h4>
              <p style="font-size: 24px; font-weight: bold;">৳${profitData.totalRefunds.toLocaleString()}</p>
            </div>
            <div class="metric">
              <h4>Net Revenue</h4>
              <p style="font-size: 24px; font-weight: bold;">৳${profitData.netRevenue.toLocaleString()}</p>
            </div>
            <div class="metric">
              <h4>Gross Profit</h4>
              <p style="font-size: 24px; font-weight: bold;" class="${profitData.grossProfit >= 0 ? 'positive' : 'negative'}">
                ৳${profitData.grossProfit.toLocaleString()}
              </p>
            </div>
            <div class="metric">
              <h4>Profit Margin</h4>
              <p style="font-size: 24px; font-weight: bold;" class="${profitData.profitMargin >= 0 ? 'positive' : 'negative'}">
                ${profitData.profitMargin.toFixed(2)}%
              </p>
            </div>
          </div>
          <br>
          <p><strong>Sales Transactions:</strong> ${profitData.salesCount}</p>
          <p><strong>Purchase Transactions:</strong> ${profitData.purchaseCount}</p>
          <p><strong>Return Transactions:</strong> ${profitData.returnCount}</p>
        </div>
      `;
    } else if (activeReport === 'inventory') {
      content += `
        <div class="summary">
          <strong>Summary:</strong> Total Products: ${data.length} | 
          In Stock: ${data.filter((p: any) => p.status === 'In Stock').length} | 
          Low Stock: ${data.filter((p: any) => p.status === 'Low Stock').length} | 
          Out of Stock: ${data.filter((p: any) => p.status === 'Out of Stock').length}
        </div>
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Reorder Point</th>
              <th>Status</th>
              <th>Purchase Price</th>
              <th>Sell Price</th>
            </tr>
          </thead>
          <tbody>
            ${data.map((product: any) => `
              <tr>
                <td>${product.sku}</td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>${product.stock}</td>
                <td>${product.reorderPoint}</td>
                <td>${product.status}</td>
                <td>${product.purchasePrice}</td>
                <td>${product.sellPrice}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (activeReport === 'sales') {
      const totalAmount = data.reduce((sum: number, sale: any) => sum + parseFloat(sale.totalAmount.replace('৳', '').replace(',', '')), 0);
      content += `
        <div class="summary">
          <strong>Summary:</strong> Total Sales: ${data.length} | 
          Total Amount: ৳${totalAmount.toLocaleString()} | 
          Completed: ${data.filter((s: any) => s.status === 'Completed').length} | 
          Pending: ${data.filter((s: any) => s.status === 'Pending').length}
        </div>
        <table>
          <thead>
            <tr>
              <th>Sale ID</th>
              <th>Product Name</th>
              <th>Customer</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total Amount</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${data.map((sale: any) => `
              <tr>
                <td>${sale.id}</td>
                <td>${sale.productName}</td>
                <td>${sale.customerName || 'N/A'}</td>
                <td>${sale.quantity}</td>
                <td>${sale.unitPrice}</td>
                <td>${sale.totalAmount}</td>
                <td>${sale.date}</td>
                <td>${sale.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    content += `
          <div class="footer">
            <p>Generated by Inventory Management System</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const exportCSV = () => {
    const data = getFilteredData();
    const reportTitle = reportTypes.find(r => r.id === activeReport)?.label || 'Report';
    
    let headers: string[] = [];
    let rows: string[][] = [];

    if (activeReport === 'profit-loss') {
      const profitData = data as any;
      headers = ['Metric', 'Value'];
      rows = [
        ['Total Revenue', `৳${profitData.totalRevenue.toLocaleString()}`],
        ['Total Costs', `৳${profitData.totalCosts.toLocaleString()}`],
        ['Total Refunds', `৳${profitData.totalRefunds.toLocaleString()}`],
        ['Net Revenue', `৳${profitData.netRevenue.toLocaleString()}`],
        ['Gross Profit', `৳${profitData.grossProfit.toLocaleString()}`],
        ['Profit Margin', `${profitData.profitMargin.toFixed(2)}%`],
        ['Sales Count', profitData.salesCount.toString()],
        ['Purchase Count', profitData.purchaseCount.toString()],
        ['Return Count', profitData.returnCount.toString()]
      ];
    } else if (activeReport === 'inventory') {
      headers = ['SKU', 'Product Name', 'Category', 'Stock', 'Reorder Point', 'Status', 'Purchase Price', 'Sell Price'];
      rows = data.map((product: any) => [
        product.sku,
        product.name,
        product.category,
        product.stock.toString(),
        product.reorderPoint.toString(),
        product.status,
        product.purchasePrice,
        product.sellPrice
      ]);
    } else if (activeReport === 'sales') {
      headers = ['Sale ID', 'Product Name', 'Customer', 'Quantity', 'Unit Price', 'Total Amount', 'Date', 'Status'];
      rows = data.map((sale: any) => [
        sale.id,
        sale.productName,
        sale.customerName || '',
        sale.quantity.toString(),
        sale.unitPrice,
        sale.totalAmount,
        sale.date,
        sale.status
      ]);
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportTitle.toLowerCase().replace(' ', '-')}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const data = getFilteredData();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reports</h1>
        <div className="flex gap-2">
          <Button onClick={generatePDF} className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Print PDF
          </Button>
          <Button variant="outline" onClick={exportCSV} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="flex flex-wrap gap-2">
        {reportTypes.map(report => {
          const Icon = report.icon;
          return (
            <Button
              key={report.id}
              variant={activeReport === report.id ? "default" : "outline"}
              onClick={() => setActiveReport(report.id)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {report.label}
            </Button>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Date Filter</label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {activeReport === 'inventory' && (
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {activeReport === 'inventory' && (
                    <>
                      <SelectItem value="In Stock">In Stock</SelectItem>
                      <SelectItem value="Low Stock">Low Stock</SelectItem>
                      <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                    </>
                  )}
                  {activeReport === 'sales' && (
                    <>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {dateFilter === 'custom' && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Content */}
      <Card>
        <CardHeader>
          <CardTitle>
            {reportTypes.find(r => r.id === activeReport)?.label}
            {activeReport !== 'profit-loss' && ` (${Array.isArray(data) ? data.length : 0} records)`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeReport === 'profit-loss' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-600 mb-2">Total Revenue</h3>
                  <p className="text-2xl font-bold text-blue-900">৳{(data as any).totalRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-red-600 mb-2">Total Costs</h3>
                  <p className="text-2xl font-bold text-red-900">৳{(data as any).totalCosts.toLocaleString()}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-yellow-600 mb-2">Total Refunds</h3>
                  <p className="text-2xl font-bold text-yellow-900">৳{(data as any).totalRefunds.toLocaleString()}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-purple-600 mb-2">Net Revenue</h3>
                  <p className="text-2xl font-bold text-purple-900">৳{(data as any).netRevenue.toLocaleString()}</p>
                </div>
                <div className={`p-4 rounded-lg ${(data as any).grossProfit >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                  <h3 className={`text-sm font-medium mb-2 ${(data as any).grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Gross Profit/Loss
                  </h3>
                  <p className={`text-2xl font-bold ${(data as any).grossProfit >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                    ৳{(data as any).grossProfit.toLocaleString()}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${(data as any).profitMargin >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                  <h3 className={`text-sm font-medium mb-2 ${(data as any).profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Profit Margin
                  </h3>
                  <p className={`text-2xl font-bold ${(data as any).profitMargin >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                    ${(data as any).profitMargin.toFixed(2)}%
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Sales Transactions</p>
                  <p className="text-lg font-semibold">{(data as any).salesCount}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Purchase Transactions</p>
                  <p className="text-lg font-semibold">{(data as any).purchaseCount}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Return Transactions</p>
                  <p className="text-lg font-semibold">{(data as any).returnCount}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    {activeReport === 'inventory' && (
                      <>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">SKU</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Product</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Category</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Stock</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Price</th>
                      </>
                    )}
                    {activeReport === 'sales' && (
                      <>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Sale ID</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Product</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Customer</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Quantity</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Total</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(data) && data.map((item: any, index: number) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      {activeReport === 'inventory' && (
                        <>
                          <td className="py-3 px-4 text-sm">{item.sku}</td>
                          <td className="py-3 px-4">{item.name}</td>
                          <td className="py-3 px-4 text-sm">{item.category}</td>
                          <td className="py-3 px-4 text-sm">{item.stock} {item.unit}</td>
                          <td className="py-3 px-4">
                            <Badge className={
                              item.status === 'In Stock' ? 'bg-green-100 text-green-800' :
                              item.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }>
                              {item.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm">{item.sellPrice}</td>
                        </>
                      )}
                      {activeReport === 'sales' && (
                        <>
                          <td className="py-3 px-4 text-sm">{item.id}</td>
                          <td className="py-3 px-4">{item.productName}</td>
                          <td className="py-3 px-4 text-sm">{item.customerName || 'N/A'}</td>
                          <td className="py-3 px-4 text-sm">{item.quantity}</td>
                          <td className="py-3 px-4 text-sm font-medium">{item.totalAmount}</td>
                          <td className="py-3 px-4 text-sm">{item.date}</td>
                          <td className="py-3 px-4">
                            <Badge className={
                              item.status === 'Completed' ? 'bg-green-100 text-green-800' :
                              item.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }>
                              {item.status}
                            </Badge>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {Array.isArray(data) && data.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No data found for the selected filters.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
