
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUnits } from '@/hooks/useUnits';

export const UnitManagement = () => {
  const { toast } = useToast();
  const { units, addUnit, editUnit, deleteUnit, loading } = useUnits();
  
  const [newUnit, setNewUnit] = useState('');
  const [editingUnit, setEditingUnit] = useState<{ id: string; name: string } | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleAddUnit = async () => {
    if (newUnit.trim()) {
      try {
        await addUnit(newUnit.trim());
        setNewUnit('');
        setShowAddDialog(false);
        toast({
          title: "Unit Added",
          description: `"${newUnit.trim()}" has been added successfully.`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to add unit. It may already exist.",
          variant: "destructive",
        });
      }
    }
  };

  const handleEditUnit = async () => {
    if (editingUnit && editingUnit.name.trim()) {
      try {
        await editUnit(editingUnit.id, editingUnit.name.trim());
        setEditingUnit(null);
        setShowEditDialog(false);
        toast({
          title: "Unit Updated",
          description: `Unit has been updated successfully.`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update unit. Name may already exist.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteUnit = async (id: string, name: string) => {
    try {
      await deleteUnit(id);
      toast({
        title: "Unit Deleted",
        description: `"${name}" has been deleted successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete unit. It may be in use by products.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading units...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Unit Management</CardTitle>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Unit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Unit</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="unitName">Unit Name</Label>
                  <Input
                    id="unitName"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    placeholder="Enter unit name"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddUnit()}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddUnit} className="flex-1">
                    Add Unit
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddDialog(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {units.map((unit) => (
              <TableRow key={unit.id}>
                <TableCell className="font-medium">{unit.name}</TableCell>
                <TableCell>{new Date(unit.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setEditingUnit({ id: unit.id, name: unit.name });
                      setShowEditDialog(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeleteUnit(unit.id, unit.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Unit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editUnitName">Unit Name</Label>
                <Input
                  id="editUnitName"
                  value={editingUnit?.name || ''}
                  onChange={(e) => setEditingUnit(prev => prev ? { ...prev, name: e.target.value } : null)}
                  placeholder="Enter unit name"
                  onKeyPress={(e) => e.key === 'Enter' && handleEditUnit()}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleEditUnit} className="flex-1">
                  Update Unit
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
