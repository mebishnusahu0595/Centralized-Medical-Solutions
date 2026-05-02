'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users as UsersIcon, 
  UserPlus, 
  Search, 
  MoreVertical, 
  Mail, 
  Phone, 
  Shield, 
  Trash2,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { AddUserModal } from '@/components/users/AddUserModal';

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        const res = await api.get('/users');
        console.log('Users Data Fetched:', res.data.data);
        return res.data.data;
      } catch (err) {
        console.error('Error fetching users:', err);
        throw err;
      }
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deactivated successfully');
    },
    onError: () => {
      toast.error('Failed to deactivate user');
    }
  });

  const filteredUsers = users?.filter((user: any) => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    const roles = {
      hospital_admin: 'bg-purple-100 text-purple-700 border-purple-200',
      engineer: 'bg-blue-100 text-blue-700 border-blue-200',
      staff: 'bg-slate-100 text-slate-700 border-slate-200',
      super_admin: 'bg-red-100 text-red-700 border-red-200'
    };
    return roles[role as keyof typeof roles] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-medical-navy mb-1 tracking-tight">User Management</h1>
          <p className="text-slate-500 text-sm">Manage access and roles for your hospital facility.</p>
        </div>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-medical-blue hover:bg-medical-blue/90 text-white rounded-xl gap-2 h-11 px-6 shadow-lg shadow-medical-blue/20"
        >
          <UserPlus size={18} /> Add New User
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-gradient-to-br from-white to-slate-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <UsersIcon size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Staff</p>
                <h3 className="text-2xl font-black text-medical-navy">{users?.length || 0}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Add more summary cards if needed */}
      </div>

      <Card className="border-none shadow-sm overflow-hidden bg-white">
        <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              placeholder="Search by name, email, or role..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-medical-blue/20 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">User Details</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-8 h-20 bg-slate-50/20"></td>
                  </tr>
                ))
              ) : filteredUsers?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400">
                    <UsersIcon size={48} className="mx-auto mb-4 opacity-10" />
                    <p className="font-bold">No users found</p>
                  </td>
                </tr>
              ) : (
                filteredUsers?.map((user: any) => (
                  <tr key={user._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-medical-navy group-hover:bg-medical-blue/10 group-hover:text-medical-blue transition-colors">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-medical-navy">{user.name}</p>
                          <p className="text-xs text-slate-400 font-medium">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getRoleBadge(user.role)}`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      {user.isActive ? (
                        <div className="flex items-center gap-1.5 text-green-600">
                          <CheckCircle2 size={14} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Active</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <XCircle size={14} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Deactivated</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-3">
                         <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-blue-50 hover:text-blue-600 text-slate-400 transition-colors" title="Email">
                           <Mail size={14} />
                         </Button>
                         <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-green-50 hover:text-green-600 text-slate-400 transition-colors" title="Call">
                           <Phone size={14} />
                         </Button>
                       </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          if (confirm('Are you sure you want to deactivate this user?')) {
                            deleteMutation.mutate(user._id);
                          }
                        }}
                        className="h-9 w-9 rounded-xl hover:bg-red-50 hover:text-red-600 text-slate-300 transition-all"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <AddUserModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
}
