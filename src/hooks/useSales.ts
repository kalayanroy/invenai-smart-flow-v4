import { useState, useEffect } from 'react';
import { useJsonFileManager } from './useJsonFileManager';

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: string;
  totalAmount: string;
  date: string;
  status: 'Completed' | 'Pending' | 'Cancelled';
  customerName?: string;
  notes?: string;
}

const initialSales: Sale[] = [
  {
    id: 'SALE001',
    productId: 'SKU001',
    productName: 'Wireless Bluetooth Headphones',
    quantity: 2,
    unitPrice: '৳89.99',
    totalAmount: '৳179.98',
    date: '2024-01-15',
    status: 'Completed',
    customerName: 'John Doe'
  },
  {
    id: 'SALE002',
    productId: 'SKU002',
    productName: 'Cotton T-Shirt - Blue',
    quantity: 5,
    unitPrice: '৳24.99',
    totalAmount: '৳124.95',
    date: '2024-01-14',
    status: 'Completed',
    customerName: 'Jane Smith'
  },
  {
    id: 'SALE003',
    productId: 'SKU004',
    productName: 'Running Shoes - Size 10',
    quantity: 1,
    unitPrice: '৳129.99',
    totalAmount: '৳129.99',
    date: '2024-01-13',
    status: 'Pending',
    customerName: 'Mike Johnson'
  }
];

const SALES_STORAGE_KEY = 'inventory-sales';

export const useSales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const { saveSalesToJson } = useJsonFileManager();

  useEffect(() => {
    const stored = localStorage.getItem(SALES_STORAGE_KEY);
    if (stored) {
      try {
        setSales(JSON.parse(stored));
      } catch (error) {
        console.error('Error parsing stored sales:', error);
        setSales(initialSales);
        localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(initialSales));
      }
    } else {
      setSales(initialSales);
      localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(initialSales));
    }
  }, []);

  useEffect(() => {
    if (sales.length > 0) {
      localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(sales));
      // Auto-save to JSON file whenever sales data changes
      setTimeout(() => {
        saveSalesToJson(sales);
      }, 500);
    }
  }, [sales, saveSalesToJson]);

  const addSale = (saleData: Omit<Sale, 'id'>) => {
    const newSale: Sale = {
      ...saleData,
      id: `SALE${String(sales.length + 1).padStart(3, '0')}`,
    };
    setSales(prev => [...prev, newSale]);
    console.log('New sale added and JSON file will be updated:', newSale.id);
    return newSale;
  };

  const updateSale = (id: string, updates: Partial<Sale>) => {
    setSales(prev => prev.map(sale => 
      sale.id === id ? { ...sale, ...updates } : sale
    ));
    console.log('Sale updated and JSON file will be updated:', id);
  };

  const deleteSale = (id: string) => {
    setSales(prev => prev.filter(sale => sale.id !== id));
    console.log('Sale deleted and JSON file will be updated:', id);
  };

  const exportSalesToJson = () => {
    saveSalesToJson(sales);
  };

  return {
    sales,
    addSale,
    updateSale,
    deleteSale,
    exportSalesToJson
  };
};
