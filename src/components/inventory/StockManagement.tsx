import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Filter, Printer, Download, Package, AlertTriangle, CheckCircle, Loader2, ChevronDown, Check } from 'lucide-react';
import { useProducts, Product } from '@/hooks/useProducts';
import { useSales } from '@/hooks/useSales';
import { usePurchases } from '@/hooks/usePurchases';
import { useSalesReturns } from '@/hooks/useSalesReturns';
import { useSalesVouchers } from '@/hooks/useSalesVouchers';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

export const StockManagement = () => {
  const { products, loading, hasMore, loadMoreProducts } = useProducts();
  const { sales } = useSales();
  const { purchases } = usePurchases();
  const { salesReturns } = useSalesReturns();
  const { salesVouchers } = useSalesVouchers();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [displayedProducts, setDisplayedProducts] = useState(20);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  // Product dropdown states
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedProductFromDropdown, setSelectedProductFromDropdown] = useState<Product | null>(null);
  const [dropdownSearchTerm, setDropdownSearchTerm] = useState('');
  const [dropdownSearchResults, setDropdownSearchResults] = useState<Product[]>([]);
  const [isDropdownSearching, setIsDropdownSearching] = useState(false);

  // Search products in database for dropdown
  const searchProductsInDatabase = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setDropdownSearchResults([]);
      return;
    }

    setIsDropdownSearching(true);
    try {
      console.log('Searching products in database:', query);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${query}%,sku.ilike.%${query}%,barcode.ilike.%${query}%,category.ilike.%${query}%`)
        .order('name')
        .limit(20);

      if (error) {
        console.error('Error searching products:', error);
        return;
      }

      const mappedProducts = data.map(product => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        barcode: product.barcode || '',
        category: product.category,
        stock: product.stock,
        reorderPoint: product.reorder_point,
        price: product.price,
        purchasePrice: product.purchase_price,
        sellPrice: product.sell_price,
        openingStock: product.opening_stock,
        unit: product.unit,
        status: product.status,
        aiRecommendation: product.ai_recommendation || '',
        image: product.image,
        createdAt: product.created_at
      }));

      console.log(`Found ${mappedProducts.length} products matching "${query}"`);
      setDropdownSearchResults(mappedProducts);
    } catch (error) {
      console.error('Error in searchProductsInDatabase:', error);
    } finally {
      setIsDropdownSearching(false);
    }
  }, []);

  // Handle dropdown search input change
  const handleDropdownSearchChange = useCallback((value: string) => {
    setDropdownSearchTerm(value);
    searchProductsInDatabase(value);
  }, [searchProductsInDatabase]);

  // Calculate stock movements including opening stock, purchases, sales, returns, and voucher sales
  const getProductMovements = (productId: string) => {
    const product = products.find(p => p.id === productId);
    const productSales = sales.filter(sale => sale.productId === productId);
    const productPurchases = purchases.filter(purchase => purchase.productId === productId && purchase.status === 'Received');
    const productReturns = salesReturns.filter(returnItem => returnItem.productId === productId);
    
    // Get sales from vouchers
    const voucherSales = salesVouchers.reduce((total, voucher) => {
      const voucherItems = voucher.items.filter(item => item.productId === productId);
      return total + voucherItems.reduce((itemTotal, item) => itemTotal + item.quantity, 0);
    }, 0);
    
    const openingStock = product?.openingStock || 0;
    const totalSold = productSales.reduce((sum, sale) => sum + sale.quantity, 0) + voucherSales;
    const totalPurchased = productPurchases.reduce((sum, purchase) => sum + purchase.quantity, 0);
    const totalReturned = productReturns.reduce((sum, returnItem) => sum + returnItem.returnQuantity, 0);
    
    return { openingStock, totalSold, totalPurchased, totalReturned, voucherSales };
  };

  // Enhanced filter products with dropdown selection support - show ONLY selected product when one is chosen
  const filteredProducts = React.useMemo(() => {
    console.log('Filtering products with search term:', searchTerm);
    console.log('Selected product from dropdown:', selectedProductFromDropdown);
    
    // If a specific product is selected from dropdown, show ONLY that product
    if (selectedProductFromDropdown) {
      console.log('Showing only selected product:', selectedProductFromDropdown.name);
      return [selectedProductFromDropdown];
    }
    
    // Otherwise apply normal filtering
    const filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });

    return filtered;
  }, [products, searchTerm, categoryFilter, statusFilter, selectedProductFromDropdown]);

  // Filter products for dropdown based on dropdown search term
  const dropdownFilteredProducts = React.useMemo(() => {
    if (dropdownSearchTerm.trim() && dropdownSearchResults.length > 0) {
      return dropdownSearchResults;
    }
    
    if (!dropdownSearchTerm.trim()) {
      return products.slice(0, 10); // Show first 10 if no search
    }
    
    // Local search in loaded products as fallback
    const searchLower = dropdownSearchTerm.toLowerCase().trim();
    return products.filter(product => 
      product.name.toLowerCase().includes(searchLower) ||
      product.sku.toLowerCase().includes(searchLower) ||
      product.category.toLowerCase().includes(searchLower) ||
      (product.barcode && product.barcode.toLowerCase().includes(searchLower))
    ).slice(0, 10);
  }, [products, dropdownSearchTerm, dropdownSearchResults]);

  // Get displayed products with lazy loading
  const productsToShow = filteredProducts.slice(0, displayedProducts);

  // Get unique categories
  const categories = [...new Set(products.map(p => p.category))];

  // Handle product selection from dropdown
  const handleProductSelectFromDropdown = (product: Product) => {
    console.log('Product selected from dropdown:', product.name, product.id);
    setSelectedProductFromDropdown(product);
    setDropdownOpen(false);
    setDropdownSearchTerm('');
    setDropdownSearchResults([]);
    // Clear other filters to ensure the selected product is visible
    setSearchTerm('');
    setCategoryFilter('all');
    setStatusFilter('all');
  };

  // Handle scroll for lazy loading
  const handleScroll = useCallback(() => {
    if (!tableRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = tableRef.current;
    const threshold = 100;

    if (scrollTop + clientHeight >= scrollHeight - threshold && 
        displayedProducts < filteredProducts.length && 
        !isLoadingMore) {
      setIsLoadingMore(true);
      
      // Simulate loading delay for smooth UX
      setTimeout(() => {
        setDisplayedProducts(prev => Math.min(prev + 20, filteredProducts.length));
        setIsLoadingMore(false);
      }, 300);
    }
  }, [displayedProducts, filteredProducts.length, isLoadingMore]);

  // Attach scroll listener
  useEffect(() => {
    const tableElement = tableRef.current;
    if (!tableElement) return;

    const throttledScroll = throttle(handleScroll, 200);
    tableElement.addEventListener('scroll', throttledScroll, { passive: true });
    
    return () => {
      tableElement.removeEventListener('scroll', throttledScroll);
    };
  }, [handleScroll]);

  // Reset displayed products when filters change
  useEffect(() => {
    setDisplayedProducts(20);
  }, [searchTerm, categoryFilter, statusFilter, selectedProductFromDropdown]);

  // Throttle function to limit scroll event frequency
  function throttle(func: Function, limit: number) {
    let inThrottle: boolean;
    return function(this: any, ...args: any[]) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Load more products from backend
  const handleLoadMoreProducts = useCallback(async () => {
    if (hasMore && !loading) {
      await loadMoreProducts();
    }
  }, [hasMore, loading, loadMoreProducts]);

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
                <th>Opening Stock</th>
                <th>Current Stock</th>
                <th>Reorder Point</th>
                <th>Status</th>
                <th>Regular Sales</th>
                <th>Voucher Sales</th>
                <th>Total Sold</th>
                <th>Total Purchased</th>
                <th>Total Returned</th>
                <th>Calculated Stock</th>
              </tr>
            </thead>
            <tbody>
              ${filteredProducts.map(product => {
                const movements = getProductMovements(product.id);
                const calculatedStock = movements.openingStock + movements.totalPurchased + movements.totalReturned - movements.totalSold;
                return `
                  <tr>
                    <td>${product.sku}</td>
                    <td>${product.name}</td>
                    <td>${product.category}</td>
                    <td>${movements.openingStock}</td>
                    <td>${product.stock}</td>
                    <td>${product.reorderPoint}</td>
                    <td>${product.status}</td>
                    <td>${movements.totalSold - movements.voucherSales}</td>
                    <td>${movements.voucherSales}</td>
                    <td>${movements.totalSold}</td>
                    <td>${movements.totalPurchased}</td>
                    <td>${movements.totalReturned}</td>
                    <td>${calculatedStock}</td>
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
    const headers = ['SKU', 'Product Name', 'Category', 'Opening Stock', 'Current Stock', 'Reorder Point', 'Status', 'Regular Sales', 'Voucher Sales', 'Total Sold', 'Total Purchased', 'Total Returned', 'Calculated Stock'];
    const csvData = [
      headers.join(','),
      ...filteredProducts.map(product => {
        const movements = getProductMovements(product.id);
        const calculatedStock = movements.openingStock + movements.totalPurchased + movements.totalReturned - movements.totalSold;
        return [
          product.sku,
          `"${product.name}"`,
          product.category,
          movements.openingStock,
          product.stock,
          product.reorderPoint,
          product.status,
          movements.totalSold - movements.voucherSales,
          movements.voucherSales,
          movements.totalSold,
          movements.totalPurchased,
          movements.totalReturned,
          calculatedStock
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

  const clearFilters = () => {
    console.log('Clearing all filters');
    setSearchTerm('');
    setCategoryFilter('all');
    setStatusFilter('all');
    setSelectedProductFromDropdown(null);
    setDropdownSearchTerm('');
    setDropdownSearchResults([]);
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

  // Count active filters
  const activeFiltersCount = React.useMemo(() => {
    let count = 0;
    if (searchTerm.trim()) count++;
    if (categoryFilter !== 'all') count++;
    if (statusFilter !== 'all') count++;
    if (selectedProductFromDropdown) count++;
    return count;
  }, [searchTerm, categoryFilter, statusFilter, selectedProductFromDropdown]);

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
            <CardTitle>
              Stock Management
              {activeFiltersCount > 0 && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  - {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} applied
                </span>
              )}
              {selectedProductFromDropdown && (
                <span className="text-sm font-normal text-green-600 ml-2">
                  - showing: {selectedProductFromDropdown.name}
                </span>
              )}
            </CardTitle>
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
              <Popover open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={dropdownOpen}
                    className="w-full justify-between h-10"
                  >
                    {selectedProductFromDropdown 
                      ? `${selectedProductFromDropdown.name} (${selectedProductFromDropdown.sku})`
                      : "Search products by name, SKU, or barcode to view specific product..."
                    }
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 bg-white border shadow-lg z-50" align="start">
                  <Command>
                    <CommandInput 
                      placeholder="Search products..." 
                      value={dropdownSearchTerm}
                      onValueChange={handleDropdownSearchChange}
                    />
                    <CommandList className="max-h-60 overflow-y-auto">
                      <CommandEmpty>
                        {isDropdownSearching ? "Searching..." : 
                         loading && !dropdownSearchTerm ? "Loading products..." : 
                         "No product found."}
                      </CommandEmpty>
                      <CommandGroup>
                        {dropdownFilteredProducts.map((product) => (
                          <CommandItem
                            key={product.id}
                            value={`${product.name}-${product.id}`}
                            onSelect={() => handleProductSelectFromDropdown(product)}
                            className="cursor-pointer"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedProductFromDropdown?.id === product.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span className="font-medium">{product.name}</span>
                              <span className="text-sm text-muted-foreground">
                                SKU: {product.sku} | Stock: {product.stock} | {product.category}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                        
                        {/* Search loading indicator */}
                        {isDropdownSearching && (
                          <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            <span className="text-sm text-gray-500">Searching products...</span>
                          </div>
                        )}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Only show other filters when no specific product is selected */}
            {!selectedProductFromDropdown && (
              <>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
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
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="In Stock">In Stock</SelectItem>
                    <SelectItem value="Low Stock">Low Stock</SelectItem>
                    <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                    <SelectItem value="Overstocked">Overstocked</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
            
            {activeFiltersCount > 0 && (
              <Button variant="outline" onClick={clearFilters}>
                Clear All Filters
              </Button>
            )}

            {!selectedProductFromDropdown && hasMore && !loading && (
              <Button 
                variant="outline" 
                onClick={handleLoadMoreProducts}
                className="flex items-center gap-2"
              >
                <Package className="h-4 w-4" />
                Load More Products
              </Button>
            )}

            {loading && (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading products...</span>
              </div>
            )}
          </div>

          {/* Results Summary */}
          <div className="mb-4 text-sm text-gray-600">
            {selectedProductFromDropdown ? (
              <span>Showing details for: <strong>{selectedProductFromDropdown.name}</strong></span>
            ) : (
              <>
                Showing {productsToShow.length} of {filteredProducts.length} products
                {displayedProducts < filteredProducts.length && (
                  <span className="ml-2 text-blue-600">
                    (Scroll down to load more)
                  </span>
                )}
              </>
            )}
          </div>

          {/* Stock Table */}
          <div className="overflow-x-auto max-h-96 overflow-y-auto" ref={tableRef}>
            <table className="w-full">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Product</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Opening Stock</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Current Stock</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Reorder Point</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Regular Sales</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Voucher Sales</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Total Purchased</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Total Returned</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Calculated Stock</th>
                </tr>
              </thead>
              <tbody>
                {productsToShow.map((product) => {
                  const movements = getProductMovements(product.id);
                  const calculatedStock = movements.openingStock + movements.totalPurchased + movements.totalReturned - movements.totalSold;
                  const regularSales = movements.totalSold - movements.voucherSales;
                  
                  return (
                    <tr 
                      key={product.id} 
                      className={cn(
                        "border-b hover:bg-gray-50 transition-colors",
                        selectedProductFromDropdown?.id === product.id && "bg-blue-50 border-blue-200"
                      )}
                    >
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
                        <span className="font-semibold">{movements.openingStock}</span>
                        <span className="text-sm text-gray-500 ml-1">{product.unit}</span>
                      </td>
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
                      <td className="py-4 px-4 text-sm">{regularSales}</td>
                      <td className="py-4 px-4 text-sm">{movements.voucherSales}</td>
                      <td className="py-4 px-4 text-sm">{movements.totalPurchased}</td>
                      <td className="py-4 px-4 text-sm">{movements.totalReturned}</td>
                      <td className="py-4 px-4">
                        <span className={`text-sm font-medium ${calculatedStock >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {calculatedStock}
                        </span>
                        {Math.abs(calculatedStock - product.stock) > 0 && (
                          <div className="text-xs text-red-500">
                            Diff: {calculatedStock - product.stock}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Loading indicator for lazy loading */}
            {isLoadingMore && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-gray-500">Loading more products...</span>
              </div>
            )}

            {/* End of list indicator */}
            {displayedProducts >= filteredProducts.length && filteredProducts.length > 0 && (
              <div className="text-center py-4 text-sm text-gray-500">
                End of list - {filteredProducts.length} products shown
              </div>
            )}
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              {activeFiltersCount > 0 || selectedProductFromDropdown ? (
                <div>
                  <p>No products found matching your search criteria.</p>
                  <p className="text-sm mt-1">
                    {searchTerm && `Search: "${searchTerm}"`}
                    {searchTerm && activeFiltersCount > 0 && ' with '}
                    {activeFiltersCount > 0 && `${activeFiltersCount} filter${activeFiltersCount > 1 ? 's' : ''} applied`}
                    {selectedProductFromDropdown && ` | Selected: ${selectedProductFromDropdown.name}`}
                  </p>
                  <Button variant="outline" onClick={clearFilters} className="mt-2">
                    Clear All Filters
                  </Button>
                </div>
              ) : (
                <p>No products found.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
