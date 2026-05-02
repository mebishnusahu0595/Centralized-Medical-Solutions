'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  History, 
  Search, 
  Filter, 
  Download,
  Calendar
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function PlatformAuditPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const { data: logs, isLoading } = useQuery({
    queryKey: ['platform-audit-logs'],
    queryFn: async () => {
      const res = await api.get('/audit-logs?limit=100');
      return res.data.data;
    }
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-medical-navy">Platform Audit</h1>
            <p className="text-slate-500 text-sm">Full transparency of every action taken across the CMS platform.</p>
          </div>
        </div>
        <Button className="bg-medical-blue text-white rounded-xl gap-2">
          <Download size={18} /> Export Full Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="border-none shadow-sm bg-medical-navy text-white">
          <CardContent className="p-6">
             <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Total Events</p>
             <h3 className="text-2xl font-bold mt-1">{logs?.length || 0}</h3>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
             <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Active Sessions</p>
             <h3 className="text-2xl font-bold mt-1 text-medical-navy">12</h3>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
             <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">System Health</p>
             <h3 className="text-2xl font-bold mt-1 text-green-600 font-bold uppercase">Optimal</h3>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 p-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              placeholder="Search by user, action, or hospital..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
             <Button variant="outline" size="sm" className="rounded-lg gap-2 text-xs">
               <Filter size={14} /> Filter
             </Button>
             <Button variant="outline" size="sm" className="rounded-lg gap-2 text-xs">
               <Calendar size={14} /> Date Range
             </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Resource</th>
                  <th className="px-6 py-4">Hospital</th>
                  <th className="px-6 py-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <tr><td colSpan={6} className="p-12 text-center animate-pulse">Loading audit logs...</td></tr>
                ) : logs?.length === 0 ? (
                  <tr><td colSpan={6} className="p-12 text-center text-slate-400">No logs found.</td></tr>
                ) : (
                  logs?.map((log: any) => (
                    <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-xs font-medium text-slate-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold">
                            {log.userId?.name?.substring(0, 1)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-medical-navy">{log.userId?.name}</p>
                            <p className="text-[10px] text-slate-400">{log.userId?.role?.replace('_', ' ')}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          log.action === 'DELETE' ? 'bg-red-50 text-red-600' : 
                          log.action === 'CREATE' ? 'bg-green-50 text-green-600' : 
                          'bg-blue-50 text-medical-blue'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-600">{log.resource}</td>
                      <td className="px-6 py-4 text-xs text-medical-navy font-bold">
                        {log.hospitalId?.name || 'PLATFORM'}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">{log.ipAddress}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
