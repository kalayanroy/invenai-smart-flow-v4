
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarIcon, User, Package, RotateCcw, DollarSign } from 'lucide-react';
import { SalesReturn } from '@/hooks/useSalesReturns';

interface ViewReturnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  returnItem: SalesReturn | null;
}

export const ViewReturnDialog = ({ open, onOpenChange, returnItem }: ViewReturnDialogProps) => {
  if (!returnItem) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Approved': return 'bg-blue-100 text-blue-800';
      case 'Processed': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Return Request Details</DialogTitle>
            <Badge className={getStatusColor(returnItem.status)}>
              {returnItem.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Return Information */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Return Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Return ID:</span>
                  <div className="font-mono font-medium">{returnItem.id}</div>
                </div>
                <div>
                  <span className="text-gray-600">Original Sale ID:</span>
                  <div className="font-mono font-medium">{returnItem.originalSaleId}</div>
                </div>
                <div>
                  <span className="text-gray-600">Return Date:</span>
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    {new Date(returnItem.returnDate).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <Badge className={`${getStatusColor(returnItem.status)} ml-2`}>
                    {returnItem.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Information */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Product Information
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Product Name:</span>
                  <span className="font-medium">{returnItem.productName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">SKU:</span>
                  <span className="font-mono">{returnItem.productId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Return Quantity:</span>
                  <span className="font-medium">{returnItem.returnQuantity} / {returnItem.originalQuantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Unit Price:</span>
                  <span className="font-medium">{returnItem.unitPrice}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer Information
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer Name:</span>
                  <span className="font-medium">{returnItem.customerName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Return Reason:</span>
                  <span className="font-medium">{returnItem.reason}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Financial Information
              </h3>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Refund Amount:</span>
                <span className="text-xl font-bold text-green-600">{returnItem.totalRefund}</span>
              </div>
            </CardContent>
          </Card>

          {/* Processing Information */}
          {(returnItem.processedBy || returnItem.processedDate) && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Processing Information</h3>
                <div className="space-y-2 text-sm">
                  {returnItem.processedBy && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Processed By:</span>
                      <span className="font-medium">{returnItem.processedBy}</span>
                    </div>
                  )}
                  {returnItem.processedDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Processed Date:</span>
                      <span className="font-medium">{new Date(returnItem.processedDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Notes */}
          {returnItem.notes && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Additional Notes</h3>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                  {returnItem.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
