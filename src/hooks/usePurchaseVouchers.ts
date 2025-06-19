
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PurchaseVoucherItem {
  id?: string;
  productId: string;
  productName: string;
  supplier: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}

export interface PurchaseVoucher {
  id: string;
  voucherNumber: string;
  supplierName: string;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  paymentMethod: string;
  status: 'Ordered' | 'Received' | 'Pending' | 'Cancelled';
  notes?: string;
  date: string;
  items: PurchaseVoucherItem[];
}

export const usePurchaseVouchers = () => {
  const [purchaseVouchers, setPurchaseVouchers] = useState<PurchaseVoucher[]>([]);

  useEffect(() => {
    fetchPurchaseVouchers();
  }, []);

  const fetchPurchaseVouchers = async () => {
    try {
      console.log('Fetching purchase vouchers from Supabase...');
      const { data: vouchers, error: vouchersError } = await supabase
        .from('purchase_vouchers')
        .select('*')
        .order('created_at', { ascending: false });

      if (vouchersError) {
        console.error('Error fetching vouchers:', vouchersError);
        return;
      }

      const { data: voucherItems, error: itemsError } = await supabase
        .from('purchase_voucher_items')
        .select('*');

      if (itemsError) {
        console.error('Error fetching voucher items:', itemsError);
        return;
      }

      const mappedVouchers = vouchers.map(voucher => ({
        id: voucher.id,
        voucherNumber: voucher.voucher_number,
        supplierName: voucher.supplier_name,
        totalAmount: voucher.total_amount,
        discountAmount: voucher.discount_amount || 0,
        finalAmount: voucher.final_amount,
        paymentMethod: voucher.payment_method || 'Cash',
        status: voucher.status as 'Ordered' | 'Received' | 'Pending' | 'Cancelled',
        notes: voucher.notes,
        date: voucher.date,
        items: voucherItems
          .filter(item => item.voucher_id === voucher.id)
          .map(item => ({
            id: item.id,
            productId: item.product_id,
            productName: item.product_name,
            supplier: item.supplier,
            quantity: item.quantity,
            unitPrice: item.unit_price,
            totalAmount: item.total_amount
          }))
      }));

      setPurchaseVouchers(mappedVouchers);
    } catch (error) {
      console.error('Error in fetchPurchaseVouchers:', error);
    }
  };

  const createPurchaseVoucher = async (voucherData: Omit<PurchaseVoucher, 'id'>) => {
    try {
      console.log('Creating purchase voucher:', voucherData);
      
      const voucherId = `PV${Date.now()}`;
      
      const { error: voucherError } = await supabase
        .from('purchase_vouchers')
        .insert([{
          id: voucherId,
          voucher_number: voucherData.voucherNumber,
          supplier_name: voucherData.supplierName,
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

      const voucherItems = voucherData.items.map(item => ({
        voucher_id: voucherId,
        product_id: item.productId,
        product_name: item.productName,
        supplier: item.supplier,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_amount: item.totalAmount
      }));

      const { error: itemsError } = await supabase
        .from('purchase_voucher_items')
        .insert(voucherItems);

      if (itemsError) {
        console.error('Error creating voucher items:', itemsError);
        throw itemsError;
      }

      await fetchPurchaseVouchers();
      return voucherId;
    } catch (error) {
      console.error('Error in createPurchaseVoucher:', error);
      throw error;
    }
  };

  return {
    purchaseVouchers,
    createPurchaseVoucher,
    fetchPurchaseVouchers
  };
};
