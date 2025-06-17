
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SalesReturn } from '@/hooks/useSalesReturns';

interface EditReturnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  returnItem: SalesReturn | null;
  onReturnUpdated: (id: string, updates: Partial<SalesReturn>) => void;
}

export const EditReturnDialog = ({ open, onOpenChange, returnItem, onReturnUpdated }: EditReturnDialogProps) => {
  const [formData, setFormData] = useState({
    returnQuantity: 1,
    reason: '',
    notes: '',
    customerName: ''
  });

  useEffect(() => {
    if (returnItem) {
      setFormData({
        returnQuantity: returnItem.returnQuantity,
        reason: returnItem.reason,
        notes: returnItem.notes || '',
        customerName: returnItem.customerName || ''
      });
    }
  }, [returnItem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnItem) return;

    // Fix the unit price parsing to handle both ৳ and $ currencies
    const cleanUnitPrice = returnItem.unitPrice.replace(/[$,]/g, '');
    const unitPriceNum = parseFloat(cleanUnitPrice) || 0;
    
    const updates = {
      ...formData,
      totalRefund: `${(unitPriceNum * formData.returnQuantity).toFixed(2)}`
    };

    onReturnUpdated(returnItem.id, updates);
    onOpenChange(false);
  };

  if (!returnItem) return null;

  // Calculate the refund amount for display
  const cleanUnitPrice = returnItem.unitPrice.replace(/[$,]/g, '');
  const unitPriceNum = parseFloat(cleanUnitPrice) || 0;
  const refundAmount = unitPriceNum * formData.returnQuantity;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Return Request - {returnItem.id}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Information (Read-only) */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Product Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Product:</span>
                <div className="font-medium">{returnItem.productName}</div>
              </div>
              <div>
                <span className="text-gray-600">SKU:</span>
                <div className="font-mono">{returnItem.productId}</div>
              </div>
              <div>
                <span className="text-gray-600">Original Sale:</span>
                <div className="font-mono">{returnItem.originalSaleId}</div>
              </div>
              <div>
                <span className="text-gray-600">Unit Price:</span>
                <div className="font-medium">{returnItem.unitPrice}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                placeholder="Customer name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="returnQuantity">Return Quantity</Label>
              <Input
                id="returnQuantity"
                type="number"
                min="1"
                max={returnItem.originalQuantity}
                value={formData.returnQuantity}
                onChange={(e) => setFormData(prev => ({ ...prev, returnQuantity: parseInt(e.target.value) || 1 }))}
                required
              />
              <div className="text-sm text-gray-500">
                Max: {returnItem.originalQuantity} (original quantity)
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Total Refund Amount</Label>
            <div className="p-2 bg-green-50 rounded border font-semibold text-green-700">
              ৳{refundAmount.toFixed(2)}
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

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Update Return Request
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
