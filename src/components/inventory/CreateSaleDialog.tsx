
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useProducts } from '@/hooks/useProducts';
import { Sale } from '@/hooks/useSales';

interface CreateSaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaleCreated: (sale: Omit<Sale, 'id'>) => void;
}

export const CreateSaleDialog = ({ open, onOpenChange, onSaleCreated }: CreateSaleDialogProps) => {
  const { products } = useProducts();
  const [formData, setFormData] = useState({
    productId: '',
    quantity: 1,
    customerName: '',
    status: 'Completed' as Sale['status'],
    notes: ''
  });

  const selectedProduct = products.find(p => p.id === formData.productId);
  const unitPrice = selectedProduct ? parseFloat(selectedProduct.sellPrice.replace('$', '')) : 0;
  const totalAmount = unitPrice * formData.quantity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const saleData: Omit<Sale, 'id'> = {
      productId: formData.productId,
      productName: selectedProduct.name,
      quantity: formData.quantity,
      unitPrice: selectedProduct.sellPrice,
      totalAmount: `$${totalAmount.toFixed(2)}`,
      date: new Date().toISOString().split('T')[0],
      status: formData.status,
      customerName: formData.customerName,
      notes: formData.notes
    };

    onSaleCreated(saleData);
    onOpenChange(false);
    setFormData({
      productId: '',
      quantity: 1,
      customerName: '',
      status: 'Completed',
      notes: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Record New Sale</DialogTitle>
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
                      {product.name} - {product.sellPrice}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

          {selectedProduct && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Sale Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Unit Price:</span> {selectedProduct.sellPrice}
                </div>
                <div>
                  <span className="text-gray-600">Quantity:</span> {formData.quantity}
                </div>
                <div className="col-span-2 text-lg font-semibold">
                  <span className="text-gray-600">Total Amount:</span> ${totalAmount.toFixed(2)}
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
              placeholder="Additional notes about this sale..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.productId}>
              Record Sale
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
