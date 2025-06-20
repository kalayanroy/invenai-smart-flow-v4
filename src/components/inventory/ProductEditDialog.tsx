
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Product } from '@/hooks/useProducts';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useUnits } from '@/hooks/useUnits';
import { useCategories } from '@/hooks/useCategories';

interface ProductEditDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, updates: Partial<Product>) => void;
}

export const ProductEditDialog = ({ product, open, onOpenChange, onSave }: ProductEditDialogProps) => {
  const { toast } = useToast();
  const { units, addUnit, loading: unitsLoading } = useUnits();
  const { categories, addCategory, loading: categoriesLoading } = useCategories();
  
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [newUnit, setNewUnit] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [showUnitDialog, setShowUnitDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAddingUnit, setIsAddingUnit] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        sku: product.sku,
        barcode: product.barcode,
        category: product.category,
        purchasePrice: product.purchasePrice,
        sellPrice: product.sellPrice,
        stock: product.stock,
        reorderPoint: product.reorderPoint,
        openingStock: product.openingStock,
        unit: product.unit
      });
      setImagePreview(product.image || null);
    }
  }, [product]);

  const handleInputChange = (field: keyof Product, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
        setFormData(prev => ({ ...prev, image: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image: undefined }));
  };

  const addNewUnit = async () => {
    if (!newUnit.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a unit name.",
        variant: "destructive",
      });
      return;
    }

    setIsAddingUnit(true);
    try {
      console.log('Adding new unit:', newUnit.trim());
      const result = await addUnit(newUnit.trim());
      console.log('Unit added successfully:', result);
      
      setFormData(prev => ({ ...prev, unit: newUnit.trim() }));
      setNewUnit('');
      setShowUnitDialog(false);
      
      toast({
        title: "Unit Added",
        description: `"${newUnit.trim()}" has been added to the units list.`,
      });
    } catch (error) {
      console.error('Error adding unit:', error);
      toast({
        title: "Error",
        description: "Failed to add unit. It may already exist.",
        variant: "destructive",
      });
    } finally {
      setIsAddingUnit(false);
    }
  };

  const addNewCategory = async () => {
    if (!newCategory.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a category name.",
        variant: "destructive",
      });
      return;
    }

    setIsAddingCategory(true);
    try {
      console.log('Adding new category:', newCategory.trim());
      const result = await addCategory(newCategory.trim());
      console.log('Category added successfully:', result);
      
      setFormData(prev => ({ ...prev, category: newCategory.trim() }));
      setNewCategory('');
      setShowCategoryDialog(false);
      
      toast({
        title: "Category Added",
        description: `"${newCategory.trim()}" has been added to the categories list.`,
      });
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: "Error",
        description: "Failed to add category. It may already exist.",
        variant: "destructive",
      });
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleSave = () => {
    if (!product || !formData.name || !formData.sku) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    onSave(product.id, formData);
    toast({
      title: "Product Updated",
      description: `${formData.name} has been updated successfully.`,
    });
    onOpenChange(false);
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Edit Product</DialogTitle>
        </DialogHeader>
        
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="productName">Product Name *</Label>
                  <Input
                    id="productName"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    value={formData.sku || ''}
                    onChange={(e) => handleInputChange('sku', e.target.value)}
                    placeholder="Enter SKU"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode</Label>
                  <Input
                    id="barcode"
                    value={formData.barcode || ''}
                    onChange={(e) => handleInputChange('barcode', e.target.value)}
                    placeholder="Enter barcode"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="openingStock">Opening Stock</Label>
                  <Input
                    id="openingStock"
                    type="number"
                    value={formData.openingStock || 0}
                    onChange={(e) => handleInputChange('openingStock', parseInt(e.target.value) || 0)}
                    placeholder="Enter opening stock"
                    min="0"
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="purchasePrice">Purchase Price *</Label>
                  <Input
                    id="purchasePrice"
                    value={formData.purchasePrice || ''}
                    onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
                    placeholder="Enter purchase price"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sellPrice">Sell Price *</Label>
                  <Input
                    id="sellPrice"
                    value={formData.sellPrice || ''}
                    onChange={(e) => handleInputChange('sellPrice', e.target.value)}
                    placeholder="Enter sell price"
                    required
                  />
                </div>
              </div>

              {/* Stock Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="currentStock">Current Stock</Label>
                  <Input
                    id="currentStock"
                    type="number"
                    value={formData.stock || 0}
                    onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reorderPoint">Reorder Point</Label>
                  <Input
                    id="reorderPoint"
                    type="number"
                    value={formData.reorderPoint || 0}
                    onChange={(e) => handleInputChange('reorderPoint', parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </div>
              </div>

              {/* Unit and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Unit *</Label>
                  <div className="flex gap-2">
                    <Select 
                      value={formData.unit || ''} 
                      onValueChange={(value) => handleInputChange('unit', value)}
                      disabled={unitsLoading}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder={unitsLoading ? "Loading units..." : "Select unit"} />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem key={unit.id} value={unit.name}>
                            {unit.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Dialog open={showUnitDialog} onOpenChange={setShowUnitDialog}>
                      <DialogTrigger asChild>
                        <Button type="button" variant="outline" size="icon" disabled={unitsLoading}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Unit</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="newUnitNameEdit">Unit Name</Label>
                            <Input
                              id="newUnitNameEdit"
                              value={newUnit}
                              onChange={(e) => setNewUnit(e.target.value)}
                              placeholder="Enter new unit name"
                              onKeyPress={(e) => e.key === 'Enter' && !isAddingUnit && addNewUnit()}
                              disabled={isAddingUnit}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              onClick={addNewUnit} 
                              className="flex-1" 
                              disabled={isAddingUnit || !newUnit.trim()}
                            >
                              {isAddingUnit ? 'Adding...' : 'Add Unit'}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setShowUnitDialog(false);
                                setNewUnit('');
                              }}
                              className="flex-1"
                              disabled={isAddingUnit}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Category *</Label>
                  <div className="flex gap-2">
                    <Select 
                      value={formData.category || ''} 
                      onValueChange={(value) => handleInputChange('category', value)}
                      disabled={categoriesLoading}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select category"} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
                      <DialogTrigger asChild>
                        <Button type="button" variant="outline" size="icon" disabled={categoriesLoading}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Category</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="newCategoryNameEdit">Category Name</Label>
                            <Input
                              id="newCategoryNameEdit"
                              value={newCategory}
                              onChange={(e) => setNewCategory(e.target.value)}
                              placeholder="Enter new category name"
                              onKeyPress={(e) => e.key === 'Enter' && !isAddingCategory && addNewCategory()}
                              disabled={isAddingCategory}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              onClick={addNewCategory} 
                              className="flex-1" 
                              disabled={isAddingCategory || !newCategory.trim()}
                            >
                              {isAddingCategory ? 'Adding...' : 'Add Category'}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setShowCategoryDialog(false);
                                setNewCategory('');
                              }}
                              className="flex-1"
                              disabled={isAddingCategory}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Product Image</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        className="max-w-xs max-h-48 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={removeImage}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <Label
                          htmlFor="image-upload-edit"
                          className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Upload Image
                        </Label>
                        <input
                          id="image-upload-edit"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4">
                <Button onClick={handleSave} className="flex-1">
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
