'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Calendar as CalendarIcon, 
  List, 
  Search, 
  Wrench,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export default function MaintenancePage() {
  const [view, setView] = useState<'list' | 'calendar'>('list');

  const { data: logs, isLoading } = useQuery({
    queryKey: ['maintenance-logs'],
    queryFn: async () => {
      const res = await api.get('/maintenance');
      return res.data.data;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-medical-navy mb-1">Maintenance Schedule</h1>
          <p className="text-slate-500 text-sm">Monitor planned preventive maintenance and history.</p>
        </div>
        <div className="flex items-center bg-white rounded-xl border border-slate-100 p-1 shadow-sm">
          <Button 
            variant={view === 'list' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setView('list')}
            className={`rounded-lg gap-2 ${view === 'list' ? 'bg-medical-navy text-white' : 'text-slate-500'}`}
          >
            <List size={16} /> List
          </Button>
          <Button 
            variant={view === 'calendar' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setView('calendar')}
            className={`rounded-lg gap-2 ${view === 'calendar' ? 'bg-medical-navy text-white' : 'text-slate-500'}`}
          >
            <CalendarIcon size={16} /> Calendar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          {view === 'list' ? (
            <Card className="border-none shadow-sm overflow-hidden">
               <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      placeholder="Search maintenance logs..." 
                      className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none"
                    />
                  </div>
                  <Button variant="outline" className="rounded-xl h-10 px-4">Overdue</Button>
               </div>
               
               <div className="divide-y divide-slate-50">
                 {isLoading ? (
                   <div className="p-8 text-center animate-pulse">Loading logs...</div>
                 ) : logs?.length === 0 ? (
                   <div className="p-20 text-center text-slate-400">
                      <CalendarIcon size={48} className="mx-auto mb-4 opacity-20" />
                      <p>No maintenance logs found.</p>
                   </div>
                 ) : (
                   logs?.map((log: any) => (
                     <div key={log._id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                       <div className="flex gap-4">
                         <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                           log.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                         }`}>
                           {log.status === 'completed' ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                         </div>
                         <div>
                           <h4 className="text-sm font-bold text-medical-navy">{log.equipmentId?.name || 'Unknown Equipment'}</h4>
                           <p className="text-xs text-slate-500">Scheduled: {new Date(log.scheduledDate).toLocaleDateString()}</p>
                           <div className="flex items-center gap-3 mt-2">
                             <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                               log.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                             }`}>
                               {log.status}
                             </span>
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{log.type}</span>
                           </div>
                         </div>
                       </div>
                       <Link href={`/maintenance/${log._id}`}>
                         <Button variant="ghost" size="sm" className="text-medical-blue font-bold text-xs gap-1">
                           Details <ArrowRight size={14} />
                         </Button>
                       </Link>
                     </div>
                   ))
                 )}
               </div>
            </Card>
          ) : (
            <Card className="p-20 text-center text-slate-400">
               <CalendarIcon size={64} className="mx-auto mb-6 opacity-10" />
               <h3 className="text-xl font-bold text-medical-navy mb-2">Calendar View Coming Soon</h3>
               <p className="max-w-xs mx-auto">We are integrating a full interactive calendar for better schedule visualization.</p>
            </Card>
          )}
        </div>

        <div className="space-y-6">
           <Card>
             <CardHeader>
               <CardTitle className="text-sm">Maintenance Summary</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Scheduled this month</span>
                  <span className="text-sm font-bold text-medical-navy">24</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Completed</span>
                  <span className="text-sm font-bold text-green-600">18</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Pending/Overdue</span>
                  <span className="text-sm font-bold text-red-600">6</span>
                </div>
                <div className="pt-4 border-t border-slate-100">
                   <p className="text-[10px] text-slate-400 uppercase font-bold mb-2">Compliance Rate</p>
                   <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-medical-blue" style={{ width: '75%' }}></div>
                   </div>
                   <p className="text-right text-[10px] font-bold mt-1 text-medical-blue">75%</p>
                </div>
             </CardContent>
           </Card>

           <Card className="bg-medical-navy text-white p-6">
              <h4 className="font-bold mb-2">Export Schedule</h4>
              <p className="text-xs text-slate-400 mb-6">Download the maintenance calendar for your department in PDF or Excel.</p>
              <div className="space-y-2">
                <Button className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs h-9 rounded-lg">PDF Export</Button>
                <Button className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs h-9 rounded-lg">Excel Export</Button>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
