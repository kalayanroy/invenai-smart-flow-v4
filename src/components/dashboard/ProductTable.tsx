
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, MoreHorizontal, Plus, Download, FileJson, Database } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CreateProductForm } from '../inventory/CreateProductForm';
import { ProductViewDialog } from '../inventory/ProductViewDialog';
import { ProductEditDialog } from '../inventory/ProductEditDialog';
import { useToast } from '@/hooks/use-toast';
import { useProducts, Product } from '@/hooks/useProducts';
import { useJsonFileManager } from '@/hooks/useJsonFileManager';

export const ProductTable = () => {
  const { toast } = useToast();
  const { products, addProduct, updateProduct, deleteProduct, exportProductsDatabase } = useProducts();
  const { saveCompleteInventoryToJson } = useJsonFileManager();
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock': return 'bg-green-100 text-green-800';
      case 'Low Stock': return 'bg-yellow-100 text-yellow-800';
      case 'Out of Stock': return 'bg-red-100 text-red-800';
      case 'Overstocked': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowViewDialog(true);
    console.log('View product:', product);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowEditDialog(true);
    console.log('Edit product:', product);
  };

  const handleDeleteProduct = (product: Product) => {
    if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
      deleteProduct(product.id);
      toast({
        title: "Product Deleted",
        description: `${product.name} has been deleted successfully.`,
      });
      console.log('Delete product:', product);
    }
  };

  const handleMoreActions = (product: Product) => {
    toast({
      title: "More Actions",
      description: `Additional options for ${product.name}`,
    });
    console.log('More actions for product:', product);
  };

  const handleProductCreated = (productData: any) => {
    addProduct(productData);
    setShowCreateProduct(false);
  };

  const handleProductUpdate = (id: string, updates: Partial<Product>) => {
    updateProduct(id, updates);
  };

  const handleExportAllToJson = () => {
    const inventoryData = {
      products: products,
      sales: [],
      purchases: [],
      salesReturns: [],
      exportDate: new Date().toISOString(),
      totalValue: products.reduce((sum, p) => sum + (parseFloat(p.sellPrice.replace('৳', ''))  * p.stock), 0)
    };
    
    saveCompleteInventoryToJson(inventoryData);
    toast({
      title: "Export Complete",
      description: "All products exported to JSON file successfully.",
    });
  };

  const handleExportProductsDatabase = () => {
    exportProductsDatabase();
    toast({
      title: "Products Database Exported",
      description: "Products database JSON file has been created successfully.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Product Inventory</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportProductsDatabase} className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Export Products Database
          </Button>
          <Button variant="outline" onClick={handleExportAllToJson} className="flex items-center gap-2">
            <FileJson className="h-4 w-4" />
            Export All to JSON
          </Button>
          <Dialog open={showCreateProduct} onOpenChange={setShowCreateProduct}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create New Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Product</DialogTitle>
              </DialogHeader>
              <CreateProductForm onProductCreated={handleProductCreated} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Product Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Inventory ({products.length} items)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Product</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">SKU</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Stock</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">AI Recommendation</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.category} • {product.price}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm font-mono">{product.id}</td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <div className="font-medium">{product.stock} {product.unit}</div>
                        <div className="text-gray-500">Reorder at {product.reorderPoint}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={getStatusColor(product.status)}>
                        {product.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded-lg max-w-xs">
                        {product.aiRecommendation}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewProduct(product)}
                          title="View Product"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditProduct(product)}
                          title="Edit Product"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteProduct(product)}
                          title="Delete Product"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleMoreActions(product)}
                          title="More Actions"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {products.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No products found. Create your first product to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ProductViewDialog
        product={selectedProduct}
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
      />

      <ProductEditDialog
        product={selectedProduct}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSave={handleProductUpdate}
      />
    </div>
  );
};
