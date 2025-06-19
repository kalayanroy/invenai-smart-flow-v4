import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, ShoppingCart, Package, DollarSign, Eye, Edit, Trash2, FileText, Receipt } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePurchases, Purchase } from '@/hooks/usePurchases';
import { usePurchaseVouchers } from '@/hooks/usePurchaseVouchers';
import { CreatePurchaseDialog } from './CreatePurchaseDialog';
import { CreatePurchaseVoucherDialog } from './CreatePurchaseVoucherDialog';
import { ViewPurchaseDialog } from './ViewPurchaseDialog';
import { EditPurchaseDialog } from './EditPurchaseDialog';
import { generatePurchaseInvoicePDF } from '@/utils/pdfGenerator';

export const PurchaseSection = () => {
  const { toast } = useToast();
  const { purchases, addPurchase, updatePurchase, deletePurchase } = usePurchases();
  const { purchaseVouchers } = usePurchaseVouchers();
  const [showCreatePurchase, setShowCreatePurchase] = useState(false);
  const [showCreateVoucher, setShowCreateVoucher] = useState(false);
  const [showViewPurchase, setShowViewPurchase] = useState(false);
  const [showEditPurchase, setShowEditPurchase] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Received': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Ordered': return 'bg-blue-100 text-blue-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalPurchases = purchases.reduce((sum, purchase) => 
    sum + parseFloat(purchase.totalAmount.replace('৳', '').replace(',', '')), 0
  );

  const voucherPurchases = purchaseVouchers.reduce((sum, voucher) => sum + voucher.finalAmount, 0);
  const totalCombinedPurchases = totalPurchases + voucherPurchases;

  const handlePurchaseCreated = (purchaseData: any) => {
    addPurchase(purchaseData);
    toast({
      title: "Purchase Order Created",
      description: "The purchase order has been created successfully.",
    });
  };

  const handleViewPurchase = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setShowViewPurchase(true);
  };

  const handleEditPurchase = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setShowEditPurchase(true);
  };

  const handlePurchaseUpdated = (id: string, updates: Partial<Purchase>) => {
    updatePurchase(id, updates);
    toast({
      title: "Purchase Updated",
      description: `Purchase ${id} has been updated successfully.`,
    });
  };

  const handleDeletePurchase = (purchase: Purchase) => {
    if (window.confirm(`Are you sure you want to delete purchase ${purchase.id}?`)) {
      deletePurchase(purchase.id);
      toast({
        title: "Purchase Deleted",
        description: `Purchase ${purchase.id} has been deleted.`,
      });
    }
  };

  const handlePrintInvoice = (purchase: Purchase) => {
    generatePurchaseInvoicePDF(purchase);
    toast({
      title: "Purchase Order Generated",
      description: `Purchase order for ${purchase.id} has been generated.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Purchase Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Individual Purchases</p>
                <p className="text-2xl font-bold">{purchases.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Purchase Vouchers</p>
                <p className="text-2xl font-bold">{purchaseVouchers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Individual Cost</p>
                <p className="text-2xl font-bold">৳{totalPurchases.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Total Cost</p>
                <p className="text-2xl font-bold">৳{totalCombinedPurchases.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="individual" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="individual">Individual Purchases</TabsTrigger>
          <TabsTrigger value="vouchers">Purchase Vouchers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="individual">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Individual Purchases ({purchases.length} records)</CardTitle>
                <Button 
                  className="flex items-center gap-2"
                  onClick={() => setShowCreatePurchase(true)}
                >
                  <Plus className="h-4 w-4" />
                  Create Purchase
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Purchase ID</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Product</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Supplier</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Quantity</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Total</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.map((purchase) => (
                      <tr key={purchase.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 text-sm font-mono">{purchase.id}</td>
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-900">{purchase.productName}</div>
                          <div className="text-sm text-gray-500">SKU: {purchase.productId}</div>
                        </td>
                        <td className="py-4 px-4 text-sm">{purchase.supplier}</td>
                        <td className="py-4 px-4">{purchase.quantity}</td>
                        <td className="py-4 px-4 font-semibold">{purchase.totalAmount}</td>
                        <td className="py-4 px-4 text-sm">{new Date(purchase.date).toLocaleDateString()}</td>
                        <td className="py-4 px-4">
                          <Badge className={getStatusColor(purchase.status)}>
                            {purchase.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="sm" onClick={() => handleViewPurchase(purchase)} title="View Purchase">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEditPurchase(purchase)} title="Edit Purchase">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handlePrintInvoice(purchase)} title="Print Purchase Order" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeletePurchase(purchase)} title="Delete Purchase" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {purchases.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No individual purchases found. Create your first purchase to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vouchers">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Purchase Vouchers ({purchaseVouchers.length} vouchers)</CardTitle>
                <Button 
                  className="flex items-center gap-2"
                  onClick={() => setShowCreateVoucher(true)}
                >
                  <Plus className="h-4 w-4" />
                  Create Voucher
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Voucher #</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Supplier</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Items</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Total Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Discount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Final Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseVouchers.map((voucher) => (
                      <tr key={voucher.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 text-sm font-mono">{voucher.voucherNumber}</td>
                        <td className="py-4 px-4 text-sm">{voucher.supplierName}</td>
                        <td className="py-4 px-4 text-sm">{voucher.items.length} items</td>
                        <td className="py-4 px-4 font-semibold">৳{voucher.totalAmount.toFixed(2)}</td>
                        <td className="py-4 px-4 text-sm">৳{voucher.discountAmount.toFixed(2)}</td>
                        <td className="py-4 px-4 font-bold text-green-600">৳{voucher.finalAmount.toFixed(2)}</td>
                        <td className="py-4 px-4 text-sm">{new Date(voucher.date).toLocaleDateString()}</td>
                        <td className="py-4 px-4">
                          <Badge className={getStatusColor(voucher.status)}>
                            {voucher.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {purchaseVouchers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No purchase vouchers found. Create your first voucher to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CreatePurchaseDialog
        open={showCreatePurchase}
        onOpenChange={setShowCreatePurchase}
        onPurchaseCreated={handlePurchaseCreated}
      />

      <CreatePurchaseVoucherDialog
        open={showCreateVoucher}
        onOpenChange={setShowCreateVoucher}
      />

      <ViewPurchaseDialog
        open={showViewPurchase}
        onOpenChange={setShowViewPurchase}
        purchase={selectedPurchase}
      />

      <EditPurchaseDialog
        open={showEditPurchase}
        onOpenChange={setShowEditPurchase}
        purchase={selectedPurchase}
        onPurchaseUpdated={handlePurchaseUpdated}
      />
    </div>
  );
};
