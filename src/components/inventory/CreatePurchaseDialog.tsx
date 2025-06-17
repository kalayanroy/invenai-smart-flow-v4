
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useProducts } from '@/hooks/useProducts';
import { Purchase } from '@/hooks/usePurchases';

interface CreatePurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchaseCreated: (purchase: Omit<Purchase, 'id'>) => void;
}

export const CreatePurchaseDialog = ({ open, onOpenChange, onPurchaseCreated }: CreatePurchaseDialogProps) => {
  const { products } = useProducts();
  const [formData, setFormData] = useState({
    productId: '',
    supplier: '',
    quantity: 1,
    unitPrice: '',
    status: 'Ordered' as Purchase['status'],
    notes: ''
  });

  const selectedProduct = products.find(p => p.id === formData.productId);
  const unitPrice = parseFloat(formData.unitPrice.replace('৳', '')) || 0;
  const totalAmount = unitPrice * formData.quantity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const purchaseData: Omit<Purchase, 'id'> = {
      productId: formData.productId,
      productName: selectedProduct.name,
      supplier: formData.supplier,
      quantity: formData.quantity,
      unitPrice: `${formData.unitPrice}`,
      totalAmount: `${totalAmount.toFixed(2)}`,
      date: new Date().toISOString().split('T')[0],
      status: formData.status,
      notes: formData.notes
    };

    onPurchaseCreated(purchaseData);
    onOpenChange(false);
    setFormData({
      productId: '',
      supplier: '',
      quantity: 1,
      unitPrice: '',
      status: 'Ordered',
      notes: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Purchase Order</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product">Product *</Label>
              <Select value={formData.productId} onValueChange={(value) => setFormData({...formData, productId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - {product.purchasePrice}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier *</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                placeholder="Enter supplier name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unitPrice">Unit Price *</Label>
              <Input
                id="unitPrice"
                value={formData.unitPrice}
                onChange={(e) => setFormData({...formData, unitPrice: e.target.value})}
                placeholder="e.g., 50.00"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: Purchase['status']) => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ordered">Ordered</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Received" selected>Received</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {unitPrice > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Purchase Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Unit Price:</span> ৳{unitPrice.toFixed(2)}
                </div>
                <div>
                  <span className="text-gray-600">Quantity:</span> {formData.quantity}
                </div>
                <div className="col-span-2 text-lg font-semibold">
                  <span className="text-gray-600">Total Amount:</span> ৳{totalAmount.toFixed(2)}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Additional notes about this purchase..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.productId || !formData.supplier || !formData.unitPrice}>
              Create Purchase Order
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
