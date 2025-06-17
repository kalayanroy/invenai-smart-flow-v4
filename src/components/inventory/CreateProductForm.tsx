import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CreateProductFormProps {
  onProductCreated?: (productData: any) => void;
}

interface ProductFormData {
  name: string;
  sku: string;
  barcode: string;
  purchasePrice: string;
  sellPrice: string;
  openingStock: string;
  unit: string;
  category: string;
  image: File | null;
}

const initialUnits = ['Pieces', 'Kg', 'Liter', 'Meter', 'Box', 'Dozen'];
const initialCategories = ['Electronics', 'Clothing', 'Food & Beverages', 'Home & Garden', 'Sports', 'Books'];

export const CreateProductForm = ({ onProductCreated }: CreateProductFormProps) => {
  const { toast } = useToast();
  const [product, setProduct] = useState<ProductFormData>({
    name: '',
    sku: '',
    barcode: '',
    purchasePrice: '',
    sellPrice: '',
    openingStock: '',
    unit: '',
    category: '',
    image: null
  });

  const [units, setUnits] = useState(initialUnits);
  const [categories, setCategories] = useState(initialCategories);
  const [newUnit, setNewUnit] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [showUnitDialog, setShowUnitDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleInputChange = (field: keyof ProductFormData, value: string) => {
    setProduct(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProduct(prev => ({ ...prev, image: file }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setProduct(prev => ({ ...prev, image: null }));
    setImagePreview(null);
  };

  const addNewUnit = () => {
    if (newUnit.trim() && !units.includes(newUnit.trim())) {
      const updatedUnits = [...units, newUnit.trim()];
      setUnits(updatedUnits);
      setProduct(prev => ({ ...prev, unit: newUnit.trim() }));
      setNewUnit('');
      setShowUnitDialog(false);
      toast({
        title: "Unit Added",
        description: `"${newUnit.trim()}" has been added to the units list.`,
      });
    }
  };

  const addNewCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      const updatedCategories = [...categories, newCategory.trim()];
      setCategories(updatedCategories);
      setProduct(prev => ({ ...prev, category: newCategory.trim() }));
      setNewCategory('');
      setShowCategoryDialog(false);
      toast({
        title: "Category Added",
        description: `"${newCategory.trim()}" has been added to the categories list.`,
      });
    }
  };

  const resetForm = () => {
    setProduct({
      name: '',
      sku: '',
      barcode: '',
      purchasePrice: '',
      sellPrice: '',
      openingStock: '',
      unit: '',
      category: '',
      image: null
    });
    setImagePreview(null);
  };

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!product.name || !product.sku || !product.purchasePrice || !product.sellPrice || !product.unit || !product.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Convert image to base64 if present
      let imageBase64 = undefined;
      if (product.image) {
        imageBase64 = await convertImageToBase64(product.image);
        console.log('Image converted to base64:', imageBase64?.substring(0, 100) + '...');
      }

      // Create product data
      const productData = {
        name: product.name,
        sku: product.sku,
        barcode: product.barcode,
        category: product.category,
        purchasePrice: product.purchasePrice,
        sellPrice: product.sellPrice,
        price: product.sellPrice,
        openingStock: parseInt(product.openingStock) || 0,
        unit: product.unit,
        image: imageBase64
      };

      console.log('Product data to be saved:', { ...productData, image: productData.image ? 'base64 data present' : 'no image' });
      
      // Call the callback if provided
      if (onProductCreated) {
        await onProductCreated(productData);
      }
      
      toast({
        title: "Product Created",
        description: `Product "${product.name}" has been created successfully.`,
      });

      // Reset form
      resetForm();
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: "Error",
        description: "Failed to create product. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Create New Product</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="productName">Product Name *</Label>
              <Input
                id="productName"
                value={product.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={product.sku}
                onChange={(e) => handleInputChange('sku', e.target.value)}
                placeholder="Enter SKU"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode</Label>
              <Input
                id="barcode"
                value={product.barcode}
                onChange={(e) => handleInputChange('barcode', e.target.value)}
                placeholder="Enter barcode"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="openingStock">Opening Stock</Label>
              <Input
                id="openingStock"
                type="number"
                value={product.openingStock}
                onChange={(e) => handleInputChange('openingStock', e.target.value)}
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
                type="number"
                step="0.01"
                value={product.purchasePrice}
                onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
                placeholder="Enter purchase price"
                min="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sellPrice">Sell Price *</Label>
              <Input
                id="sellPrice"
                type="number"
                step="0.01"
                value={product.sellPrice}
                onChange={(e) => handleInputChange('sellPrice', e.target.value)}
                placeholder="Enter sell price"
                min="0"
                required
              />
            </div>
          </div>

          {/* Unit and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Unit *</Label>
              <div className="flex gap-2">
                <Select value={product.unit} onValueChange={(value) => handleInputChange('unit', value)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Dialog open={showUnitDialog} onOpenChange={setShowUnitDialog}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Unit</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        value={newUnit}
                        onChange={(e) => setNewUnit(e.target.value)}
                        placeholder="Enter new unit"
                        onKeyPress={(e) => e.key === 'Enter' && addNewUnit()}
                      />
                      <div className="flex gap-2">
                        <Button onClick={addNewUnit} className="flex-1">
                          Add Unit
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowUnitDialog(false)}
                          className="flex-1"
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
                <Select value={product.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Category</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Enter new category"
                        onKeyPress={(e) => e.key === 'Enter' && addNewCategory()}
                      />
                      <div className="flex gap-2">
                        <Button onClick={addNewCategory} className="flex-1">
                          Add Category
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowCategoryDialog(false)}
                          className="flex-1"
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
                      htmlFor="image-upload"
                      className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Upload Image
                    </Label>
                    <input
                      id="image-upload"
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

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button type="submit" className="flex-1">
              Create Product
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={resetForm}
            >
              Reset Form
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
