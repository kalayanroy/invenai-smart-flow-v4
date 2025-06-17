
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  stock: number;
  reorderPoint: number;
  price: string;
  purchasePrice: string;
  sellPrice: string;
  openingStock: number;
  unit: string;
  status: string;
  aiRecommendation: string;
  image?: string;
  createdAt: string;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);

  // Load products from Supabase on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        return;
      }

      const mappedProducts = data.map(product => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        barcode: product.barcode || '',
        category: product.category,
        stock: product.stock,
        reorderPoint: product.reorder_point,
        price: product.price,
        purchasePrice: product.purchase_price,
        sellPrice: product.sell_price,
        openingStock: product.opening_stock,
        unit: product.unit,
        status: product.status,
        aiRecommendation: product.ai_recommendation || '',
        image: product.image,
        createdAt: product.created_at
      }));

      setProducts(mappedProducts);
    } catch (error) {
      console.error('Error in fetchProducts:', error);
    }
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'status' | 'aiRecommendation' | 'createdAt'>) => {
    try {
      const newProduct = {
        id: productData.sku,
        name: productData.name,
        sku: productData.sku,
        barcode: productData.barcode,
        category: productData.category,
        stock: productData.openingStock,
        reorder_point: Math.max(10, Math.floor(productData.openingStock * 0.2)),
        price: productData.price,
        purchase_price: productData.purchasePrice,
        sell_price: productData.sellPrice,
        opening_stock: productData.openingStock,
        unit: productData.unit,
        status: productData.openingStock > 50 ? 'In Stock' : productData.openingStock > 0 ? 'Low Stock' : 'Out of Stock',
        ai_recommendation: productData.openingStock > 50 ? 'Optimal stock level' : 'Consider restocking',
        image: productData.image
      };

      const { data, error } = await supabase
        .from('products')
        .insert([newProduct])
        .select()
        .single();

      if (error) {
        console.error('Error adding product:', error);
        return null;
      }

      console.log('New product added:', data.name);
      await fetchProducts(); // Refresh the list
      return data;
    } catch (error) {
      console.error('Error in addProduct:', error);
      return null;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const dbUpdates: any = {};
      
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.sku) dbUpdates.sku = updates.sku;
      if (updates.barcode !== undefined) dbUpdates.barcode = updates.barcode;
      if (updates.category) dbUpdates.category = updates.category;
      if (updates.stock !== undefined) dbUpdates.stock = updates.stock;
      if (updates.reorderPoint !== undefined) dbUpdates.reorder_point = updates.reorderPoint;
      if (updates.price) dbUpdates.price = updates.price;
      if (updates.purchasePrice) dbUpdates.purchase_price = updates.purchasePrice;
      if (updates.sellPrice) dbUpdates.sell_price = updates.sellPrice;
      if (updates.openingStock !== undefined) dbUpdates.opening_stock = updates.openingStock;
      if (updates.unit) dbUpdates.unit = updates.unit;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.aiRecommendation !== undefined) dbUpdates.ai_recommendation = updates.aiRecommendation;
      if (updates.image !== undefined) dbUpdates.image = updates.image;

      const { error } = await supabase
        .from('products')
        .update(dbUpdates)
        .eq('id', id);

      if (error) {
        console.error('Error updating product:', error);
        return;
      }

      console.log('Product updated:', id);
      await fetchProducts(); // Refresh the list
    } catch (error) {
      console.error('Error in updateProduct:', error);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const productToDelete = products.find(p => p.id === id);
      if (productToDelete) {
        console.log(`Product deleted: ${productToDelete.name} (${productToDelete.sku})`);
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting product:', error);
        return;
      }

      await fetchProducts(); // Refresh the list
    } catch (error) {
      console.error('Error in deleteProduct:', error);
    }
  };

  const getProduct = (id: string) => {
    return products.find(product => product.id === id);
  };

  const clearAllProducts = async () => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .neq('id', ''); // Delete all records

      if (error) {
        console.error('Error clearing products:', error);
        return;
      }

      console.log('All products cleared');
      setProducts([]);
    } catch (error) {
      console.error('Error in clearAllProducts:', error);
    }
  };

  return {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    getProduct,
    clearAllProducts,
    fetchProducts
  };
};
