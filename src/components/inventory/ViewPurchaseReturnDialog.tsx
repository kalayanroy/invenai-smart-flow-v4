
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { PurchaseReturn } from '@/hooks/usePurchaseReturns';

interface ViewPurchaseReturnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseReturn: PurchaseReturn | null;
}

export const ViewPurchaseReturnDialog = ({ open, onOpenChange, purchaseReturn }: ViewPurchaseReturnDialogProps) => {
  if (!purchaseReturn) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Processed': return 'bg-blue-100 text-blue-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Purchase Return Details - {purchaseReturn.id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Status */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h3 className="text-base sm:text-lg font-semibold">Return Status</h3>
            <Badge className={getStatusColor(purchaseReturn.status)}>
              {purchaseReturn.status}
            </Badge>
          </div>

          {/* Product Information */}
          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
            <h3 className="font-medium mb-2 sm:mb-3">Product Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
              <div>
                <span className="text-gray-600">Product Name:</span>
                <div className="font-medium break-words">{purchaseReturn.productName}</div>
              </div>
              <div>
                <span className="text-gray-600">Product ID:</span>
                <div className="font-mono text-xs sm:text-sm break-all">{purchaseReturn.productId}</div>
              </div>
              <div>
                <span className="text-gray-600">Supplier:</span>
                <div className="break-words">{purchaseReturn.supplier}</div>
              </div>
              <div>
                <span className="text-gray-600">Purchase Order ID:</span>
                <div className="font-mono text-xs sm:text-sm break-all">{purchaseReturn.purchaseOrderId}</div>
              </div>
            </div>
          </div>

          {/* Return Details */}
          <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
            <h3 className="font-medium mb-2 sm:mb-3">Return Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
              <div>
                <span className="text-gray-600">Original Quantity:</span>
                <div className="font-medium">{purchaseReturn.originalQuantity}</div>
              </div>
              <div>
                <span className="text-gray-600">Return Quantity:</span>
                <div className="font-medium text-red-600">{purchaseReturn.returnQuantity}</div>
              </div>
              <div>
                <span className="text-gray-600">Unit Price:</span>
                <div className="font-medium">{purchaseReturn.unitPrice}</div>
              </div>
              <div>
                <span className="text-gray-600">Total Refund:</span>
                <div className="font-bold text-green-600">{purchaseReturn.totalRefund}</div>
              </div>
              <div>
                <span className="text-gray-600">Return Date:</span>
                <div>{new Date(purchaseReturn.returnDate).toLocaleDateString()}</div>
              </div>
              <div>
                <span className="text-gray-600">Reason:</span>
                <div className="break-words">{purchaseReturn.reason}</div>
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          {purchaseReturn.notes && (
            <div>
              <h3 className="font-medium mb-2">Additional Notes</h3>
              <div className="bg-gray-50 p-3 rounded border text-sm break-words">
                {purchaseReturn.notes}
              </div>
            </div>
          )}

          {/* Processing Information */}
          {(purchaseReturn.processedBy || purchaseReturn.processedDate) && (
            <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
              <h3 className="font-medium mb-2 sm:mb-3">Processing Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                {purchaseReturn.processedBy && (
                  <div>
                    <span className="text-gray-600">Processed By:</span>
                    <div className="font-medium break-words">{purchaseReturn.processedBy}</div>
                  </div>
                )}
                {purchaseReturn.processedDate && (
                  <div>
                    <span className="text-gray-600">Processed Date:</span>
                    <div>{new Date(purchaseReturn.processedDate).toLocaleDateString()}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
