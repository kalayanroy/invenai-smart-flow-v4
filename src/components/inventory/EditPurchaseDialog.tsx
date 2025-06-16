
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Purchase } from '@/hooks/usePurchases';

interface EditPurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchase: Purchase | null;
  onPurchaseUpdated: (id: string, updates: Partial<Purchase>) => void;
}

export const EditPurchaseDialog = ({ open, onOpenChange, purchase, onPurchaseUpdated }: EditPurchaseDialogProps) => {
  const [formData, setFormData] = useState({
    supplier: '',
    quantity: 1,
    unitPrice: '',
    status: 'Pending' as Purchase['status'],
    notes: ''
  });

  useEffect(() => {
    if (purchase) {
      setFormData({
        supplier: purchase.supplier,
        quantity: purchase.quantity,
        unitPrice: purchase.unitPrice.replace('$', ''),
        status: purchase.status,
        notes: purchase.notes || ''
      });
    }
  }, [purchase]);

  if (!purchase) return null;

  const unitPriceNum = parseFloat(formData.unitPrice) || 0;
  const totalAmount = unitPriceNum * formData.quantity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updates: Partial<Purchase> = {
      supplier: formData.supplier,
      quantity: formData.quantity,
      unitPrice: `$${unitPriceNum.toFixed(2)}`,
      totalAmount: `$${totalAmount.toFixed(2)}`,
      status: formData.status,
      notes: formData.notes
    };

    onPurchaseUpdated(purchase.id, updates);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Purchase - {purchase.id}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Product</Label>
              <div className="bg-gray-50 p-3 rounded border">
                <p className="font-medium">{purchase.productName}</p>
                <p className="text-sm text-gray-500">SKU: {purchase.productId}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier *</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({...formData, supplier: e.target.value})}
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
                type="number"
                step="0.01"
                min="0"
                value={formData.unitPrice}
                onChange={(e) => setFormData({...formData, unitPrice: e.target.value})}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: Purchase['status']) => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ordered">Ordered</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Received">Received</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Purchase Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Unit Price:</span> ${unitPriceNum.toFixed(2)}
              </div>
              <div>
                <span className="text-gray-600">Quantity:</span> {formData.quantity}
              </div>
              <div className="col-span-2 text-lg font-semibold">
                <span className="text-gray-600">Total Amount:</span> ${totalAmount.toFixed(2)}
              </div>
            </div>
          </div>

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
            <Button type="submit">
              Update Purchase
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
