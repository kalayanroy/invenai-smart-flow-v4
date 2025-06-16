
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Sale } from '@/hooks/useSales';

interface ViewSaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sale: Sale | null;
}

export const ViewSaleDialog = ({ open, onOpenChange, sale }: ViewSaleDialogProps) => {
  if (!sale) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Sale Details - {sale.id}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Sale ID</label>
              <p className="text-sm font-mono bg-gray-50 p-2 rounded">{sale.id}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Date</label>
              <p className="text-sm bg-gray-50 p-2 rounded">{new Date(sale.date).toLocaleDateString()}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Product</label>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-sm font-medium">{sale.productName}</p>
                <p className="text-xs text-gray-500">SKU: {sale.productId}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Customer</label>
              <p className="text-sm bg-gray-50 p-2 rounded">{sale.customerName || 'N/A'}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Quantity</label>
              <p className="text-sm bg-gray-50 p-2 rounded">{sale.quantity}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Unit Price</label>
              <p className="text-sm bg-gray-50 p-2 rounded">{sale.unitPrice}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Total Amount</label>
              <p className="text-sm font-semibold bg-gray-50 p-2 rounded">{sale.totalAmount}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Status</label>
              <div className="bg-gray-50 p-2 rounded">
                <Badge className={
                  sale.status === 'Completed' ? 'bg-green-100 text-green-800' :
                  sale.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }>
                  {sale.status}
                </Badge>
              </div>
            </div>
          </div>

          {sale.notes && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Notes</label>
              <p className="text-sm bg-gray-50 p-3 rounded border">{sale.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
