
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

const initialPurchases: Purchase[] = [
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
    if (purchases.length > 0) {
      localStorage.setItem(PURCHASES_STORAGE_KEY, JSON.stringify(purchases));
    }
  }, [purchases]);

  const addPurchase = (purchaseData: Omit<Purchase, 'id'>) => {
    const newPurchase: Purchase = {
      ...purchaseData,
      id: `PUR${String(purchases.length + 1).padStart(3, '0')}`,
    };
    setPurchases(prev => [...prev, newPurchase]);
    return newPurchase;
  };

  const updatePurchase = (id: string, updates: Partial<Purchase>) => {
    setPurchases(prev => prev.map(purchase => 
      purchase.id === id ? { ...purchase, ...updates } : purchase
    ));
  };

  const deletePurchase = (id: string) => {
    setPurchases(prev => prev.filter(purchase => purchase.id !== id));
  };

  return {
    purchases,
    addPurchase,
    updatePurchase,
    deletePurchase
  };
};
