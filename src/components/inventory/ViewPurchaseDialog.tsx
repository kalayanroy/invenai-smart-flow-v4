
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Purchase } from '@/hooks/usePurchases';

interface ViewPurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchase: Purchase | null;
}

export const ViewPurchaseDialog = ({ open, onOpenChange, purchase }: ViewPurchaseDialogProps) => {
  if (!purchase) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Purchase Details - {purchase.id}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Purchase ID</label>
              <p className="text-sm font-mono bg-gray-50 p-2 rounded">{purchase.id}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Date</label>
              <p className="text-sm bg-gray-50 p-2 rounded">{new Date(purchase.date).toLocaleDateString()}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Product</label>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-sm font-medium">{purchase.productName}</p>
                <p className="text-xs text-gray-500">SKU: {purchase.productId}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Supplier</label>
              <p className="text-sm bg-gray-50 p-2 rounded">{purchase.supplier}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Quantity</label>
              <p className="text-sm bg-gray-50 p-2 rounded">{purchase.quantity}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Unit Price</label>
              <p className="text-sm bg-gray-50 p-2 rounded">{purchase.unitPrice}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Total Amount</label>
              <p className="text-sm font-semibold bg-gray-50 p-2 rounded">{purchase.totalAmount}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Status</label>
              <div className="bg-gray-50 p-2 rounded">
                <Badge className={
                  purchase.status === 'Received' ? 'bg-green-100 text-green-800' :
                  purchase.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                  purchase.status === 'Ordered' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }>
                  {purchase.status}
                </Badge>
              </div>
            </div>
          </div>

          {purchase.notes && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Notes</label>
              <p className="text-sm bg-gray-50 p-3 rounded border">{purchase.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
