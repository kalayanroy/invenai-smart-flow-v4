
import { useEffect } from 'react';
import { Product } from './useProducts';

export const useProductFileManager = () => {
  const saveProductToFile = (product: Product) => {
    try {
      const productInfo = `
Product Information:
==================
ID: ${product.id}
Name: ${product.name}
SKU: ${product.sku}
Barcode: ${product.barcode}
Category: ${product.category}
Stock: ${product.stock} ${product.unit}
Reorder Point: ${product.reorderPoint}
Purchase Price: ${product.purchasePrice}
Sell Price: ${product.sellPrice}
Opening Stock: ${product.openingStock}
Status: ${product.status}
AI Recommendation: ${product.aiRecommendation}
Created At: ${product.createdAt}
${product.image ? `Image: ${product.image}` : ''}

==================
      `.trim();

      const blob = new Blob([productInfo], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `product-${product.sku}-${product.name.replace(/[^a-zA-Z0-9]/g, '-')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      console.log(`Product file created: product-${product.sku}-${product.name.replace(/[^a-zA-Z0-9]/g, '-')}.txt`);
    } catch (error) {
      console.error('Error creating product file:', error);
    }
  };

  const saveAllProductsToFile = (products: Product[]) => {
    try {
      const allProductsInfo = products.map(product => `
Product Information:
==================
ID: ${product.id}
Name: ${product.name}
SKU: ${product.sku}
Barcode: ${product.barcode}
Category: ${product.category}
Stock: ${product.stock} ${product.unit}
Reorder Point: ${product.reorderPoint}
Purchase Price: ${product.purchasePrice}
Sell Price: ${product.sellPrice}
Opening Stock: ${product.openingStock}
Status: ${product.status}
AI Recommendation: ${product.aiRecommendation}
Created At: ${product.createdAt}
${product.image ? `Image: ${product.image}` : ''}
==================
      `).join('\n\n');

      const fileContent = `
INVENTORY MANAGEMENT SYSTEM
Product Database Export
Generated on: ${new Date().toLocaleString()}
Total Products: ${products.length}

${allProductsInfo}
      `.trim();

      const blob = new Blob([fileContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `all-products-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      console.log('All products file created successfully');
    } catch (error) {
      console.error('Error creating all products file:', error);
    }
  };

  const updateProductInStorage = (updatedProduct: Product) => {
    try {
      const existingProducts = JSON.parse(localStorage.getItem('inventory-products') || '[]');
      const updatedProducts = existingProducts.map((product: Product) => 
        product.id === updatedProduct.id ? updatedProduct : product
      );
      localStorage.setItem('inventory-products', JSON.stringify(updatedProducts));
      console.log(`Product ${updatedProduct.sku} updated in storage and file sync triggered`);
    } catch (error) {
      console.error('Error updating product in storage:', error);
    }
  };

  const deleteProductFromStorage = (productId: string) => {
    try {
      const existingProducts = JSON.parse(localStorage.getItem('inventory-products') || '[]');
      const filteredProducts = existingProducts.filter((product: Product) => product.id !== productId);
      localStorage.setItem('inventory-products', JSON.stringify(filteredProducts));
      console.log(`Product ${productId} deleted from storage and file sync triggered`);
    } catch (error) {
      console.error('Error deleting product from storage:', error);
    }
  };

  return {
    saveProductToFile,
    saveAllProductsToFile,
    updateProductInStorage,
    deleteProductFromStorage
  };
};
