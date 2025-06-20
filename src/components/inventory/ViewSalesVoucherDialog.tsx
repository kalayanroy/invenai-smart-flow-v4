
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SalesVoucher } from '@/hooks/useSalesVouchers';

interface ViewSalesVoucherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  voucher: SalesVoucher | null;
}

export const ViewSalesVoucherDialog = ({ open, onOpenChange, voucher }: ViewSalesVoucherDialogProps) => {
  if (!voucher) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sales Voucher Details - {voucher.voucherNumber}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Voucher Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700">Voucher Number</label>
              <p className="text-lg font-mono">{voucher.voucherNumber}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Customer</label>
              <p className="text-lg">{voucher.customerName || 'Walk-in Customer'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <p className="text-lg">{new Date(voucher.date).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <Badge className={getStatusColor(voucher.status)}>
                {voucher.status}
              </Badge>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Method</label>
              <p className="text-lg">{voucher.paymentMethod}</p>
            </div>
            {voucher.notes && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <p className="text-lg">{voucher.notes}</p>
              </div>
            )}
          </div>

          {/* Items */}
          <div>
            <h3 className="text-lg font-medium mb-4">Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 border-b">Product</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 border-b">Quantity</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 border-b">Unit Price</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 border-b">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {voucher.items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{item.productName}</div>
                          <div className="text-sm text-gray-500">ID: {item.productId}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">{item.quantity}</td>
                      <td className="py-3 px-4">৳{item.unitPrice.toLocaleString()}</td>
                      <td className="py-3 px-4 font-medium">৳{item.totalAmount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700">Total Amount</label>
              <p className="text-xl font-semibold">৳{voucher.totalAmount.toLocaleString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Discount</label>
              <p className="text-xl font-semibold text-red-600">৳{voucher.discountAmount.toLocaleString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Final Amount</label>
              <p className="text-xl font-bold text-green-600">৳{voucher.finalAmount.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
