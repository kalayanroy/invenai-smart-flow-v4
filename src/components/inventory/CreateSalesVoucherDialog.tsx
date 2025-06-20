
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useProducts } from '@/hooks/useProducts';
import { useSalesVouchers, SalesVoucher, SalesVoucherItem } from '@/hooks/useSalesVouchers';
import { Plus, Trash2, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CreateSalesVoucherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateSalesVoucherDialog = ({ open, onOpenChange }: CreateSalesVoucherDialogProps) => {
  const { products } = useProducts();
  const { createSalesVoucher } = useSalesVouchers();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    customerName: '',
    discountAmount: 0,
    paymentMethod: 'Cash',
    status: 'Completed' as SalesVoucher['status'],
    notes: ''
  });

  const [items, setItems] = useState<SalesVoucherItem[]>([
    { productId: '', productName: '', quantity: 1, unitPrice: 0, totalAmount: 0 }
  ]);

  const addItem = () => {
    setItems([...items, { productId: '', productName: '', quantity: 1, unitPrice: 0, totalAmount: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof SalesVoucherItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      if (product) {
        updatedItems[index].productName = product.name;
        // Clean the price string and convert to number
        const cleanPrice = parseFloat(product.sellPrice.replace(/[৳$,]/g, ''));
        updatedItems[index].unitPrice = cleanPrice || 0;
        // Recalculate total when product changes
        updatedItems[index].totalAmount = updatedItems[index].quantity * (cleanPrice || 0);
      }
    }

    if (field === 'quantity' || field === 'unitPrice') {
      updatedItems[index].totalAmount = updatedItems[index].quantity * updatedItems[index].unitPrice;
    }

    setItems(updatedItems);
  };

  const getAvailableStock = (productId: string) => {
    const product = products.find(p => p.id === productId);
    console.log('Product found for stock check:', product);
    return product ? product.stock : 0;
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
  const finalAmount = totalAmount - formData.discountAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validItems = items.filter(item => item.productId && item.quantity > 0);
    if (validItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one valid item.",
        variant: "destructive"
      });
      return;
    }

    // Check stock availability
    for (const item of validItems) {
      const availableStock = getAvailableStock(item.productId);
      if (item.quantity > availableStock) {
        toast({
          title: "Insufficient Stock",
          description: `${item.productName} has only ${availableStock} units available.`,
          variant: "destructive"
        });
        return;
      }
    }

    try {
      const voucherNumber = `SV${Date.now()}`;
      const voucherData: Omit<SalesVoucher, 'id'> = {
        voucherNumber,
        customerName: formData.customerName,
        totalAmount,
        discountAmount: formData.discountAmount,
        finalAmount,
        paymentMethod: formData.paymentMethod,
        status: formData.status,
        notes: formData.notes,
        date: new Date().toISOString().split('T')[0],
        items: validItems
      };

      await createSalesVoucher(voucherData);
      
      toast({
        title: "Success",
        description: "Sales voucher created successfully."
      });

      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error creating sales voucher:', error);
      toast({
        title: "Error",
        description: "Failed to create sales voucher.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      customerName: '',
      discountAmount: 0,
      paymentMethod: 'Cash',
      status: 'Completed',
      notes: ''
    });
    setItems([{ productId: '', productName: '', quantity: 1, unitPrice: 0, totalAmount: 0 }]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Sales Voucher</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                placeholder="Enter customer name"
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
                {items.map((item, index) => {
                  const availableStock = getAvailableStock(item.productId);
                  const isStockLow = item.quantity > availableStock;
                  
                  return (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-7 gap-2 items-end p-3 border rounded">
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
                                <div className="flex items-center justify-between w-full">
                                  <span>{product.name}</span>
                                  <div className="flex items-center gap-1 ml-2">
                                    <Package className="h-3 w-3" />
                                    <span className="text-xs text-gray-500">
                                      Stock: {product.stock}
                                    </span>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Available</Label>
                        <div className="h-8 px-2 py-1 bg-gray-50 border rounded text-xs flex items-center">
                          {item.productId ? (
                            <span className={availableStock > 0 ? 'text-green-600' : 'text-red-600'}>
                              {availableStock}
                            </span>
                          ) : '-'}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          className={`h-8 ${isStockLow ? 'border-red-500 bg-red-50' : ''}`}
                        />
                        {isStockLow && (
                          <span className="text-xs text-red-500">Insufficient stock</span>
                        )}
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
                          value={(item.totalAmount || 0).toFixed(2)}
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
                  );
                })}
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
            <Button type="submit" disabled={finalAmount <= 0}>
              Create Sales Voucher
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
