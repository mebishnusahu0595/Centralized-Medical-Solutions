'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { 
  Building2, 
  Users, 
  CreditCard, 
  Activity,
  Globe,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AddHospitalModal } from '@/components/super/AddHospitalModal';

export default function SuperAdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['super-stats'],
    queryFn: async () => {
      const res = await api.get('/analytics/dashboard');
      return res.data.data;
    }
  });

  if (isLoading) return <div>Loading platform metrics...</div>;

  const metrics = [
    { label: 'Total Hospitals', value: stats?.stats?.totalHospitals || 0, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Subscriptions', value: stats?.stats?.activeHospitals || 0, icon: CreditCard, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Platform Users', value: stats?.stats?.totalUsers?.toLocaleString() || 0, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Total Equipment', value: stats?.stats?.totalEquipment || 0, icon: Globe, color: 'text-amber-600', bg: 'bg-amber-50' }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-medical-navy mb-2">Platform Overview</h1>
          <p className="text-slate-500">Monitor all hospitals and global platform health.</p>
        </div>
        <AddHospitalModal />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`${metric.bg} ${metric.color} p-3 rounded-xl`}>
                  <metric.icon size={24} />
                </div>
                <div>
                  <p className="text-slate-500 text-sm font-medium">{metric.label}</p>
                  <h3 className="text-2xl font-bold text-medical-navy">{metric.value}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Hospital Onboarding</CardTitle>
            <CardDescription>Hospitals that joined the platform recently.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
               {stats?.recentHospitals?.length === 0 ? (
                 <div className="py-10 text-center text-slate-400">No hospitals registered yet.</div>
               ) : (
                 stats?.recentHospitals?.map((h: any) => (
                   <div key={h._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-100 font-bold text-medical-blue uppercase">
                         {h.name.substring(0, 2)}
                       </div>
                       <div>
                         <p className="text-sm font-bold text-medical-navy">{h.name}</p>
                         <p className="text-xs text-slate-500">
                           Plan: {h.subscriptionPlan.charAt(0).toUpperCase() + h.subscriptionPlan.slice(1)} • {new Date(h.createdAt).toLocaleDateString()}
                         </p>
                       </div>
                     </div>
                     <div className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                       h.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                     }`}>
                       {h.isActive ? 'ACTIVE' : 'SUSPENDED'}
                     </div>
                   </div>
                 ))
               )}
             </div>
             <Link href="/super/hospitals">
               <Button variant="ghost" className="w-full mt-6 text-medical-blue font-bold text-xs">
                 View All Hospitals
               </Button>
             </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Global platform infrastructure status.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                   <span className="text-sm font-medium">API Server</span>
                 </div>
                 <span className="text-xs text-slate-400 font-bold">OPERATIONAL</span>
               </div>
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                   <span className="text-sm font-medium">Database (MongoDB)</span>
                 </div>
                 <span className="text-xs text-slate-400 font-bold">CONNECTED</span>
               </div>
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                   <span className="text-sm font-medium">Socket Gateway</span>
                 </div>
                 <span className="text-xs text-slate-400 font-bold">STABLE</span>
               </div>
            </div>
            <div className="mt-12 p-4 bg-medical-navy rounded-2xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Activity size={48} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <Activity size={18} className="text-medical-blue" />
                  <p className="text-sm font-bold">Platform Pulse</p>
                </div>
                <p className="text-xs text-white/60">
                  Platform is performing at optimal capacity. All regional nodes are healthy.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
