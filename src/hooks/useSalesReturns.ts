import { useState, useEffect } from 'react';
import { useJsonFileManager } from './useJsonFileManager';

export interface SalesReturn {
  id: string;
  originalSaleId: string;
  productId: string;
  productName: string;
  returnQuantity: number;
  originalQuantity: number;
  unitPrice: string;
  totalRefund: string;
  returnDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Processed';
  customerName?: string;
  notes?: string;
  processedBy?: string;
  processedDate?: string;
}

const initialReturns: SalesReturn[] = [
  {
    id: 'RET001',
    originalSaleId: 'SALE001',
    productId: 'SKU001',
    productName: 'Wireless Bluetooth Headphones',
    returnQuantity: 1,
    originalQuantity: 2,
    unitPrice: '৳89.99',
    totalRefund: '৳89.99',
    returnDate: '2024-01-16',
    reason: 'Defective product',
    status: 'Pending',
    customerName: 'John Doe',
    notes: 'Customer reported audio issues'
  },
  {
    id: 'RET002',
    originalSaleId: 'SALE002',
    productId: 'SKU002',
    productName: 'Cotton T-Shirt - Blue',
    returnQuantity: 2,
    originalQuantity: 5,
    unitPrice: '৳24.99',
    totalRefund: '৳49.98',
    returnDate: '2024-01-15',
    reason: 'Wrong size',
    status: 'Approved',
    customerName: 'Jane Smith',
    processedBy: 'Admin',
    processedDate: '2024-01-15'
  }
];

const RETURNS_STORAGE_KEY = 'inventory-sales-returns';

export const useSalesReturns = () => {
  const [returns, setReturns] = useState<SalesReturn[]>([]);
  const { saveSalesReturnsToJson } = useJsonFileManager();

  useEffect(() => {
    const stored = localStorage.getItem(RETURNS_STORAGE_KEY);
    if (stored) {
      try {
        setReturns(JSON.parse(stored));
      } catch (error) {
        console.error('Error parsing stored returns:', error);
        setReturns(initialReturns);
        localStorage.setItem(RETURNS_STORAGE_KEY, JSON.stringify(initialReturns));
      }
    } else {
      setReturns(initialReturns);
      localStorage.setItem(RETURNS_STORAGE_KEY, JSON.stringify(initialReturns));
    }
  }, []);

  useEffect(() => {
    if (returns.length > 0) {
      localStorage.setItem(RETURNS_STORAGE_KEY, JSON.stringify(returns));
      // Auto-save to JSON file whenever returns data changes
      setTimeout(() => {
        saveSalesReturnsToJson(returns);
      }, 500);
    }
  }, [returns, saveSalesReturnsToJson]);

  const addReturn = (returnData: Omit<SalesReturn, 'id'>) => {
    const newReturn: SalesReturn = {
      ...returnData,
      id: `RET${String(returns.length + 1).padStart(3, '0')}`,
    };
    setReturns(prev => [...prev, newReturn]);
    console.log('New return added and JSON file will be updated:', newReturn.id);
    return newReturn;
  };

  const updateReturn = (id: string, updates: Partial<SalesReturn>) => {
    setReturns(prev => prev.map(returnItem => 
      returnItem.id === id ? { ...returnItem, ...updates } : returnItem
    ));
    console.log('Return updated and JSON file will be updated:', id);
  };

  const deleteReturn = (id: string) => {
    setReturns(prev => prev.filter(returnItem => returnItem.id !== id));
    console.log('Return deleted and JSON file will be updated:', id);
  };

  const processReturn = (id: string, status: 'Approved' | 'Rejected', processedBy: string) => {
    const updates: Partial<SalesReturn> = {
      status,
      processedBy,
      processedDate: new Date().toISOString().split('T')[0]
    };
    if (status === 'Approved') {
      updates.status = 'Processed';
    }
    updateReturn(id, updates);
  };

  const exportReturnsToJson = () => {
    saveSalesReturnsToJson(returns);
  };

  return {
    returns,
    addReturn,
    updateReturn,
    deleteReturn,
    processReturn,
    exportReturnsToJson
  };
};
