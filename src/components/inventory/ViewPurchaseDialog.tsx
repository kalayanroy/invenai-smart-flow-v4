
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PurchaseOrder } from '@/hooks/usePurchases';

interface ViewPurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseOrder: PurchaseOrder | null;
}

export const ViewPurchaseDialog = ({ open, onOpenChange, purchaseOrder }: ViewPurchaseDialogProps) => {
  if (!purchaseOrder) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Received': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Ordered': return 'bg-blue-100 text-blue-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Purchase Order Details - {purchaseOrder.id}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Purchase Order Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Purchase Order ID</label>
              <p className="text-sm font-mono bg-gray-50 p-2 rounded">{purchaseOrder.id}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Date</label>
              <p className="text-sm bg-gray-50 p-2 rounded">{new Date(purchaseOrder.date).toLocaleDateString()}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Supplier</label>
              <p className="text-sm bg-gray-50 p-2 rounded">{purchaseOrder.supplier}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Status</label>
              <div className="bg-gray-50 p-2 rounded">
                <Badge className={getStatusColor(purchaseOrder.status)}>
                  {purchaseOrder.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Items List */}
          <Card>
            <CardHeader>
              <CardTitle>Items ({purchaseOrder.items.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {purchaseOrder.items.map((item, index) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-xs font-medium text-gray-500">Product</label>
                        <p className="text-sm font-medium">{item.productName}</p>
                        <p className="text-xs text-gray-500">SKU: {item.productId}</p>
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium text-gray-500">Quantity</label>
                        <p className="text-sm">{item.quantity}</p>
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium text-gray-500">Unit Price</label>
                        <p className="text-sm">{item.unitPrice}</p>
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium text-gray-500">Total Amount</label>
                        <p className="text-sm font-semibold">{item.totalAmount}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Order Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total Items:</span> {purchaseOrder.items.length}
              </div>
              <div>
                <span className="text-gray-600">Total Quantity:</span> {purchaseOrder.items.reduce((sum, item) => sum + item.quantity, 0)}
              </div>
              <div className="col-span-2 text-lg font-semibold">
                <span className="text-gray-600">Total Amount:</span> ৳{purchaseOrder.totalAmount.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Notes */}
          {purchaseOrder.notes && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Notes</label>
              <p className="text-sm bg-gray-50 p-3 rounded border">{purchaseOrder.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
