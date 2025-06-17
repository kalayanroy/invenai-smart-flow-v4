
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

export const useSalesReturns = () => {
  const [returns, setReturns] = useState<SalesReturn[]>([]);

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    try {
      const { data, error } = await supabase
        .from('sales_returns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching returns:', error);
        return;
      }

      const mappedReturns = data.map(returnItem => ({
        id: returnItem.id,
        originalSaleId: returnItem.original_sale_id,
        productId: returnItem.product_id,
        productName: returnItem.product_name,
        returnQuantity: returnItem.return_quantity,
        originalQuantity: returnItem.original_quantity,
        unitPrice: returnItem.unit_price,
        totalRefund: returnItem.total_refund,
        returnDate: returnItem.return_date,
        reason: returnItem.reason,
        status: returnItem.status as 'Pending' | 'Approved' | 'Rejected' | 'Processed',
        customerName: returnItem.customer_name,
        notes: returnItem.notes,
        processedBy: returnItem.processed_by,
        processedDate: returnItem.processed_date
      }));

      setReturns(mappedReturns);
    } catch (error) {
      console.error('Error in fetchReturns:', error);
    }
  };

  const addReturn = async (returnData: Omit<SalesReturn, 'id'>) => {
    try {
      const newReturn = {
        id: `RET${String(returns.length + 1).padStart(3, '0')}`,
        original_sale_id: returnData.originalSaleId,
        product_id: returnData.productId,
        product_name: returnData.productName,
        return_quantity: returnData.returnQuantity,
        original_quantity: returnData.originalQuantity,
        unit_price: returnData.unitPrice,
        total_refund: returnData.totalRefund,
        return_date: returnData.returnDate,
        reason: returnData.reason,
        status: returnData.status,
        customer_name: returnData.customerName,
        notes: returnData.notes,
        processed_by: returnData.processedBy,
        processed_date: returnData.processedDate
      };

      const { data, error } = await supabase
        .from('sales_returns')
        .insert([newReturn])
        .select()
        .single();

      if (error) {
        console.error('Error adding return:', error);
        return null;
      }

      console.log('New return added:', data.id);
      await fetchReturns(); // Refresh the list
      return data;
    } catch (error) {
      console.error('Error in addReturn:', error);
      return null;
    }
  };

  const updateReturn = async (id: string, updates: Partial<SalesReturn>) => {
    try {
      const dbUpdates: any = {};
      
      if (updates.originalSaleId) dbUpdates.original_sale_id = updates.originalSaleId;
      if (updates.productId) dbUpdates.product_id = updates.productId;
      if (updates.productName) dbUpdates.product_name = updates.productName;
      if (updates.returnQuantity !== undefined) dbUpdates.return_quantity = updates.returnQuantity;
      if (updates.originalQuantity !== undefined) dbUpdates.original_quantity = updates.originalQuantity;
      if (updates.unitPrice) dbUpdates.unit_price = updates.unitPrice;
      if (updates.totalRefund) dbUpdates.total_refund = updates.totalRefund;
      if (updates.returnDate) dbUpdates.return_date = updates.returnDate;
      if (updates.reason) dbUpdates.reason = updates.reason;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.customerName !== undefined) dbUpdates.customer_name = updates.customerName;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.processedBy !== undefined) dbUpdates.processed_by = updates.processedBy;
      if (updates.processedDate !== undefined) dbUpdates.processed_date = updates.processedDate;

      const { error } = await supabase
        .from('sales_returns')
        .update(dbUpdates)
        .eq('id', id);

      if (error) {
        console.error('Error updating return:', error);
        return;
      }

      console.log('Return updated:', id);
      await fetchReturns(); // Refresh the list
    } catch (error) {
      console.error('Error in updateReturn:', error);
    }
  };

  const deleteReturn = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sales_returns')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting return:', error);
        return;
      }

      console.log('Return deleted:', id);
      await fetchReturns(); // Refresh the list
    } catch (error) {
      console.error('Error in deleteReturn:', error);
    }
  };

  const processReturn = async (id: string, status: 'Approved' | 'Rejected', processedBy: string) => {
    const updates: Partial<SalesReturn> = {
      status,
      processedBy,
      processedDate: new Date().toISOString().split('T')[0]
    };
    if (status === 'Approved') {
      updates.status = 'Processed';
    }
    await updateReturn(id, updates);
  };

  const clearAllReturns = async () => {
    try {
      const { error } = await supabase
        .from('sales_returns')
        .delete()
        .neq('id', ''); // Delete all records

      if (error) {
        console.error('Error clearing returns:', error);
        return;
      }

      console.log('All sales returns cleared');
      setReturns([]);
    } catch (error) {
      console.error('Error in clearAllReturns:', error);
    }
  };

  return {
    returns,
    addReturn,
    updateReturn,
    deleteReturn,
    processReturn,
    clearAllReturns,
    fetchReturns
  };
};
