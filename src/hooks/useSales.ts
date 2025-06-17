
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

export const useSales = () => {
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching sales:', error);
        return;
      }

      const mappedSales = data.map(sale => ({
        id: sale.id,
        productId: sale.product_id,
        productName: sale.product_name,
        quantity: sale.quantity,
        unitPrice: sale.unit_price,
        totalAmount: sale.total_amount,
        date: sale.date,
        status: sale.status as 'Completed' | 'Pending' | 'Cancelled',
        customerName: sale.customer_name,
        notes: sale.notes
      }));

      setSales(mappedSales);
    } catch (error) {
      console.error('Error in fetchSales:', error);
    }
  };

  const addSale = async (saleData: Omit<Sale, 'id'>) => {
    try {
      const newSale = {
        id: `SALE${String(sales.length + 1).padStart(3, '0')}`,
        product_id: saleData.productId,
        product_name: saleData.productName,
        quantity: saleData.quantity,
        unit_price: saleData.unitPrice,
        total_amount: saleData.totalAmount,
        date: saleData.date,
        status: saleData.status,
        customer_name: saleData.customerName,
        notes: saleData.notes
      };

      const { data, error } = await supabase
        .from('sales')
        .insert([newSale])
        .select()
        .single();

      if (error) {
        console.error('Error adding sale:', error);
        return null;
      }

      console.log('New sale added:', data.id);
      await fetchSales(); // Refresh the list
      return data;
    } catch (error) {
      console.error('Error in addSale:', error);
      return null;
    }
  };

  const updateSale = async (id: string, updates: Partial<Sale>) => {
    try {
      const dbUpdates: any = {};
      
      if (updates.productId) dbUpdates.product_id = updates.productId;
      if (updates.productName) dbUpdates.product_name = updates.productName;
      if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
      if (updates.unitPrice) dbUpdates.unit_price = updates.unitPrice;
      if (updates.totalAmount) dbUpdates.total_amount = updates.totalAmount;
      if (updates.date) dbUpdates.date = updates.date;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.customerName !== undefined) dbUpdates.customer_name = updates.customerName;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

      const { error } = await supabase
        .from('sales')
        .update(dbUpdates)
        .eq('id', id);

      if (error) {
        console.error('Error updating sale:', error);
        return;
      }

      console.log('Sale updated:', id);
      await fetchSales(); // Refresh the list
    } catch (error) {
      console.error('Error in updateSale:', error);
    }
  };

  const deleteSale = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting sale:', error);
        return;
      }

      console.log('Sale deleted:', id);
      await fetchSales(); // Refresh the list
    } catch (error) {
      console.error('Error in deleteSale:', error);
    }
  };

  const clearAllSales = async () => {
    try {
      const { error } = await supabase
        .from('sales')
        .delete()
        .neq('id', ''); // Delete all records

      if (error) {
        console.error('Error clearing sales:', error);
        return;
      }

      console.log('All sales cleared');
      setSales([]);
    } catch (error) {
      console.error('Error in clearAllSales:', error);
    }
  };

  return {
    sales,
    addSale,
    updateSale,
    deleteSale,
    clearAllSales,
    fetchSales
  };
};
