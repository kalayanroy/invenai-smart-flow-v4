
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Product } from '@/hooks/useProducts';
import { useToast } from '@/hooks/use-toast';

interface ProductEditDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, updates: Partial<Product>) => void;
}

const units = ['Pieces', 'Kg', 'Liter', 'Meter', 'Box', 'Dozen'];
const categories = ['Electronics', 'Clothing', 'Food & Beverages', 'Home & Garden', 'Sports', 'Books'];

export const ProductEditDialog = ({ product, open, onOpenChange, onSave }: ProductEditDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<Product>>({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        sku: product.sku,
        barcode: product.barcode,
        category: product.category,
        purchasePrice: product.purchasePrice,
        sellPrice: product.sellPrice,
        stock: product.stock,
        reorderPoint: product.reorderPoint,
        unit: product.unit
      });
    }
  }, [product]);

  const handleSave = () => {
    if (!product || !formData.name || !formData.sku) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    onSave(product.id, formData);
    toast({
      title: "Product Updated",
      description: `${formData.name} has been updated successfully.`,
    });
    onOpenChange(false);
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Product Name *</Label>
            <Input
              value={formData.name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter product name"
            />
          </div>

          <div className="space-y-2">
            <Label>SKU *</Label>
            <Input
              value={formData.sku || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
              placeholder="Enter SKU"
            />
          </div>

          <div className="space-y-2">
            <Label>Barcode</Label>
            <Input
              value={formData.barcode || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
              placeholder="Enter barcode"
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={formData.category || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Purchase Price</Label>
            <Input
              value={formData.purchasePrice || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, purchasePrice: e.target.value }))}
              placeholder="$0.00"
            />
          </div>

          <div className="space-y-2">
            <Label>Sell Price</Label>
            <Input
              value={formData.sellPrice || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, sellPrice: e.target.value }))}
              placeholder="$0.00"
            />
          </div>

          <div className="space-y-2">
            <Label>Current Stock</Label>
            <Input
              type="number"
              value={formData.stock || 0}
              onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label>Reorder Point</Label>
            <Input
              type="number"
              value={formData.reorderPoint || 0}
              onChange={(e) => setFormData(prev => ({ ...prev, reorderPoint: parseInt(e.target.value) || 0 }))}
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label>Unit</Label>
            <Select value={formData.unit || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {units.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <Button onClick={handleSave} className="flex-1">
            Save Changes
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
