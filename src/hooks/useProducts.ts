
import { useState, useEffect } from 'react';

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

const initialProducts: Product[] = [];

const STORAGE_KEY = 'inventory-products';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);

  // Load products from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsedProducts = JSON.parse(stored);
        setProducts(parsedProducts);
      } catch (error) {
        console.error('Error parsing stored products:', error);
        setProducts(initialProducts);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProducts));
      }
    } else {
      setProducts(initialProducts);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProducts));
    }
  }, []);

  // Save products to localStorage whenever products change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  const addProduct = (productData: Omit<Product, 'id' | 'status' | 'aiRecommendation' | 'createdAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: productData.sku,
      stock: productData.openingStock,
      reorderPoint: Math.max(10, Math.floor(productData.openingStock * 0.2)),
      status: productData.openingStock > 50 ? 'In Stock' : productData.openingStock > 0 ? 'Low Stock' : 'Out of Stock',
      aiRecommendation: productData.openingStock > 50 ? 'Optimal stock level' : 'Consider restocking',
      createdAt: new Date().toISOString()
    };

    setProducts(prev => [...prev, newProduct]);
    console.log('New product added:', newProduct.name);
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(product => {
      if (product.id === id) {
        const updatedProduct = { ...product, ...updates };
        console.log('Product updated:', updatedProduct.name);
        return updatedProduct;
      }
      return product;
    }));
  };

  const deleteProduct = (id: string) => {
    const productToDelete = products.find(p => p.id === id);
    if (productToDelete) {
      console.log(`Product deleted: ${productToDelete.name} (${productToDelete.sku})`);
    }
    
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  const getProduct = (id: string) => {
    return products.find(product => product.id === id);
  };

  const clearAllProducts = () => {
    setProducts([]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    console.log('All products cleared');
  };

  return {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    getProduct,
    clearAllProducts
  };
};
