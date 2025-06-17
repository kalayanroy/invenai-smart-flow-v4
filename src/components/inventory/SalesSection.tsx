
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, DollarSign, ShoppingBag, Eye, Edit, Trash2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSales, Sale } from '@/hooks/useSales';
import { CreateSaleDialog } from './CreateSaleDialog';
import { ViewSaleDialog } from './ViewSaleDialog';
import { EditSaleDialog } from './EditSaleDialog';
import { generateSalesInvoicePDF } from '@/utils/pdfGenerator';

export const SalesSection = () => {
  const { toast } = useToast();
  const { sales, addSale, updateSale, deleteSale } = useSales();
  const [showCreateSale, setShowCreateSale] = useState(false);
  const [showViewSale, setShowViewSale] = useState(false);
  const [showEditSale, setShowEditSale] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalRevenue = sales.reduce((sum, sale) => 
    sum + parseFloat(sale.totalAmount.replace('৳', '').replace(',', '')), 0
  );

  const handleSaleCreated = (saleData: any) => {
    addSale(saleData);
    toast({
      title: "Sale Recorded",
      description: "The sale has been recorded successfully.",
    });
  };

  const handleViewSale = (sale: Sale) => {
    setSelectedSale(sale);
    setShowViewSale(true);
  };

  const handleEditSale = (sale: Sale) => {
    setSelectedSale(sale);
    setShowEditSale(true);
  };

  const handleSaleUpdated = (id: string, updates: Partial<Sale>) => {
    updateSale(id, updates);
    toast({
      title: "Sale Updated",
      description: `Sale ${id} has been updated successfully.`,
    });
  };

  const handleDeleteSale = (sale: Sale) => {
    if (window.confirm(`Are you sure you want to delete sale ${sale.id}?`)) {
      deleteSale(sale.id);
      toast({
        title: "Sale Deleted",
        description: `Sale ${sale.id} has been deleted.`,
      });
    }
  };

  const handlePrintInvoice = (sale: Sale) => {
    generateSalesInvoicePDF(sale);
    toast({
      title: "Invoice Generated",
      description: `Sales invoice for ${sale.id} has been generated.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Sales Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold">{sales.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-2xl font-bold">৳{totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Items Sold</p>
                <p className="text-2xl font-bold">
                  {sales.reduce((sum, sale) => sum + sale.quantity, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Sales Records ({sales.length} transactions)</CardTitle>
            <Button 
              className="flex items-center gap-2"
              onClick={() => setShowCreateSale(true)}
            >
              <Plus className="h-4 w-4" />
              Record New Sale
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Sale ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Product</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Quantity</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Unit Price</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Total</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 text-sm font-mono">{sale.id}</td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900">{sale.productName}</div>
                      <div className="text-sm text-gray-500">SKU: {sale.productId}</div>
                    </td>
                    <td className="py-4 px-4 text-sm">{sale.customerName || 'Walk-in Customer'}</td>
                    <td className="py-4 px-4">{sale.quantity}</td>
                    <td className="py-4 px-4">{sale.unitPrice}</td>
                    <td className="py-4 px-4 font-semibold">{sale.totalAmount}</td>
                    <td className="py-4 px-4 text-sm">{new Date(sale.date).toLocaleDateString()}</td>
                    <td className="py-4 px-4">
                      <Badge className={getStatusColor(sale.status)}>
                        {sale.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewSale(sale)}
                          title="View Sale"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditSale(sale)}
                          title="Edit Sale"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handlePrintInvoice(sale)}
                          title="Print Invoice"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteSale(sale)}
                          title="Delete Sale"
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
          
          {sales.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No sales records found. Record your first sale to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateSaleDialog
        open={showCreateSale}
        onOpenChange={setShowCreateSale}
        onSaleCreated={handleSaleCreated}
      />

      <ViewSaleDialog
        open={showViewSale}
        onOpenChange={setShowViewSale}
        sale={selectedSale}
      />

      <EditSaleDialog
        open={showEditSale}
        onOpenChange={setShowEditSale}
        sale={selectedSale}
        onSaleUpdated={handleSaleUpdated}
      />
    </div>
  );
};
