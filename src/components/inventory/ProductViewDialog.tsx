
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/hooks/useProducts';

interface ProductViewDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProductViewDialog = ({ product, open, onOpenChange }: ProductViewDialogProps) => {
  if (!product) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock': return 'bg-green-100 text-green-800';
      case 'Low Stock': return 'bg-yellow-100 text-yellow-800';
      case 'Out of Stock': return 'bg-red-100 text-red-800';
      case 'Overstocked': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Product Details</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Image */}
          {product.image && (
            <div className="md:col-span-2">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          )}
          
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{product.name}</h3>
              <p className="text-gray-600">{product.category}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">SKU</label>
                <p className="font-mono">{product.sku}</p>
              </div>
              
              {product.barcode && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Barcode</label>
                  <p className="font-mono">{product.barcode}</p>
                </div>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-1">
                <Badge className={getStatusColor(product.status)}>
                  {product.status}
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Stock & Pricing Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Current Stock</label>
                <p className="text-lg font-semibold">{product.stock} {product.unit}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Reorder Point</label>
                <p>{product.reorderPoint} {product.unit}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Purchase Price</label>
                <p>{product.purchasePrice}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Sell Price</label>
                <p className="font-semibold">{product.sellPrice}</p>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Opening Stock</label>
              <p>{product.openingStock} {product.unit}</p>
            </div>
          </div>
          
          {/* AI Recommendation */}
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-500">AI Recommendation</label>
            <div className="mt-1 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">{product.aiRecommendation}</p>
            </div>
          </div>
          
          {/* Creation Date */}
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-500">Created At</label>
            <p className="text-sm">{new Date(product.createdAt).toLocaleString()}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
