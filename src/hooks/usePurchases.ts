import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
interface PurchaseItem {
  productName: string;
  quantity: number;
  unitPrice: number | string;
  totalAmount: number | string;
}
export interface Purchase {
  id: string;
  productId: string;
  productName: string;
  supplier: string;
  quantity: number;
  unitPrice: string;
  totalAmount: string;
  date: string;
  status: 'Ordered' | 'Received' | 'Pending' | 'Cancelled';
  notes?: string;
  purchaseOrderId?: string;
   items: PurchaseItem[]; // ✅ This is the missing part
}

export interface PurchaseOrder {
  id: string;
  supplier: string;
  date: string;
  status: 'Ordered' | 'Received' | 'Pending' | 'Cancelled';
  notes?: string;
  items: Purchase[];
  totalAmount: number;
}

export const usePurchases = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);

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
        notes: purchase.notes,
        purchaseOrderId: purchase.purchase_order_id || purchase.id
      }));

      console.log('Mapped purchases:', mappedPurchases);
      setPurchases(mappedPurchases);

      // Group purchases into purchase orders
      const ordersMap = new Map<string, PurchaseOrder>();
      
      mappedPurchases.forEach(purchase => {
        const orderId = purchase.purchaseOrderId || purchase.id;
        
        if (!ordersMap.has(orderId)) {
          ordersMap.set(orderId, {
            id: orderId,
            supplier: purchase.supplier,
            date: purchase.date,
            status: purchase.status,
            notes: purchase.notes,
            items: [],
            totalAmount: 0
          });
        }
        
        const order = ordersMap.get(orderId)!;
        order.items.push(purchase);
        order.totalAmount += parseFloat(purchase.totalAmount.replace('৳', '').replace(',', ''));
      });

      const orders = Array.from(ordersMap.values()).sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      setPurchaseOrders(orders);
    } catch (error) {
      console.error('Error in fetchPurchases:', error);
    }
  };

  const addPurchaseOrder = async (orderData: { 
    supplier: string; 
    status: Purchase['status']; 
    notes?: string; 
    items: Array<{
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
    }>;
  }) => {
    try {
      console.log('Adding purchase order to Supabase:', orderData);

      // Generate a unique purchase order ID
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000);
      const purchaseOrderId = `PO${timestamp}${random}`;

      const purchasePromises = orderData.items.map(async (item, index) => {
        const purchaseId = `${purchaseOrderId}-${index + 1}`;
        const totalAmount = item.quantity * item.unitPrice;

        const newPurchase = {
          id: purchaseId,
          purchase_order_id: purchaseOrderId,
          product_id: item.productId,
          product_name: item.productName,
          supplier: orderData.supplier,
          quantity: item.quantity,
          unit_price: `৳${item.unitPrice.toFixed(2)}`,
          total_amount: `৳${totalAmount.toFixed(2)}`,
          date: new Date().toISOString().split('T')[0],
          status: orderData.status,
          notes: orderData.notes || null
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

        return data;
      });

      await Promise.all(purchasePromises);
      console.log('Purchase order successfully added to Supabase');
      await fetchPurchases(); // Refresh the list
      return purchaseOrderId;
    } catch (error) {
      console.error('Error in addPurchaseOrder:', error);
      throw error;
    }
  };

  const addPurchase = async (purchaseData: Omit<Purchase, 'id'>) => {
    try {
      console.log('Adding purchase to Supabase:', purchaseData);

      // Generate a unique UUID for this purchase
      const { data: { session } } = await supabase.auth.getSession();
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000);
      const uniqueId = `PUR${timestamp}${random}`;

      const newPurchase = {
        id: uniqueId,
        product_id: purchaseData.productId,
        product_name: purchaseData.productName,
        supplier: purchaseData.supplier,
        quantity: purchaseData.quantity,
        unit_price: purchaseData.unitPrice,
        total_amount: purchaseData.totalAmount,
        date: purchaseData.date,
        status: purchaseData.status,
        notes: purchaseData.notes || null,
        purchase_order_id: purchaseData.purchaseOrderId || null
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
      if (updates.purchaseOrderId) dbUpdates.purchase_order_id = updates.purchaseOrderId;

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
      setPurchaseOrders([]);
    } catch (error) {
      console.error('Error in clearAllPurchases:', error);
      throw error;
    }
  };

  return {
    purchases,
    purchaseOrders,
    addPurchase,
    addPurchaseOrder,
    updatePurchase,
    deletePurchase,
    clearAllPurchases,
    fetchPurchases
  };
};
