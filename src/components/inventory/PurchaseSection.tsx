
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, ShoppingCart, Package, DollarSign, Eye, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePurchases, Purchase } from '@/hooks/usePurchases';
import { CreatePurchaseDialog } from './CreatePurchaseDialog';
import { ViewPurchaseDialog } from './ViewPurchaseDialog';
import { EditPurchaseDialog } from './EditPurchaseDialog';

export const PurchaseSection = () => {
  const { toast } = useToast();
  const { purchases, addPurchase, updatePurchase, deletePurchase } = usePurchases();
  const [showCreatePurchase, setShowCreatePurchase] = useState(false);
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

  return (
    <div className="space-y-6">
      {/* Purchase Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Purchases</p>
                <p className="text-2xl font-bold">{purchases.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Purchase Cost</p>
                <p className="text-2xl font-bold">৳{totalPurchases.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Items Purchased</p>
                <p className="text-2xl font-bold">
                  {purchases.reduce((sum, purchase) => sum + purchase.quantity, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Purchase Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Purchase Orders ({purchases.length} records)</CardTitle>
            <Button 
              className="flex items-center gap-2"
              onClick={() => setShowCreatePurchase(true)}
            >
              <Plus className="h-4 w-4" />
              Create Purchase Order
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
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Unit Price</th>
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
                    <td className="py-4 px-4">{purchase.unitPrice}</td>
                    <td className="py-4 px-4 font-semibold">{purchase.totalAmount}</td>
                    <td className="py-4 px-4 text-sm">{new Date(purchase.date).toLocaleDateString()}</td>
                    <td className="py-4 px-4">
                      <Badge className={getStatusColor(purchase.status)}>
                        {purchase.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewPurchase(purchase)}
                          title="View Purchase"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditPurchase(purchase)}
                          title="Edit Purchase"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeletePurchase(purchase)}
                          title="Delete Purchase"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
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
              <p>No purchase records found. Create your first purchase order to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <CreatePurchaseDialog
        open={showCreatePurchase}
        onOpenChange={setShowCreatePurchase}
        onPurchaseCreated={handlePurchaseCreated}
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
