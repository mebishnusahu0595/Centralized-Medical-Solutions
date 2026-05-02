'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { User, Mail, ShieldCheck, Lock, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SuperProfilePage() {
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Profile settings updated successfully.');
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-medical-navy mb-1">Account Settings</h1>
        <p className="text-slate-500 text-sm">Manage your personal information and security preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User size={18} className="text-medical-blue" /> Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                  <Input defaultValue={user?.name} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                  <Input defaultValue={user?.email} disabled className="rounded-xl bg-slate-50" />
                </div>
              </div>
              
              <div className="pt-4">
                <Button disabled={loading} className="bg-medical-navy text-white rounded-xl px-8">
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
           <Card className="border-none shadow-sm bg-blue-50/50">
             <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-medical-blue text-white flex items-center justify-center">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Role</p>
                    <p className="text-sm font-bold text-medical-navy uppercase">Platform Admin</p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  You have full administrative access to the platform, including hospital onboarding and revenue management.
                </p>
             </CardContent>
           </Card>

           <Card className="border-none shadow-sm">
             <CardHeader>
               <CardTitle className="text-sm flex items-center gap-2">
                 <Lock size={14} /> Security Status
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Two-Factor Auth</span>
                  <span className="text-[10px] font-bold text-red-500 uppercase">Disabled</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Session Timeout</span>
                  <span className="text-[10px] font-bold text-slate-700 uppercase">15 Minutes</span>
                </div>
             </CardContent>
           </Card>
        </div>

        <Card className="md:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock size={18} className="text-medical-blue" /> Password & Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Password</label>
                <PasswordInput placeholder="••••••••" className="rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">New Password</label>
                  <PasswordInput placeholder="••••••••" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Confirm New Password</label>
                  <PasswordInput placeholder="••••••••" className="rounded-xl" />
                </div>
              </div>
              <div className="pt-4">
                <Button variant="outline" className="rounded-xl px-8">Update Password</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
