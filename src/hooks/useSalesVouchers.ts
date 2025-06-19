
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProducts } from './useProducts';

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
  status: 'Completed' | 'Pending' | 'Cancelled';
  notes?: string;
  date: string;
  items: SalesVoucherItem[];
}

export const useSalesVouchers = () => {
  const [salesVouchers, setSalesVouchers] = useState<SalesVoucher[]>([]);
  const { updateStock } = useProducts();

  useEffect(() => {
    fetchSalesVouchers();
  }, []);

  const fetchSalesVouchers = async () => {
    try {
      console.log('Fetching sales vouchers from Supabase...');
      const { data: vouchers, error: vouchersError } = await supabase
        .from('sales_vouchers')
        .select('*')
        .order('created_at', { ascending: false });

      if (vouchersError) {
        console.error('Error fetching vouchers:', vouchersError);
        return;
      }

      const { data: voucherItems, error: itemsError } = await supabase
        .from('sales_voucher_items')
        .select('*');

      if (itemsError) {
        console.error('Error fetching voucher items:', itemsError);
        return;
      }

      const mappedVouchers = vouchers.map(voucher => ({
        id: voucher.id,
        voucherNumber: voucher.voucher_number,
        customerName: voucher.customer_name,
        totalAmount: voucher.total_amount,
        discountAmount: voucher.discount_amount || 0,
        finalAmount: voucher.final_amount,
        paymentMethod: voucher.payment_method || 'Cash',
        status: voucher.status as 'Completed' | 'Pending' | 'Cancelled',
        notes: voucher.notes,
        date: voucher.date,
        items: voucherItems
          .filter(item => item.voucher_id === voucher.id)
          .map(item => ({
            id: item.id,
            productId: item.product_id,
            productName: item.product_name,
            quantity: item.quantity,
            unitPrice: item.unit_price,
            totalAmount: item.total_amount
          }))
      }));

      setSalesVouchers(mappedVouchers);
    } catch (error) {
      console.error('Error in fetchSalesVouchers:', error);
    }
  };

  const createSalesVoucher = async (voucherData: Omit<SalesVoucher, 'id'>) => {
    try {
      console.log('Creating sales voucher:', voucherData);
      
      const voucherId = `SV${Date.now()}`;
      
      // Start a transaction-like approach by creating voucher first
      const { error: voucherError } = await supabase
        .from('sales_vouchers')
        .insert([{
          id: voucherId,
          voucher_number: voucherData.voucherNumber,
          customer_name: voucherData.customerName,
          total_amount: voucherData.totalAmount,
          discount_amount: voucherData.discountAmount,
          final_amount: voucherData.finalAmount,
          payment_method: voucherData.paymentMethod,
          status: voucherData.status,
          notes: voucherData.notes,
          date: voucherData.date
        }]);

      if (voucherError) {
        console.error('Error creating voucher:', voucherError);
        throw voucherError;
      }

      // Create voucher items
      const voucherItems = voucherData.items.map(item => ({
        voucher_id: voucherId,
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_amount: item.totalAmount
      }));

      const { error: itemsError } = await supabase
        .from('sales_voucher_items')
        .insert(voucherItems);

      if (itemsError) {
        console.error('Error creating voucher items:', itemsError);
        throw itemsError;
      }

      // Update stock for each item
      for (const item of voucherData.items) {
        await updateStock(item.productId, item.quantity, 'subtract');
      }

      await fetchSalesVouchers();
      return voucherId;
    } catch (error) {
      console.error('Error in createSalesVoucher:', error);
      throw error;
    }
  };

  return {
    salesVouchers,
    createSalesVoucher,
    fetchSalesVouchers
  };
};
