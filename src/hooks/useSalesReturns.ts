
import { useState, useEffect } from 'react';

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

const initialReturns: SalesReturn[] = [];

const RETURNS_STORAGE_KEY = 'inventory-sales-returns';

export const useSalesReturns = () => {
  const [returns, setReturns] = useState<SalesReturn[]>([]);

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
    localStorage.setItem(RETURNS_STORAGE_KEY, JSON.stringify(returns));
  }, [returns]);

  const addReturn = (returnData: Omit<SalesReturn, 'id'>) => {
    const newReturn: SalesReturn = {
      ...returnData,
      id: `RET${String(returns.length + 1).padStart(3, '0')}`,
    };
    setReturns(prev => [...prev, newReturn]);
    console.log('New return added:', newReturn.id);
    return newReturn;
  };

  const updateReturn = (id: string, updates: Partial<SalesReturn>) => {
    setReturns(prev => prev.map(returnItem => 
      returnItem.id === id ? { ...returnItem, ...updates } : returnItem
    ));
    console.log('Return updated:', id);
  };

  const deleteReturn = (id: string) => {
    setReturns(prev => prev.filter(returnItem => returnItem.id !== id));
    console.log('Return deleted:', id);
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

  const clearAllReturns = () => {
    setReturns([]);
    localStorage.setItem(RETURNS_STORAGE_KEY, JSON.stringify([]));
    console.log('All sales returns cleared');
  };

  return {
    returns,
    addReturn,
    updateReturn,
    deleteReturn,
    processReturn,
    clearAllReturns
  };
};
