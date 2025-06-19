
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, RotateCcw, Search, Eye, Edit, Trash2, Check, X, DollarSign, Package, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSalesReturns, SalesReturn } from '@/hooks/useSalesReturns';
import { useAuth } from '@/hooks/useAuth';
import { CreateReturnDialog } from './CreateReturnDialog';
import { ViewReturnDialog } from './ViewReturnDialog';
import { EditReturnDialog } from './EditReturnDialog';

export const SalesReturnSection = () => {
  const { toast } = useToast();
  const { userProfile, hasPermission } = useAuth();
  const { returns, addReturn, updateReturn, deleteReturn, processReturn } = useSalesReturns();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateReturn, setShowCreateReturn] = useState(false);
  const [showViewReturn, setShowViewReturn] = useState(false);
  const [showEditReturn, setShowEditReturn] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<SalesReturn | null>(null);

  // Filter returns
  const filteredReturns = returns.filter(returnItem => {
    const matchesSearch = returnItem.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         returnItem.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         returnItem.originalSaleId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || returnItem.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Approved': return 'bg-blue-100 text-blue-800';
      case 'Processed': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalReturns = returns.length;
  const pendingReturns = returns.filter(r => r.status === 'Pending').length;
  
  // Fix the refund amount calculation
  const totalRefundAmount = returns
    .filter(r => r.status === 'Processed')
    .reduce((sum, returnItem) => {
      // Handle both ৳ and $ currencies and remove any non-numeric characters except decimal points
      const cleanAmount = returnItem.totalRefund.replace(/[৳$,]/g, '');
      const amount = parseFloat(cleanAmount) || 0;
      return sum + amount;
    }, 0);

  const handleReturnCreated = (returnData: any) => {
    addReturn(returnData);
    toast({
      title: "Return Request Created",
      description: "The return request has been created successfully.",
    });
  };

  const handleViewReturn = (returnItem: SalesReturn) => {
    setSelectedReturn(returnItem);
    setShowViewReturn(true);
  };

  const handleEditReturn = (returnItem: SalesReturn) => {
    if (!hasPermission('update')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit returns.",
        variant: "destructive"
      });
      return;
    }
    setSelectedReturn(returnItem);
    setShowEditReturn(true);
  };

  const handleReturnUpdated = (id: string, updates: Partial<SalesReturn>) => {
    updateReturn(id, updates);
    toast({
      title: "Return Updated",
      description: `Return ${id} has been updated successfully.`,
    });
  };

  const handleDeleteReturn = (returnItem: SalesReturn) => {
    if (!hasPermission('delete')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to delete returns.",
        variant: "destructive"
      });
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete return ${returnItem.id}?`)) {
      deleteReturn(returnItem.id);
      toast({
        title: "Return Deleted",
        description: `Return ${returnItem.id} has been deleted.`,
      });
    }
  };

  const handleProcessReturn = (returnItem: SalesReturn, status: 'Approved' | 'Rejected') => {
    if (!hasPermission('update')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to process returns.",
        variant: "destructive"
      });
      return;
    }

    processReturn(returnItem.id, status, userProfile?.username || 'Unknown');
    toast({
      title: `Return ${status}`,
      description: `Return ${returnItem.id} has been ${status.toLowerCase()}.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Returns Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Returns</p>
                <p className="text-2xl font-bold">{totalReturns}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Pending Returns</p>
                <p className="text-2xl font-bold">{pendingReturns}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Refunds</p>
                <p className="text-2xl font-bold">৳{totalRefundAmount.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Processed Returns</p>
                <p className="text-2xl font-bold">{returns.filter(r => r.status === 'Processed').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Returns Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Sales Returns ({filteredReturns.length} records)</CardTitle>
            {hasPermission('create') && (
              <Button 
                className="flex items-center gap-2"
                onClick={() => setShowCreateReturn(true)}
              >
                <Plus className="h-4 w-4" />
                New Return Request
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search returns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Processed">Processed</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            
            {(searchTerm || statusFilter !== 'all') && (
              <Button 
                variant="ghost" 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>

          {/* Returns Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Return ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Original Sale</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Product</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Quantity</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Refund Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Reason</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReturns.map((returnItem) => (
                  <tr key={returnItem.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 text-sm font-mono">{returnItem.id}</td>
                    <td className="py-4 px-4 text-sm font-mono">{returnItem.originalSaleId}</td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900">{returnItem.productName}</div>
                      <div className="text-sm text-gray-500">SKU: {returnItem.productId}</div>
                    </td>
                    <td className="py-4 px-4 text-sm">{returnItem.customerName || 'N/A'}</td>
                    <td className="py-4 px-4">
                      <span className="font-medium">{returnItem.returnQuantity}</span>
                      <span className="text-sm text-gray-500"> / {returnItem.originalQuantity}</span>
                    </td>
                    <td className="py-4 px-4 font-semibold">{returnItem.totalRefund}</td>
                    <td className="py-4 px-4 text-sm">{returnItem.reason}</td>
                    <td className="py-4 px-4 text-sm">{new Date(returnItem.returnDate).toLocaleDateString()}</td>
                    <td className="py-4 px-4">
                      <Badge className={getStatusColor(returnItem.status)}>
                        {returnItem.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewReturn(returnItem)}
                          title="View Return"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {hasPermission('update') && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditReturn(returnItem)}
                            title="Edit Return"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {hasPermission('update') && returnItem.status === 'Pending' && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleProcessReturn(returnItem, 'Approved')}
                              title="Approve Return"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleProcessReturn(returnItem, 'Rejected')}
                              title="Reject Return"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        
                        {hasPermission('delete')  && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteReturn(returnItem)}
                            title="Delete Return"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredReturns.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <RotateCcw className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No return requests found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateReturnDialog
        open={showCreateReturn}
        onOpenChange={setShowCreateReturn}
        onReturnCreated={handleReturnCreated}
      />

      <ViewReturnDialog
        open={showViewReturn}
        onOpenChange={setShowViewReturn}
        returnItem={selectedReturn}
      />

      <EditReturnDialog
        open={showEditReturn}
        onOpenChange={setShowEditReturn}
        returnItem={selectedReturn}
        onReturnUpdated={handleReturnUpdated}
      />
    </div>
  );
};
