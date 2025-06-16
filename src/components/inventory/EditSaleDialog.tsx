
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Sale } from '@/hooks/useSales';

interface EditSaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sale: Sale | null;
  onSaleUpdated: (id: string, updates: Partial<Sale>) => void;
}

export const EditSaleDialog = ({ open, onOpenChange, sale, onSaleUpdated }: EditSaleDialogProps) => {
  const [formData, setFormData] = useState({
    quantity: 1,
    customerName: '',
    status: 'Completed' as Sale['status'],
    notes: ''
  });

  useEffect(() => {
    if (sale) {
      setFormData({
        quantity: sale.quantity,
        customerName: sale.customerName || '',
        status: sale.status,
        notes: sale.notes || ''
      });
    }
  }, [sale]);

  if (!sale) return null;

  const unitPrice = parseFloat(sale.unitPrice.replace('$', ''));
  const totalAmount = unitPrice * formData.quantity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updates: Partial<Sale> = {
      quantity: formData.quantity,
      totalAmount: `$${totalAmount.toFixed(2)}`,
      customerName: formData.customerName,
      status: formData.status,
      notes: formData.notes
    };

    onSaleUpdated(sale.id, updates);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Sale - {sale.id}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Product</Label>
              <div className="bg-gray-50 p-3 rounded border">
                <p className="font-medium">{sale.productName}</p>
                <p className="text-sm text-gray-500">SKU: {sale.productId}</p>
              </div>
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
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                placeholder="Enter customer name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: Sale['status']) => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Sale Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Unit Price:</span> {sale.unitPrice}
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
              placeholder="Additional notes about this sale..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Update Sale
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
