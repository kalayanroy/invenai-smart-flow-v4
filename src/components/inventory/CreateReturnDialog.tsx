
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSales } from '@/hooks/useSales';
import { useSalesVouchers } from '@/hooks/useSalesVouchers';

interface CreateReturnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReturnCreated: (returnData: any) => void;
}

export const CreateReturnDialog = ({ open, onOpenChange, onReturnCreated }: CreateReturnDialogProps) => {
  const { sales } = useSales();
  const { salesVouchers } = useSalesVouchers();
  const [activeTab, setActiveTab] = useState('regular-sales');
  const [formData, setFormData] = useState({
    originalSaleId: '',
    originalVoucherId: '',
    originalVoucherItemId: '',
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

  const handleRegularSaleSelect = (saleId: string) => {
    const sale = sales.find(s => s.id === saleId);
    if (sale) {
      const unitPriceNum = parseFloat(sale.unitPrice.replace('৳', ''));
      setFormData(prev => ({
        ...prev,
        originalSaleId: saleId,
        originalVoucherId: '',
        originalVoucherItemId: '',
        productId: sale.productId,
        productName: sale.productName,
        originalQuantity: sale.quantity,
        unitPrice: sale.unitPrice,
        customerName: sale.customerName || '',
        totalRefund: `৳${(unitPriceNum * prev.returnQuantity).toFixed(2)}`
      }));
    }
  };

  const handleVoucherSelect = (voucherId: string) => {
    const voucher = salesVouchers.find(v => v.id === voucherId);
    if (voucher) {
      setFormData(prev => ({
        ...prev,
        originalSaleId: '',
        originalVoucherId: voucherId,
        originalVoucherItemId: '',
        productId: '',
        productName: '',
        originalQuantity: 0,
        unitPrice: '',
        customerName: voucher.customerName || '',
        totalRefund: ''
      }));
    }
  };

  const handleVoucherItemSelect = (itemId: string) => {
    const voucher = salesVouchers.find(v => v.id === formData.originalVoucherId);
    if (voucher) {
      const item = voucher.items.find(i => i.id === itemId);
      if (item) {
        setFormData(prev => ({
          ...prev,
          originalVoucherItemId: itemId,
          productId: item.productId,
          productName: item.productName,
          originalQuantity: item.quantity,
          unitPrice: `৳${item.unitPrice}`,
          totalRefund: `৳${(item.unitPrice * prev.returnQuantity).toFixed(2)}`
        }));
      }
    }
  };

  const handleQuantityChange = (quantity: number) => {
    const unitPriceNum = parseFloat(formData.unitPrice.replace('৳', '')) || 0;
    setFormData(prev => ({
      ...prev,
      returnQuantity: quantity,
      totalRefund: `৳${(unitPriceNum * quantity).toFixed(2)}`
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const returnData = {
      ...formData,
      returnDate: new Date().toISOString().split('T')[0],
      status: 'Pending' as const,
      sourceType: activeTab === 'regular-sales' ? 'regular_sale' : 'voucher_sale'
    };

    onReturnCreated(returnData);
    onOpenChange(false);
    
    // Reset form
    setFormData({
      originalSaleId: '',
      originalVoucherId: '',
      originalVoucherItemId: '',
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
    setActiveTab('regular-sales');
  };

  const selectedVoucher = salesVouchers.find(v => v.id === formData.originalVoucherId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Return Request</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="regular-sales">Regular Sales</TabsTrigger>
              <TabsTrigger value="voucher-sales">Voucher Sales</TabsTrigger>
            </TabsList>

            <TabsContent value="regular-sales" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="originalSaleId">Original Sale</Label>
                  <Select value={formData.originalSaleId} onValueChange={handleRegularSaleSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select original sale" />
                    </SelectTrigger>
                    <SelectContent>
                      {sales.map(sale => (
                        <SelectItem key={sale.id} value={sale.id}>
                          {sale.id} - {sale.productName} ({sale.customerName || 'Walk-in'})
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
            </TabsContent>

            <TabsContent value="voucher-sales" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="originalVoucherId">Sales Voucher</Label>
                  <Select value={formData.originalVoucherId} onValueChange={handleVoucherSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sales voucher" />
                    </SelectTrigger>
                    <SelectContent>
                      {salesVouchers.map(voucher => (
                        <SelectItem key={voucher.id} value={voucher.id}>
                          {voucher.voucherNumber} - {voucher.customerName || 'Walk-in'} (৳{voucher.finalAmount})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedVoucher && (
                  <div className="space-y-2">
                    <Label htmlFor="originalVoucherItemId">Voucher Item</Label>
                    <Select value={formData.originalVoucherItemId} onValueChange={handleVoucherItemSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select item" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedVoucher.items.map((item, index) => (
                          <SelectItem key={item.id || index} value={item.id || index.toString()}>
                            {item.productName} (Qty: {item.quantity}, Price: ৳{item.unitPrice})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                    placeholder="Customer name"
                    disabled={!!formData.originalVoucherId}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

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
            <Button 
              type="submit" 
              disabled={
                !formData.reason || 
                (!formData.originalSaleId && !formData.originalVoucherItemId)
              }
            >
              Create Return Request
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
