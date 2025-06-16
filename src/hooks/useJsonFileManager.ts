
import { useEffect } from 'react';
import { Product } from './useProducts';
import { Sale } from './useSales';
import { Purchase } from './usePurchases';
import { SalesReturn } from './useSalesReturns';

export interface InventoryData {
  products: Product[];
  sales: Sale[];
  purchases: Purchase[];
  salesReturns: SalesReturn[];
  exportDate: string;
  totalValue: number;
}

export const useJsonFileManager = () => {
  
  const saveToJsonFile = (data: any, filename: string) => {
    try {
      const jsonData = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      console.log(`JSON file created: ${filename}`);
    } catch (error) {
      console.error('Error creating JSON file:', error);
    }
  };

  const saveProductsToFile = (products: Product[]) => {
    const productsData = {
      products: products,
      exportDate: new Date().toISOString(),
      totalProducts: products.length,
      categories: [...new Set(products.map(p => p.category))],
      totalValue: products.reduce((sum, p) => sum + (parseFloat(p.sellPrice.replace('৳', '')) * p.stock), 0),
      type: 'products_database'
    };
    
    saveToJsonFile(productsData, 'products-database.json');
  };

  const saveSalesToFile = (sales: Sale[]) => {
    const salesData = {
      sales: sales,
      exportDate: new Date().toISOString(),
      totalSales: sales.length,
      totalRevenue: sales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount.replace('৳', '').replace(',', '')), 0),
      type: 'sales_database'
    };
    
    saveToJsonFile(salesData, 'sales-database.json');
  };

  const savePurchasesToFile = (purchases: Purchase[]) => {
    const purchasesData = {
      purchases: purchases,
      exportDate: new Date().toISOString(),
      totalPurchases: purchases.length,
      totalCost: purchases.reduce((sum, purchase) => sum + parseFloat(purchase.totalAmount.replace('৳', '').replace(',', '')), 0),
      type: 'purchases_database'
    };
    
    saveToJsonFile(purchasesData, 'purchases-database.json');
  };

  const saveSalesReturnsToFile = (returns: SalesReturn[]) => {
    const returnsData = {
      salesReturns: returns,
      exportDate: new Date().toISOString(),
      totalReturns: returns.length,
      totalRefunds: returns.reduce((sum, returnItem) => sum + parseFloat(returnItem.totalRefund.replace('৳', '').replace(',', '')), 0),
      type: 'sales_returns_database'
    };
    
    saveToJsonFile(returnsData, 'sales-returns-database.json');
  };

  // Legacy methods for backward compatibility
  const saveProductToJson = (product: Product) => {
    const productData = {
      productInfo: product,
      exportDate: new Date().toISOString(),
      type: 'single_product'
    };
    
    const filename = `product-${product.sku}-${product.name.replace(/[^a-zA-Z0-9]/g, '-')}.json`;
    saveToJsonFile(productData, filename);
  };

  const saveAllProductsToJson = (products: Product[]) => {
    const allProductsData = {
      products: products,
      exportDate: new Date().toISOString(),
      totalProducts: products.length,
      categories: [...new Set(products.map(p => p.category))],
      totalValue: products.reduce((sum, p) => sum + (parseFloat(p.sellPrice.replace('৳', '')) * p.stock), 0),
      type: 'all_products'
    };
    
    const filename = `all-products-${new Date().toISOString().split('T')[0]}.json`;
    saveToJsonFile(allProductsData, filename);
  };

  const saveSalesToJson = (sales: Sale[]) => {
    const salesData = {
      sales: sales,
      exportDate: new Date().toISOString(),
      totalSales: sales.length,
      totalRevenue: sales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount.replace('৳', '').replace(',', '')), 0),
      type: 'sales_data'
    };
    
    const filename = `sales-data-${new Date().toISOString().split('T')[0]}.json`;
    saveToJsonFile(salesData, filename);
  };

  const savePurchasesToJson = (purchases: Purchase[]) => {
    const purchasesData = {
      purchases: purchases,
      exportDate: new Date().toISOString(),
      totalPurchases: purchases.length,
      totalCost: purchases.reduce((sum, purchase) => sum + parseFloat(purchase.totalAmount.replace('৳', '').replace(',', '')), 0),
      type: 'purchases_data'
    };
    
    const filename = `purchases-data-${new Date().toISOString().split('T')[0]}.json`;
    saveToJsonFile(purchasesData, filename);
  };

  const saveSalesReturnsToJson = (returns: SalesReturn[]) => {
    const returnsData = {
      salesReturns: returns,
      exportDate: new Date().toISOString(),
      totalReturns: returns.length,
      totalRefunds: returns.reduce((sum, returnItem) => sum + parseFloat(returnItem.totalRefund.replace('৳', '').replace(',', '')), 0),
      type: 'sales_returns_data'
    };
    
    const filename = `sales-returns-${new Date().toISOString().split('T')[0]}.json`;
    saveToJsonFile(returnsData, filename);
  };

  const saveCompleteInventoryToJson = (inventoryData: InventoryData) => {
    const completeData = {
      ...inventoryData,
      summary: {
        totalProducts: inventoryData.products.length,
        totalSales: inventoryData.sales.length,
        totalPurchases: inventoryData.purchases.length,
        totalReturns: inventoryData.salesReturns.length,
        lowStockItems: inventoryData.products.filter(p => p.status === 'Low Stock').length,
        outOfStockItems: inventoryData.products.filter(p => p.status === 'Out of Stock').length
      },
      type: 'complete_inventory'
    };
    
    const filename = `complete-inventory-${new Date().toISOString().split('T')[0]}.json`;
    saveToJsonFile(completeData, filename);
  };

  const loadFromJsonFile = (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target?.result as string);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  };

  return {
    // New database file methods
    saveProductsToFile,
    saveSalesToFile,
    savePurchasesToFile,
    saveSalesReturnsToFile,
    // Legacy methods
    saveProductToJson,
    saveAllProductsToJson,
    saveSalesToJson,
    savePurchasesToJson,
    saveSalesReturnsToJson,
    saveCompleteInventoryToJson,
    loadFromJsonFile,
    saveToJsonFile
  };
};
