
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useProducts } from '@/hooks/useProducts';
import { useSales } from '@/hooks/useSales';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Minus, ShoppingCart, Trash2, CreditCard, Receipt, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useIsMobile } from '@/hooks/use-mobile';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
}

export const POSSystem = () => {
  const { products } = useProducts();
  const { addSale } = useSales();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState(products);

  useEffect(() => {
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [products, searchTerm]);

  const addToCart = (product) => {
    const price = parseFloat(product.sellPrice.replace(/[৳$,]/g, '')) || 0;
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        toast({
          title: "Insufficient Stock",
          description: `Only ${product.stock} units available`,
          variant: "destructive"
        });
      }
    } else {
      if (product.stock > 0) {
        setCart([...cart, {
          id: product.id,
          name: product.name,
          price: price,
          quantity: 1,
          stock: product.stock
        }]);
      } else {
        toast({
          title: "Out of Stock",
          description: "This product is currently out of stock",
          variant: "destructive"
        });
      }
    }
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    const item = cart.find(item => item.id === id);
    if (!item) return;

    if (newQuantity <= 0) {
      removeFromCart(id);
    } else if (newQuantity <= item.stock) {
      setCart(cart.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
    } else {
      toast({
        title: "Insufficient Stock",
        description: `Only ${item.stock} units available`,
        variant: "destructive"
      });
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName('');
    setShowPaymentDialog(false);
  };

  const processSale = async () => {
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to cart before processing sale",
        variant: "destructive"
      });
      return;
    }

    try {
      for (const item of cart) {
        await addSale({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          unitPrice: `৳${item.price}`,
          totalAmount: `৳${item.price * item.quantity}`,
          date: new Date().toISOString().split('T')[0],
          status: 'Completed',
          customerName: customerName || 'Walk-in Customer',
          notes: `POS Sale - Payment: ${paymentMethod}`
        });
      }

      toast({
        title: "Sale Completed",
        description: `Sale of ৳${getTotalAmount().toFixed(2)} processed successfully`,
      });

      clearCart();
    } catch (error) {
      console.error('Error processing sale:', error);
      toast({
        title: "Error",
        description: "Failed to process sale. Please try again.",
        variant: "destructive"
      });
    }
  };

  const PaymentDialog = () => (
    <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
      <DialogContent className={`${isMobile ? 'w-[95vw] max-w-none' : 'max-w-md'}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Process Payment
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="customer">Customer Name (Optional)</Label>
            <Input
              id="customer"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer name"
            />
          </div>
          
          <div>
            <Label>Payment Method</Label>
            <div className="flex gap-2 mt-2">
              <Button
                variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('cash')}
                className="flex-1"
              >
                Cash
              </Button>
              <Button
                variant={paymentMethod === 'card' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('card')}
                className="flex-1"
              >
                Card
              </Button>
              <Button
                variant={paymentMethod === 'upi' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('upi')}
                className="flex-1"
              >
                UPI
              </Button>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total Amount:</span>
              <span>৳{getTotalAmount().toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={processSale} className="flex-1">
              <Receipt className="h-4 w-4 mr-2" />
              Complete Sale
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Point of Sales (POS)</h2>
        <Badge variant="secondary" className="text-sm">
          {cart.length} items in cart
        </Badge>
      </div>

      <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 lg:grid-cols-3 gap-6'}`}>
        {/* Product Search & Selection */}
        <div className={`${isMobile ? '' : 'lg:col-span-2'} space-y-4`}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Product Search
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, SKU, or barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`grid ${isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-2 md:grid-cols-3 gap-3'} max-h-96 overflow-y-auto`}>
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => addToCart(product)}
                  >
                    <div className="font-medium text-sm">{product.name}</div>
                    <div className="text-xs text-gray-500">SKU: {product.sku}</div>
                    <div className="text-xs text-gray-500">Stock: {product.stock}</div>
                    <div className="font-semibold text-blue-600 mt-1">{product.sellPrice}</div>
                    <Button size="sm" className="w-full mt-2">
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Shopping Cart */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Cart
                </span>
                {cart.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Cart is empty</p>
                  <p className="text-sm">Add products to start a sale</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.name}</div>
                          <div className="text-xs text-gray-500">৳{item.price} each</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 h-6 w-6 text-red-600 hover:text-red-700"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-6 w-6 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="font-medium min-w-[2rem] text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-6 w-6 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="font-semibold">
                          ৳{(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t pt-3 mt-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total:</span>
                      <span>৳{getTotalAmount().toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => setShowPaymentDialog(true)}
                    className="w-full mt-4"
                    size="lg"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Process Payment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <PaymentDialog />
    </div>
  );
};
