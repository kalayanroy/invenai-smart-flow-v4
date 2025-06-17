
import { useState, useEffect } from 'react';

export interface Purchase {
  id: string;
  productId: string;
  productName: string;
  supplier: string;
  quantity: number;
  unitPrice: string;
  totalAmount: string;
  date: string;
  status: 'Received' | 'Pending' | 'Ordered' | 'Cancelled';
  notes?: string;
}

const initialPurchases: Purchase[] = [];

const PURCHASES_STORAGE_KEY = 'inventory-purchases';

export const usePurchases = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(PURCHASES_STORAGE_KEY);
    if (stored) {
      try {
        setPurchases(JSON.parse(stored));
      } catch (error) {
        console.error('Error parsing stored purchases:', error);
        setPurchases(initialPurchases);
        localStorage.setItem(PURCHASES_STORAGE_KEY, JSON.stringify(initialPurchases));
      }
    } else {
      setPurchases(initialPurchases);
      localStorage.setItem(PURCHASES_STORAGE_KEY, JSON.stringify(initialPurchases));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(PURCHASES_STORAGE_KEY, JSON.stringify(purchases));
  }, [purchases]);

  const addPurchase = (purchaseData: Omit<Purchase, 'id'>) => {
    const newPurchase: Purchase = {
      ...purchaseData,
      id: `PUR${String(purchases.length + 1).padStart(3, '0')}`,
    };
    setPurchases(prev => [...prev, newPurchase]);
    console.log('New purchase added:', newPurchase.id);
    return newPurchase;
  };

  const updatePurchase = (id: string, updates: Partial<Purchase>) => {
    setPurchases(prev => prev.map(purchase => 
      purchase.id === id ? { ...purchase, ...updates } : purchase
    ));
    console.log('Purchase updated:', id);
  };

  const deletePurchase = (id: string) => {
    setPurchases(prev => prev.filter(purchase => purchase.id !== id));
    console.log('Purchase deleted:', id);
  };

  const clearAllPurchases = () => {
    setPurchases([]);
    localStorage.setItem(PURCHASES_STORAGE_KEY, JSON.stringify([]));
    console.log('All purchases cleared');
  };

  return {
    purchases,
    addPurchase,
    updatePurchase,
    deletePurchase,
    clearAllPurchases
  };
};
