
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProducts } from './useProducts';

export interface Purchase {
  id: string;
  productId: string;
  productName: string;
  supplier: string;
  quantity: number;
  unitPrice: string;
  totalAmount: string;
  status: 'Received' | 'Pending' | 'Ordered' | 'Cancelled';
  date: string;
  notes?: string;
  createdAt: string;
}

export const usePurchases = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const { updateProduct, products, fetchProducts } = useProducts();

  useEffect(() => {
    fetchPurchases();
  }, []);

  // Helper function to recalculate stock for a specific product
  const recalculateProductStock = async (productId: string) => {
    try {
      console.log(`Recalculating stock for product: ${productId}`);
      
      // Get the product
      const product = products.find(p => p.id === productId);
      if (!product) {
        console.error(`Product ${productId} not found`);
        return;
      }

      // Fetch all transactions for this product
      const { data: salesData } = await supabase
        .from('sales')
        .select('quantity')
        .eq('product_id', productId);

      const { data: purchasesData } = await supabase
        .from('purchases')
        .select('quantity')
        .eq('product_id', productId);

      const { data: salesReturnsData } = await supabase
        .from('sales_returns')
        .select('return_quantity')
        .eq('product_id', productId);

      const { data: salesVoucherItemsData } = await supabase
        .from('sales_voucher_items')
        .select('quantity')
        .eq('product_id', productId);

      const { data: purchaseVoucherItemsData } = await supabase
        .from('purchase_voucher_items')
        .select('quantity')
        .eq('product_id', productId);

      // Calculate totals
      const totalSold = (salesData || []).reduce((sum, sale) => sum + sale.quantity, 0);
      const totalPurchased = (purchasesData || []).reduce((sum, purchase) => sum + purchase.quantity, 0);
      const totalReturned = (salesReturnsData || []).reduce((sum, returnItem) => sum + returnItem.return_quantity, 0);
      const totalSoldVouchers = (salesVoucherItemsData || []).reduce((sum, item) => sum + item.quantity, 0);
      const totalPurchasedVouchers = (purchaseVoucherItemsData || []).reduce((sum, item) => sum + item.quantity, 0);

      // Calculate current stock
      const calculatedStock = product.openingStock + totalPurchased + totalPurchasedVouchers + totalReturned - totalSold - totalSoldVouchers;

      // Determine status
      const getStockStatus = (stock: number, reorderPoint: number) => {
        if (stock <= 0) return 'Out of Stock';
        if (stock <= reorderPoint) return 'Low Stock';
        return 'In Stock';
      };

      const newStatus = getStockStatus(calculatedStock, product.reorderPoint);

      console.log(`Updating stock for ${product.name}: ${product.stock} -> ${calculatedStock}, Status: ${newStatus}`);

      // Update the product stock and status
      await updateProduct(productId, { 
        stock: calculatedStock,
        status: newStatus
      });

    } catch (error) {
      console.error('Error recalculating product stock:', error);
    }
  };

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

      const mappedPurchases = data.map(purchase => ({
        id: purchase.id,
        productId: purchase.product_id,
        productName: purchase.product_name,
        supplier: purchase.supplier,
        quantity: purchase.quantity,
        unitPrice: purchase.unit_price,
        totalAmount: purchase.total_amount,
        status: purchase.status as Purchase['status'],
        date: purchase.date,
        notes: purchase.notes,
        createdAt: purchase.created_at
      }));

      setPurchases(mappedPurchases);
    } catch (error) {
      console.error('Error in fetchPurchases:', error);
    }
  };

  const addPurchase = async (purchaseData: Omit<Purchase, 'id' | 'createdAt'>) => {
    try {
      console.log('Adding purchase to Supabase:', purchaseData);
      
      const purchaseId = `PUR${Date.now()}`;
      
      const { error } = await supabase
        .from('purchases')
        .insert([{
          id: purchaseId,
          product_id: purchaseData.productId,
          product_name: purchaseData.productName,
          supplier: purchaseData.supplier,
          quantity: purchaseData.quantity,
          unit_price: purchaseData.unitPrice,
          total_amount: purchaseData.totalAmount,
          status: purchaseData.status,
          date: purchaseData.date,
          notes: purchaseData.notes
        }]);

      if (error) {
        console.error('Supabase error adding purchase:', error);
        throw error;
      }

      console.log('Purchase added successfully to Supabase');
      
      // Automatically recalculate stock for the purchased product
      if (purchaseData.status === 'Received') {
        await recalculateProductStock(purchaseData.productId);
      }
      
      await fetchPurchases();
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
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.date) dbUpdates.date = updates.date;
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
      
      // If the purchase was updated and it's received, recalculate stock
      const purchase = purchases.find(p => p.id === id);
      if (purchase && (updates.status === 'Received' || updates.quantity !== undefined)) {
        await recalculateProductStock(purchase.productId);
      }
      
      await fetchPurchases();
    } catch (error) {
      console.error('Error in updatePurchase:', error);
      throw error;
    }
  };

  const deletePurchase = async (id: string) => {
    try {
      console.log('Deleting purchase from Supabase:', id);
      
      const purchaseToDelete = purchases.find(p => p.id === id);
      
      const { error } = await supabase
        .from('purchases')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase error deleting purchase:', error);
        throw error;
      }

      console.log('Purchase deleted successfully from Supabase');
      
      // Recalculate stock for the affected product
      if (purchaseToDelete) {
        await recalculateProductStock(purchaseToDelete.productId);
      }
      
      await fetchPurchases();
    } catch (error) {
      console.error('Error in deletePurchase:', error);
      throw error;
    }
  };

  const getPurchase = (id: string) => {
    return purchases.find(purchase => purchase.id === id);
  };

  return {
    purchases,
    addPurchase,
    updatePurchase,
    deletePurchase,
    getPurchase,
    fetchPurchases
  };
};
