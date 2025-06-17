
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Purchase {
  id: string;
  productId: string;
  productName: string;
  supplier: string;
  quantity: number;
  unitPrice: string;
  totalAmount: string;
  date: string;
  status: 'Received' | 'Pending' | 'Cancelled';
  notes?: string;
}

export const usePurchases = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      console.log('Fetching purchases from Supabase...');
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching purchases:', error);
        return;
      }

      console.log('Raw purchases data from Supabase:', data);

      const mappedPurchases = data.map(purchase => ({
        id: purchase.id,
        productId: purchase.product_id,
        productName: purchase.product_name,
        supplier: purchase.supplier,
        quantity: purchase.quantity,
        unitPrice: purchase.unit_price,
        totalAmount: purchase.total_amount,
        date: purchase.date,
        status: purchase.status as 'Received' | 'Pending' | 'Cancelled',
        notes: purchase.notes
      }));

      console.log('Mapped purchases:', mappedPurchases);
      setPurchases(mappedPurchases);
    } catch (error) {
      console.error('Error in fetchPurchases:', error);
    }
  };

  const addPurchase = async (purchaseData: Omit<Purchase, 'id'>) => {
    try {
      console.log('Adding purchase to Supabase:', purchaseData);

      const newPurchase = {
        id: `PUR${String(purchases.length + 1).padStart(3, '0')}`,
        product_id: purchaseData.productId,
        product_name: purchaseData.productName,
        supplier: purchaseData.supplier,
        quantity: purchaseData.quantity,
        unit_price: purchaseData.unitPrice,
        total_amount: purchaseData.totalAmount,
        date: purchaseData.date,
        status: purchaseData.status,
        notes: purchaseData.notes || null
      };

      console.log('Prepared purchase data for Supabase:', newPurchase);

      const { data, error } = await supabase
        .from('purchases')
        .insert([newPurchase])
        .select()
        .single();

      if (error) {
        console.error('Supabase error adding purchase:', error);
        throw error;
      }

      console.log('Purchase successfully added to Supabase:', data);
      await fetchPurchases(); // Refresh the list
      return data;
    } catch (error) {
      console.error('Error in addPurchase:', error);
      throw error;
    }
  };

  const updatePurchase = async (id: string, updates: Partial<Purchase>) => {
    try {
      console.log('Updating purchase in Supabase:', id, updates);
      
      const dbUpdates: any = {};
      
      if (updates.productId) dbUpdates.product_id = updates.productId;
      if (updates.productName) dbUpdates.product_name = updates.productName;
      if (updates.supplier) dbUpdates.supplier = updates.supplier;
      if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
      if (updates.unitPrice) dbUpdates.unit_price = updates.unitPrice;
      if (updates.totalAmount) dbUpdates.total_amount = updates.totalAmount;
      if (updates.date) dbUpdates.date = updates.date;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

      const { error } = await supabase
        .from('purchases')
        .update(dbUpdates)
        .eq('id', id);

      if (error) {
        console.error('Supabase error updating purchase:', error);
        throw error;
      }

      console.log('Purchase updated successfully in Supabase');
      await fetchPurchases(); // Refresh the list
    } catch (error) {
      console.error('Error in updatePurchase:', error);
      throw error;
    }
  };

  const deletePurchase = async (id: string) => {
    try {
      console.log('Deleting purchase from Supabase:', id);
      
      const { error } = await supabase
        .from('purchases')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase error deleting purchase:', error);
        throw error;
      }

      console.log('Purchase deleted successfully from Supabase');
      await fetchPurchases(); // Refresh the list
    } catch (error) {
      console.error('Error in deletePurchase:', error);
      throw error;
    }
  };

  const clearAllPurchases = async () => {
    try {
      console.log('Clearing all purchases from Supabase...');
      
      const { error } = await supabase
        .from('purchases')
        .delete()
        .neq('id', ''); // Delete all records

      if (error) {
        console.error('Supabase error clearing purchases:', error);
        throw error;
      }

      console.log('All purchases cleared from Supabase');
      setPurchases([]);
    } catch (error) {
      console.error('Error in clearAllPurchases:', error);
      throw error;
    }
  };

  return {
    purchases,
    addPurchase,
    updatePurchase,
    deletePurchase,
    clearAllPurchases,
    fetchPurchases
  };
};
