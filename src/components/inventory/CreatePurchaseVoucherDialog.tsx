
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useProducts } from '@/hooks/useProducts';
import { usePurchaseVouchers, PurchaseVoucher, PurchaseVoucherItem } from '@/hooks/usePurchaseVouchers';
import { Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CreatePurchaseVoucherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreatePurchaseVoucherDialog = ({ open, onOpenChange }: CreatePurchaseVoucherDialogProps) => {
  const { products } = useProducts();
  const { createPurchaseVoucher } = usePurchaseVouchers();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    supplierName: '',
    discountAmount: 0,
    paymentMethod: 'Cash',
    status: 'Received' as PurchaseVoucher['status'],
    notes: ''
  });

  const [items, setItems] = useState<PurchaseVoucherItem[]>([
    { productId: '', productName: '', supplier: '', quantity: 1, unitPrice: 0, totalAmount: 0 }
  ]);

  const addItem = () => {
    setItems([...items, { productId: '', productName: '', supplier: formData.supplierName, quantity: 1, unitPrice: 0, totalAmount: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof PurchaseVoucherItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      if (product) {
        updatedItems[index].productName = product.name;
        updatedItems[index].unitPrice = parseFloat(product.purchasePrice.replace(/[৳$]/g, ''));
        updatedItems[index].supplier = formData.supplierName;
      }
    }

    if (field === 'quantity' || field === 'unitPrice') {
      updatedItems[index].totalAmount = updatedItems[index].quantity * updatedItems[index].unitPrice;
    }

    setItems(updatedItems);
  };

  const totalAmount = items.reduce((sum, item) => sum + item.totalAmount, 0);
  const finalAmount = totalAmount - formData.discountAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.supplierName.trim()) {
      toast({
        title: "Error",
        description: "Please enter supplier name.",
        variant: "destructive"
      });
      return;
    }

    const validItems = items.filter(item => item.productId && item.quantity > 0);
    if (validItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one valid item.",
        variant: "destructive"
      });
      return;
    }

    try {
      const voucherNumber = `PV${Date.now()}`;
      const voucherData: Omit<PurchaseVoucher, 'id'> = {
        voucherNumber,
        supplierName: formData.supplierName,
        totalAmount,
        discountAmount: formData.discountAmount,
        finalAmount,
        paymentMethod: formData.paymentMethod,
        status: formData.status,
        notes: formData.notes,
        date: new Date().toISOString().split('T')[0],
        items: validItems.map(item => ({
          ...item,
          supplier: formData.supplierName
        }))
      };

      await createPurchaseVoucher(voucherData);
      
      toast({
        title: "Success",
        description: "Purchase voucher created successfully."
      });

      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error creating purchase voucher:', error);
      toast({
        title: "Error",
        description: "Failed to create purchase voucher.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      supplierName: '',
      discountAmount: 0,
      paymentMethod: 'Cash',
      status: 'Received',
      notes: ''
    });
    setItems([{ productId: '', productName: '', supplier: '', quantity: 1, unitPrice: 0, totalAmount: 0 }]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Purchase Voucher</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplierName">Supplier Name *</Label>
              <Input
                id="supplierName"
                value={formData.supplierName}
                onChange={(e) => {
                  setFormData({...formData, supplierName: e.target.value});
                  // Update all items with new supplier name
                  setItems(items.map(item => ({...item, supplier: e.target.value})));
                }}
                placeholder="Enter supplier name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({...formData, paymentMethod: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Mobile Banking">Mobile Banking</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Items</h3>
                <Button type="button" onClick={addItem} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end p-3 border rounded">
                    <div className="space-y-1">
                      <Label className="text-xs">Product</Label>
                      <Select 
                        value={item.productId} 
                        onValueChange={(value) => updateItem(index, 'productId', value)}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="h-8"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Unit Price</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="h-8"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Total</Label>
                      <Input
                        value={item.totalAmount.toFixed(2)}
                        readOnly
                        className="h-8 bg-gray-50"
                      />
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                      className="h-8"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discountAmount">Discount Amount</Label>
              <Input
                id="discountAmount"
                type="number"
                step="0.01"
                min="0"
                value={formData.discountAmount}
                onChange={(e) => setFormData({...formData, discountAmount: parseFloat(e.target.value) || 0})}
              />
            </div>

            <div className="space-y-2">
              <Label>Total Amount</Label>
              <div className="text-lg font-semibold">৳{totalAmount.toFixed(2)}</div>
            </div>

            <div className="space-y-2">
              <Label>Final Amount</Label>
              <div className="text-lg font-bold text-green-600">৳{finalAmount.toFixed(2)}</div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={finalAmount <= 0 || !formData.supplierName.trim()}>
              Create Purchase Voucher
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
