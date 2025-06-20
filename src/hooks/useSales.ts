
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProducts } from './useProducts';

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: string;
  totalAmount: string;
  customerName?: string;
  status: 'Completed' | 'Pending' | 'Cancelled';
  date: string;
  notes?: string;
  createdAt: string;
}

export const useSales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const { updateProduct, products } = useProducts();

  useEffect(() => {
    fetchSales();
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

  const fetchSales = async () => {
    try {
      console.log('Fetching sales from Supabase...');
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
        customerName: sale.customer_name,
        status: sale.status as Sale['status'],
        date: sale.date,
        notes: sale.notes,
        createdAt: sale.created_at
      }));

      setSales(mappedSales);
    } catch (error) {
      console.error('Error in fetchSales:', error);
    }
  };

  const addSale = async (saleData: Omit<Sale, 'id' | 'createdAt'>) => {
    try {
      console.log('Adding sale to Supabase:', saleData);
      
      const saleId = `SALE${Date.now()}`;
      
      const { error } = await supabase
        .from('sales')
        .insert([{
          id: saleId,
          product_id: saleData.productId,
          product_name: saleData.productName,
          quantity: saleData.quantity,
          unit_price: saleData.unitPrice,
          total_amount: saleData.totalAmount,
          customer_name: saleData.customerName,
          status: saleData.status,
          date: saleData.date,
          notes: saleData.notes
        }]);

      if (error) {
        console.error('Supabase error adding sale:', error);
        throw error;
      }

      console.log('Sale added successfully to Supabase');
      
      // Automatically recalculate stock for the sold product
      if (saleData.status === 'Completed') {
        await recalculateProductStock(saleData.productId);
      }
      
      await fetchSales();
    } catch (error) {
      console.error('Error in addSale:', error);
      throw error;
    }
  };

  const updateSale = async (id: string, updates: Partial<Sale>) => {
    try {
      console.log('Updating sale in Supabase:', id, updates);
      
      const dbUpdates: any = {};
      
      if (updates.productId) dbUpdates.product_id = updates.productId;
      if (updates.productName) dbUpdates.product_name = updates.productName;
      if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
      if (updates.unitPrice) dbUpdates.unit_price = updates.unitPrice;
      if (updates.totalAmount) dbUpdates.total_amount = updates.totalAmount;
      if (updates.customerName !== undefined) dbUpdates.customer_name = updates.customerName;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.date) dbUpdates.date = updates.date;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

      const { error } = await supabase
        .from('sales')
        .update(dbUpdates)
        .eq('id', id);

      if (error) {
        console.error('Supabase error updating sale:', error);
        throw error;
      }

      console.log('Sale updated successfully in Supabase');
      
      // If the sale was updated and it's completed, recalculate stock
      const sale = sales.find(s => s.id === id);
      if (sale && (updates.status === 'Completed' || updates.quantity !== undefined)) {
        await recalculateProductStock(sale.productId);
      }
      
      await fetchSales();
    } catch (error) {
      console.error('Error in updateSale:', error);
      throw error;
    }
  };

  const deleteSale = async (id: string) => {
    try {
      console.log('Deleting sale from Supabase:', id);
      
      const saleToDelete = sales.find(s => s.id === id);
      
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase error deleting sale:', error);
        throw error;
      }

      console.log('Sale deleted successfully from Supabase');
      
      // Recalculate stock for the affected product
      if (saleToDelete) {
        await recalculateProductStock(saleToDelete.productId);
      }
      
      await fetchSales();
    } catch (error) {
      console.error('Error in deleteSale:', error);
      throw error;
    }
  };

  const getSale = (id: string) => {
    return sales.find(sale => sale.id === id);
  };

  return {
    sales,
    addSale,
    updateSale,
    deleteSale,
    getSale,
    fetchSales
  };
};
