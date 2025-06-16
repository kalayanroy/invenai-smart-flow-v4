
import { useState, useEffect } from 'react';
import { useJsonFileManager } from './useJsonFileManager';

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

const initialProducts: Product[] = [
  {
    id: 'SKU001',
    name: 'Wireless Bluetooth Headphones',
    sku: 'SKU001',
    barcode: '',
    category: 'Electronics',
    stock: 245,
    reorderPoint: 50,
    price: '৳89.99',
    purchasePrice: '৳60.00',
    sellPrice: '৳89.99',
    openingStock: 200,
    unit: 'Pieces',
    status: 'In Stock',
    aiRecommendation: 'Increase order quantity by 20%',
    createdAt: new Date().toISOString()
  },
  {
    id: 'SKU002',
    name: 'Cotton T-Shirt - Blue',
    sku: 'SKU002',
    barcode: '',
    category: 'Clothing',
    stock: 12,
    reorderPoint: 25,
    price: '৳24.99',
    purchasePrice: '৳15.00',
    sellPrice: '৳24.99',
    openingStock: 50,
    unit: 'Pieces',
    status: 'Low Stock',
    aiRecommendation: 'Reorder immediately',
    createdAt: new Date().toISOString()
  },
  {
    id: 'SKU003',
    name: 'Garden Watering Can',
    sku: 'SKU003',
    barcode: '',
    category: 'Home & Garden',
    stock: 0,
    reorderPoint: 15,
    price: '৳34.99',
    purchasePrice: '৳20.00',
    sellPrice: '৳34.99',
    openingStock: 30,
    unit: 'Pieces',
    status: 'Out of Stock',
    aiRecommendation: 'Critical: Lost sales opportunity',
    createdAt: new Date().toISOString()
  },
  {
    id: 'SKU004',
    name: 'Running Shoes - Size 10',
    sku: 'SKU004',
    barcode: '',
    category: 'Sports',
    stock: 78,
    reorderPoint: 30,
    price: '৳129.99',
    purchasePrice: '৳80.00',
    sellPrice: '৳129.99',
    openingStock: 100,
    unit: 'Pieces',
    status: 'In Stock',
    aiRecommendation: 'Optimal stock level',
    createdAt: new Date().toISOString()
  },
  {
    id: 'SKU005',
    name: 'Programming Textbook',
    sku: 'SKU005',
    barcode: '',
    category: 'Books',
    stock: 156,
    reorderPoint: 20,
    price: '৳59.99',
    purchasePrice: '৳35.00',
    sellPrice: '৳59.99',
    openingStock: 100,
    unit: 'Pieces',
    status: 'Overstocked',
    aiRecommendation: 'Consider promotion to reduce inventory',
    createdAt: new Date().toISOString()
  },
];

const STORAGE_KEY = 'inventory-products';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const { saveProductToJson, saveAllProductsToJson, saveProductsToFile } = useJsonFileManager();

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

  // Save products to localStorage and JSON file whenever products change
  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
      // Auto-save all products to JSON database file
      setTimeout(() => {
        saveProductsToFile(products);
      }, 500);
    }
  }, [products, saveProductsToFile]);

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
    
    // Create JSON file for new product
    setTimeout(() => {
      saveProductToJson(newProduct);
    }, 100);
    
    console.log('New product added and JSON files will be updated:', newProduct.name);
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(product => {
      if (product.id === id) {
        const updatedProduct = { ...product, ...updates };
        
        // Create updated JSON file
        setTimeout(() => {
          saveProductToJson(updatedProduct);
        }, 100);
        
        console.log('Product updated and JSON files will be refreshed:', updatedProduct.name);
        return updatedProduct;
      }
      return product;
    }));
  };

  const deleteProduct = (id: string) => {
    const productToDelete = products.find(p => p.id === id);
    if (productToDelete) {
      console.log(`Product deleted: ${productToDelete.name} (${productToDelete.sku})`);
      console.log('Product database JSON file will be updated automatically');
    }
    
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  const getProduct = (id: string) => {
    return products.find(product => product.id === id);
  };

  const exportAllProductsToFile = () => {
    saveAllProductsToJson(products);
  };

  const exportProductsDatabase = () => {
    saveProductsToFile(products);
  };

  return {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    getProduct,
    exportAllProductsToFile,
    exportProductsDatabase
  };
};
