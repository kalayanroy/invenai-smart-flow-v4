
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSales } from '@/hooks/useSales';

interface CreateReturnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReturnCreated: (returnData: any) => void;
}

export const CreateReturnDialog = ({ open, onOpenChange, onReturnCreated }: CreateReturnDialogProps) => {
  const { sales } = useSales();
  const [formData, setFormData] = useState({
    originalSaleId: '',
    productId: '',
    productName: '',
    returnQuantity: 1,
    originalQuantity: 0,
    unitPrice: '',
    totalRefund: '',
    reason: '',
    customerName: '',
    notes: ''
  });

  const handleSaleSelect = (saleId: string) => {
    const sale = sales.find(s => s.id === saleId);
    if (sale) {
      const unitPriceNum = parseFloat(sale.unitPrice.replace('$', ''));
      setFormData(prev => ({
        ...prev,
        originalSaleId: saleId,
        productId: sale.productId,
        productName: sale.productName,
        originalQuantity: sale.quantity,
        unitPrice: sale.unitPrice,
        customerName: sale.customerName || '',
        totalRefund: `${(unitPriceNum * prev.returnQuantity).toFixed(2)}`
      }));
    }
  };

  const handleQuantityChange = (quantity: number) => {
    const unitPriceNum = parseFloat(formData.unitPrice.replace('$', '')) || 0;
    setFormData(prev => ({
      ...prev,
      returnQuantity: quantity,
      totalRefund: `$${(unitPriceNum * quantity).toFixed(2)}`
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const returnData = {
      ...formData,
      returnDate: new Date().toISOString().split('T')[0],
      status: 'Pending' as const
    };

    onReturnCreated(returnData);
    onOpenChange(false);
    
    // Reset form
    setFormData({
      originalSaleId: '',
      productId: '',
      productName: '',
      returnQuantity: 1,
      originalQuantity: 0,
      unitPrice: '',
      totalRefund: '',
      reason: '',
      customerName: '',
      notes: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Return Request</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="originalSaleId">Original Sale</Label>
              <Select value={formData.originalSaleId} onValueChange={handleSaleSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select original sale" />
                </SelectTrigger>
                <SelectContent>
                  {sales.map(sale => (
                    <SelectItem key={sale.id} value={sale.id}>
                      {sale.id} - {sale.productName} ({sale.customerName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                placeholder="Customer name"
                disabled={!!formData.originalSaleId}
              />
            </div>
          </div>

          {formData.productName && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Product</Label>
                  <div className="p-2 bg-gray-50 rounded border">
                    <div className="font-medium">{formData.productName}</div>
                    <div className="text-sm text-gray-500">SKU: {formData.productId}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Unit Price</Label>
                  <div className="p-2 bg-gray-50 rounded border font-medium">
                    {formData.unitPrice}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="returnQuantity">Return Quantity</Label>
                  <Input
                    id="returnQuantity"
                    type="number"
                    min="1"
                    max={formData.originalQuantity}
                    value={formData.returnQuantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Original Quantity</Label>
                  <div className="p-2 bg-gray-50 rounded border">
                    {formData.originalQuantity}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Total Refund</Label>
                  <div className="p-2 bg-green-50 rounded border font-semibold text-green-700">
                    {formData.totalRefund}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Return</Label>
                <Select value={formData.reason} onValueChange={(value) => setFormData(prev => ({ ...prev, reason: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Defective product">Defective product</SelectItem>
                    <SelectItem value="Wrong size">Wrong size</SelectItem>
                    <SelectItem value="Wrong color">Wrong color</SelectItem>
                    <SelectItem value="Not as described">Not as described</SelectItem>
                    <SelectItem value="Customer changed mind">Customer changed mind</SelectItem>
                    <SelectItem value="Damaged in shipping">Damaged in shipping</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional details about the return..."
                  rows={3}
                />
              </div>
            </>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.originalSaleId || !formData.reason}>
              Create Return Request
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
