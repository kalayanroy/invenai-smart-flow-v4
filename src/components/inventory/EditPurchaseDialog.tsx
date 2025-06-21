
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus } from 'lucide-react';
import { Purchase, PurchaseOrder } from '@/hooks/usePurchases';
import { useProducts } from '@/hooks/useProducts';

interface EditPurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseOrder: PurchaseOrder | null;
  onPurchaseUpdated: (orderId: string, updates: any) => void;
}

interface EditItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}

export const EditPurchaseDialog = ({ open, onOpenChange, purchaseOrder, onPurchaseUpdated }: EditPurchaseDialogProps) => {
  const { products } = useProducts();
  const [formData, setFormData] = useState({
    supplier: '',
    status: 'Pending' as Purchase['status'],
    notes: ''
  });
  const [items, setItems] = useState<EditItem[]>([]);

  useEffect(() => {
    if (purchaseOrder) {
      setFormData({
        supplier: purchaseOrder.supplier,
        status: purchaseOrder.status,
        notes: purchaseOrder.notes || ''
      });
      
      setItems(purchaseOrder.items.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unitPrice.replace('৳', '').replace(',', '')),
        totalAmount: parseFloat(item.totalAmount.replace('৳', '').replace(',', ''))
      })));
    }
  }, [purchaseOrder]);

  if (!purchaseOrder) return null;

  const updateItemQuantity = (index: number, quantity: number) => {
    const newItems = [...items];
    newItems[index].quantity = quantity;
    newItems[index].totalAmount = quantity * newItems[index].unitPrice;
    setItems(newItems);
  };

  const updateItemUnitPrice = (index: number, unitPrice: number) => {
    const newItems = [...items];
    newItems[index].unitPrice = unitPrice;
    newItems[index].totalAmount = newItems[index].quantity * unitPrice;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const addNewItem = () => {
    if (products.length > 0) {
      const newItem: EditItem = {
        id: `new-${Date.now()}`,
        productId: products[0].id,
        productName: products[0].name,
        quantity: 1,
        unitPrice: parseFloat(products[0].purchasePrice.replace('৳', '').replace(',', '')),
        totalAmount: parseFloat(products[0].purchasePrice.replace('৳', '').replace(',', ''))
      };
      setItems([...items, newItem]);
    }
  };

  const updateItemProduct = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const newItems = [...items];
      newItems[index].productId = productId;
      newItems[index].productName = product.name;
      newItems[index].unitPrice = parseFloat(product.purchasePrice.replace('৳', '').replace(',', ''));
      newItems[index].totalAmount = newItems[index].quantity * newItems[index].unitPrice;
      setItems(newItems);
    }
  };

  const totalAmount = items.reduce((sum, item) => sum + item.totalAmount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updates = {
      supplier: formData.supplier,
      status: formData.status,
      notes: formData.notes,
      items: items.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: `৳${item.unitPrice.toFixed(2)}`,
        totalAmount: `৳${item.totalAmount.toFixed(2)}`
      })),
      totalAmount: totalAmount
    };

    onPurchaseUpdated(purchaseOrder.id, updates);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Purchase Order - {purchaseOrder.id}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier *</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: Purchase['status']) => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ordered">Ordered</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Received">Received</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Items ({items.length})</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addNewItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-end p-4 border rounded-lg">
                  <div className="col-span-4">
                    <Label className="text-xs">Product</Label>
                    <Select value={item.productId} onValueChange={(value) => updateItemProduct(index, value)}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} (৳{product.purchasePrice})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="col-span-2">
                    <Label className="text-xs">Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                      className="h-8"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Label className="text-xs">Unit Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unitPrice}
                      onChange={(e) => updateItemUnitPrice(index, parseFloat(e.target.value) || 0)}
                      className="h-8"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Label className="text-xs">Total</Label>
                    <div className="h-8 px-3 py-1 bg-gray-50 rounded border text-sm">
                      ৳{item.totalAmount.toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="h-8 w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                      disabled={items.length === 1}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Order Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total Items:</span> {items.length}
              </div>
              <div>
                <span className="text-gray-600">Total Quantity:</span> {items.reduce((sum, item) => sum + item.quantity, 0)}
              </div>
              <div className="col-span-2 text-lg font-semibold">
                <span className="text-gray-600">Total Amount:</span> ৳{totalAmount.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Additional notes about this purchase order..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Update Purchase Order
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
