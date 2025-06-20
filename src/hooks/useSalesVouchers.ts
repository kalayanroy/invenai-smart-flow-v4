
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SalesVoucherItem {
  id?: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}

export interface SalesVoucher {
  id: string;
  voucherNumber: string;
  customerName?: string;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  paymentMethod: string;
  status: string;
  notes?: string;
  date: string;
  items: SalesVoucherItem[];
}

export const useSalesVouchers = () => {
  const [salesVouchers, setSalesVouchers] = useState<SalesVoucher[]>([]);

  useEffect(() => {
    fetchSalesVouchers();
  }, []);

  const fetchSalesVouchers = async () => {
    try {
      console.log('Fetching sales vouchers from Supabase...');
      
      // Fetch vouchers
      const { data: vouchersData, error: vouchersError } = await supabase
        .from('sales_vouchers')
        .select('*')
        .order('created_at', { ascending: false });

      if (vouchersError) {
        console.error('Error fetching sales vouchers:', vouchersError);
        return;
      }

      // Fetch all voucher items
      const { data: itemsData, error: itemsError } = await supabase
        .from('sales_voucher_items')
        .select('*');

      if (itemsError) {
        console.error('Error fetching sales voucher items:', itemsError);
        return;
      }

      // Combine vouchers with their items
      const mappedVouchers = vouchersData.map(voucher => ({
        id: voucher.id,
        voucherNumber: voucher.voucher_number,
        customerName: voucher.customer_name,
        totalAmount: parseFloat(voucher.total_amount),
        discountAmount: parseFloat(voucher.discount_amount || '0'),
        finalAmount: parseFloat(voucher.final_amount),
        paymentMethod: voucher.payment_method,
        status: voucher.status,
        notes: voucher.notes,
        date: voucher.date,
        items: itemsData
          .filter(item => item.voucher_id === voucher.id)
          .map(item => ({
            id: item.id,
            productId: item.product_id,
            productName: item.product_name,
            quantity: item.quantity,
            unitPrice: parseFloat(item.unit_price),
            totalAmount: parseFloat(item.total_amount)
          }))
      }));

      console.log('Mapped sales vouchers:', mappedVouchers);
      setSalesVouchers(mappedVouchers);
    } catch (error) {
      console.error('Error in fetchSalesVouchers:', error);
    }
  };

  const createSalesVoucher = async (voucherData: Omit<SalesVoucher, 'id'>) => {
    try {
      console.log('Creating sales voucher:', voucherData);

      const newVoucher = {
        id: `SV${String(salesVouchers.length + 1).padStart(4, '0')}`,
        voucher_number: voucherData.voucherNumber,
        customer_name: voucherData.customerName || null,
        total_amount: voucherData.totalAmount.toString(),
        discount_amount: voucherData.discountAmount.toString(),
        final_amount: voucherData.finalAmount.toString(),
        payment_method: voucherData.paymentMethod,
        status: voucherData.status,
        notes: voucherData.notes || null,
        date: voucherData.date
      };

      const { data: voucherResult, error: voucherError } = await supabase
        .from('sales_vouchers')
        .insert([newVoucher])
        .select()
        .single();

      if (voucherError) {
        console.error('Error creating voucher:', voucherError);
        throw voucherError;
      }

      // Insert voucher items
      const voucherItems = voucherData.items.map(item => ({
        voucher_id: newVoucher.id,
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        unit_price: item.unitPrice.toString(),
        total_amount: item.totalAmount.toString()
      }));

      const { error: itemsError } = await supabase
        .from('sales_voucher_items')
        .insert(voucherItems);

      if (itemsError) {
        console.error('Error creating voucher items:', itemsError);
        throw itemsError;
      }

      console.log('Sales voucher created successfully');
      await fetchSalesVouchers();
      return voucherResult;
    } catch (error) {
      console.error('Error in createSalesVoucher:', error);
      throw error;
    }
  };

  const updateSalesVoucher = async (id: string, updates: Partial<SalesVoucher>) => {
    try {
      console.log('Updating sales voucher:', id, updates);
      
      const dbUpdates: any = {};
      
      if (updates.voucherNumber) dbUpdates.voucher_number = updates.voucherNumber;
      if (updates.customerName !== undefined) dbUpdates.customer_name = updates.customerName;
      if (updates.totalAmount !== undefined) dbUpdates.total_amount = updates.totalAmount.toString();
      if (updates.discountAmount !== undefined) dbUpdates.discount_amount = updates.discountAmount.toString();
      if (updates.finalAmount !== undefined) dbUpdates.final_amount = updates.finalAmount.toString();
      if (updates.paymentMethod) dbUpdates.payment_method = updates.paymentMethod;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.date) dbUpdates.date = updates.date;

      const { error } = await supabase
        .from('sales_vouchers')
        .update(dbUpdates)
        .eq('id', id);

      if (error) {
        console.error('Error updating voucher:', error);
        throw error;
      }

      console.log('Sales voucher updated successfully');
      await fetchSalesVouchers();
    } catch (error) {
      console.error('Error in updateSalesVoucher:', error);
      throw error;
    }
  };

  const deleteSalesVoucher = async (id: string) => {
    try {
      console.log('Deleting sales voucher:', id);
      
      const { error } = await supabase
        .from('sales_vouchers')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting voucher:', error);
        throw error;
      }

      console.log('Sales voucher deleted successfully');
      await fetchSalesVouchers();
    } catch (error) {
      console.error('Error in deleteSalesVoucher:', error);
      throw error;
    }
  };

  return {
    salesVouchers,
    createSalesVoucher,
    updateSalesVoucher,
    deleteSalesVoucher,
    fetchSalesVouchers
  };
};
