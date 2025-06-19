import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users, UserPlus, Edit, Trash2, Shield, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase, supabaseAdmin } from '@/integrations/supabase/client';

interface UserData {
  id: string;
  user_id: string;
  username: string;
  role: 'super_admin' | 'admin' | 'manager' | 'staff' | 'guest';
  company_id: string | null;
  is_active: boolean;
  company?: {
    id: string;
    name: string;
  };
}

interface Company {
  id: string;
  name: string;
}

export const UserManagement = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'guest' as 'super_admin' | 'admin' | 'manager' | 'staff' | 'guest',
    company_id: ''
  });

  // Define functions before useEffect
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('user_profiles')
        .select(`
          *,
          company:companies(id, name)
        `)
        .order('created_at', { ascending: false });

      // If not super admin, only show users from the same company
      if (userProfile?.role !== 'super_admin') {
        query = query.eq('company_id', userProfile?.company_id);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .order('name');

      if (error) {
        throw error;
      }

      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  useEffect(() => {
    if (userProfile?.role === 'super_admin' || userProfile?.role === 'admin') {
      fetchUsers();
      if (userProfile?.role === 'super_admin') {
        fetchCompanies();
      }
    }
  }, [userProfile]);

  const canManageUsers = userProfile?.role === 'super_admin' || userProfile?.role === 'admin';

  if (!canManageUsers) {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Access denied. Only admin and super admin users can manage users.
        </AlertDescription>
      </Alert>
    );
  }

  const handleCreateUser = async () => {
    if (!formData.username || !formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    let finalCompanyId = formData.company_id;
    if (userProfile?.role !== 'super_admin') {
      finalCompanyId = userProfile?.company_id || '';
    }

    try {
      console.log('Creating user with supabaseAdmin.auth.admin.createUser...');
      
      // Create auth user using admin client with service role
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        user_metadata: {
          username: formData.username
        },
        email_confirm: true
      });

      if (authError) {
        console.error('Auth creation error:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('User creation failed - no user data returned');
      }

      console.log('Auth user created successfully:', authData.user.id);

      // Create the user profile using admin client
      const { error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .insert({
          user_id: authData.user.id,
          username: formData.username,
          role: formData.role,
          company_id: finalCompanyId === 'none' ? null : finalCompanyId,
          is_active: true
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        
        // If profile creation fails, try to clean up the auth user
        try {
          await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
          console.log('Cleaned up auth user after profile creation failure');
        } catch (cleanupError) {
          console.error('Failed to cleanup auth user:', cleanupError);
        }
        
        throw new Error(`Failed to create user profile: ${profileError.message}`);
      }

      console.log('User profile created successfully');

      toast({
        title: "Success",
        description: "User created successfully"
      });

      setFormData({ username: '', email: '', password: '', role: 'guest', company_id: 'none' });
      setIsCreateDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive"
      });
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser || !formData.username) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          username: formData.username,
          role: formData.role,
          company_id: formData.company_id === 'none' ? null : formData.company_id
        })
        .eq('id', selectedUser.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "User updated successfully"
      });

      setIsEditDialogOpen(false);
      setSelectedUser(null);
      setFormData({ username: '', email: '', password: '', role: 'guest', company_id: '' });
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === userProfile?.user_id) {
      toast({
        title: "Error",
        description: "You cannot delete your own account",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "User deleted successfully"
      });

      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (user: UserData) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: '',
      password: '',
      role: user.role,
      company_id: user.company_id || 'none'
    });
    setIsEditDialogOpen(true);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin': return 'destructive';
      case 'admin': return 'default';
      case 'manager': return 'secondary';
      case 'staff': return 'outline';
      default: return 'secondary';
    }
  };

  const resetForm = () => {
    setFormData({ 
      username: '', 
      email: '', 
      password: '', 
      role: 'guest', 
      company_id: userProfile?.role === 'super_admin' ? 'none' : userProfile?.company_id || ''
    });
    setSelectedUser(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <CardTitle>User Management</CardTitle>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="Enter username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="guest">Guest</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        {userProfile?.role === 'super_admin' && (
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  {userProfile?.role === 'super_admin' && (
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Select value={formData.company_id} onValueChange={(value) => setFormData({ ...formData, company_id: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select company" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Company</SelectItem>
                          {companies.map((company) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleCreateUser} className="flex-1">
                      Create User
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsCreateDialogOpen(false);
                        resetForm();
                      }}
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
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {user.username}
                      {user.user_id === userProfile?.user_id && (
                        <Badge variant="outline" className="text-xs">You</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.company?.name || 'No Company'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? 'default' : 'secondary'}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(user)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={user.user_id === userProfile?.user_id}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-username">Username</Label>
              <Input
                id="edit-username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Enter username"
              />
            </div>
            <div>
              <Label htmlFor="edit-role">Role</Label>
              <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="guest">Guest</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  {userProfile?.role === 'super_admin' && (
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            {userProfile?.role === 'super_admin' && (
              <div>
                <Label htmlFor="edit-company">Company</Label>
                <Select value={formData.company_id} onValueChange={(value) => setFormData({ ...formData, company_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Company</SelectItem>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex gap-2 pt-4">
              <Button onClick={handleEditUser} className="flex-1">
                Update User
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditDialogOpen(false);
                  resetForm();
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
