import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SalesReturn {
  id: string;
  originalSaleId?: string; // Now optional since voucher returns won't have this
  originalVoucherId?: string; // New field for voucher returns
  originalVoucherItemId?: string; // New field for voucher item returns
  sourceType?: string; // 'regular_sale' or 'voucher_sale'
  productId: string;
  productName: string;
  returnQuantity: number;
  originalQuantity: number;
  unitPrice: string;
  totalRefund: string;
  returnDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Processed' | 'Rejected';
  customerName?: string;
  notes?: string;
  processedBy?: string;
  processedDate?: string;
}

export const useSalesReturns = () => {
  const [salesReturns, setSalesReturns] = useState<SalesReturn[]>([]);

  useEffect(() => {
    fetchSalesReturns();
  }, []);

  const fetchSalesReturns = async () => {
    try {
      console.log('Fetching sales returns from Supabase...');
      const { data, error } = await supabase
        .from('sales_returns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching sales returns:', error);
        return;
      }

      console.log('Raw sales returns data from Supabase:', data);

      const mappedSalesReturns = data.map(salesReturn => ({
        id: salesReturn.id,
        originalSaleId: salesReturn.original_sale_id || undefined,
        originalVoucherId: salesReturn.original_voucher_id || undefined,
        originalVoucherItemId: salesReturn.original_voucher_item_id || undefined,
        sourceType: salesReturn.source_type || 'regular_sale',
        productId: salesReturn.product_id,
        productName: salesReturn.product_name,
        returnQuantity: salesReturn.return_quantity,
        originalQuantity: salesReturn.original_quantity,
        unitPrice: salesReturn.unit_price,
        totalRefund: salesReturn.total_refund,
        returnDate: salesReturn.return_date,
        reason: salesReturn.reason,
        status: salesReturn.status as 'Pending' | 'Approved' | 'Processed' | 'Rejected',
        customerName: salesReturn.customer_name,
        notes: salesReturn.notes,
        processedBy: salesReturn.processed_by,
        processedDate: salesReturn.processed_date
      }));

      console.log('Mapped sales returns:', mappedSalesReturns);
      setSalesReturns(mappedSalesReturns);
    } catch (error) {
      console.error('Error in fetchSalesReturns:', error);
    }
  };

  const addSalesReturn = async (salesReturnData: Omit<SalesReturn, 'id'>) => {
    try {
      console.log('Adding sales return to Supabase:', salesReturnData);

      const newSalesReturn = {
        id: `RET${String(salesReturns.length + 1).padStart(3, '0')}`,
        original_sale_id: salesReturnData.originalSaleId || null,
        original_voucher_id: salesReturnData.originalVoucherId || null,
        original_voucher_item_id: salesReturnData.originalVoucherItemId || null,
        source_type: salesReturnData.sourceType || 'regular_sale',
        product_id: salesReturnData.productId,
        product_name: salesReturnData.productName,
        return_quantity: salesReturnData.returnQuantity,
        original_quantity: salesReturnData.originalQuantity,
        unit_price: salesReturnData.unitPrice,
        total_refund: salesReturnData.totalRefund,
        return_date: salesReturnData.returnDate,
        reason: salesReturnData.reason,
        status: salesReturnData.status,
        customer_name: salesReturnData.customerName || null,
        notes: salesReturnData.notes || null,
        processed_by: salesReturnData.processedBy || null,
        processed_date: salesReturnData.processedDate || null
      };

      console.log('Prepared sales return data for Supabase:', newSalesReturn);

      const { data, error } = await supabase
        .from('sales_returns')
        .insert([newSalesReturn])
        .select()
        .single();

      if (error) {
        console.error('Supabase error adding sales return:', error);
        throw error;
      }

      console.log('Sales return successfully added to Supabase:', data);
      await fetchSalesReturns(); // Refresh the list
      return data;
    } catch (error) {
      console.error('Error in addSalesReturn:', error);
      throw error;
    }
  };

  const updateSalesReturn = async (id: string, updates: Partial<SalesReturn>) => {
    try {
      console.log('Updating sales return in Supabase:', id, updates);
      
      const dbUpdates: any = {};
      
      if (updates.originalSaleId !== undefined) dbUpdates.original_sale_id = updates.originalSaleId;
      if (updates.originalVoucherId !== undefined) dbUpdates.original_voucher_id = updates.originalVoucherId;
      if (updates.originalVoucherItemId !== undefined) dbUpdates.original_voucher_item_id = updates.originalVoucherItemId;
      if (updates.sourceType !== undefined) dbUpdates.source_type = updates.sourceType;
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
        console.error('Supabase error updating sales return:', error);
        throw error;
      }

      console.log('Sales return updated successfully in Supabase');
      await fetchSalesReturns(); // Refresh the list
    } catch (error) {
      console.error('Error in updateSalesReturn:', error);
      throw error;
    }
  };

  const deleteSalesReturn = async (id: string) => {
    try {
      console.log('Deleting sales return from Supabase:', id);
      
      const { error } = await supabase
        .from('sales_returns')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase error deleting sales return:', error);
        throw error;
      }

      console.log('Sales return deleted successfully from Supabase');
      await fetchSalesReturns(); // Refresh the list
    } catch (error) {
      console.error('Error in deleteSalesReturn:', error);
      throw error;
    }
  };

  const processReturn = async (id: string, status: 'Approved' | 'Rejected', processedBy: string) => {
    try {
      console.log('Processing sales return in Supabase:', id, status, processedBy);
      
      const updates = {
        status: status,
        processed_by: processedBy,
        processed_date: new Date().toISOString().split('T')[0]
      };

      const { error } = await supabase
        .from('sales_returns')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Supabase error processing sales return:', error);
        throw error;
      }

      console.log('Sales return processed successfully in Supabase');
      await fetchSalesReturns(); // Refresh the list
    } catch (error) {
      console.error('Error in processReturn:', error);
      throw error;
    }
  };

  const clearAllSalesReturns = async () => {
    try {
      console.log('Clearing all sales returns from Supabase...');
      
      const { error } = await supabase
        .from('sales_returns')
        .delete()
        .neq('id', ''); // Delete all records

      if (error) {
        console.error('Supabase error clearing sales returns:', error);
        throw error;
      }

      console.log('All sales returns cleared from Supabase');
      setSalesReturns([]);
    } catch (error) {
      console.error('Error in clearAllSalesReturns:', error);
      throw error;
    }
  };

  return {
    salesReturns,
    returns: salesReturns, // Add alias for backwards compatibility
    addSalesReturn,
    addReturn: addSalesReturn, // Add alias for backwards compatibility
    updateSalesReturn,
    updateReturn: updateSalesReturn, // Add alias for backwards compatibility
    deleteSalesReturn,
    deleteReturn: deleteSalesReturn, // Add alias for backwards compatibility
    processReturn,
    clearAllSalesReturns,
    fetchSalesReturns
  };
};
