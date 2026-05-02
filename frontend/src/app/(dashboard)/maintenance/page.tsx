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
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export default function MaintenancePage() {
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleYearChange = (year: number) => {
    setCurrentDate(new Date(year, currentMonth, 1));
  };

  const handleMonthChange = (month: number) => {
    setCurrentDate(new Date(currentYear, month, 1));
  };

  // Calculate days in month and start day
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

  const calendarDays = [];
  // Fill previous month padding
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({ day: prevMonthDays - i, currentMonth: false });
  }
  // Fill current month
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({ day: i, currentMonth: true });
  }
  // Fill next month padding
  const totalSlots = 42; // 6 rows
  const remaining = totalSlots - calendarDays.length;
  for (let i = 1; i <= remaining; i++) {
    calendarDays.push({ day: i, currentMonth: false });
  }

  const { data: logs, isLoading } = useQuery({
    queryKey: ['maintenance-logs'],
    queryFn: async () => {
      const res = await api.get('/maintenance');
      return res.data.data;
    }
  });

  const { data: summary } = useQuery({
    queryKey: ['maintenance-summary'],
    queryFn: async () => {
      const res = await api.get('/maintenance/summary');
      return res.data.data;
    }
  });

  const handleExport = async (format: 'pdf' | 'csv') => {
    try {
      if (format === 'csv') {
        const res = await api.get('/maintenance/export', { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `maintenance_report_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        // PDF Export - usually we'd want a collective report, but for now we'll trigger a print view or single reports
        window.print();
      }
    } catch (error) {
      console.error('Export failed', error);
    }
  };

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
            <Card className="border-none shadow-sm overflow-hidden">
               <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100">
                      <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-8 w-8 text-slate-500 hover:text-medical-blue"><ChevronLeft size={16} /></Button>
                      <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8 text-slate-500 hover:text-medical-blue"><ChevronRight size={16} /></Button>
                    </div>
                    <div className="flex items-center gap-2">
                       <select 
                         value={currentMonth} 
                         onChange={(e) => handleMonthChange(parseInt(e.target.value))}
                         className="bg-transparent border-none text-lg font-bold text-medical-navy focus:ring-0 outline-none cursor-pointer"
                       >
                         {monthNames.map((name, i) => <option key={name} value={i}>{name}</option>)}
                       </select>
                       <select 
                         value={currentYear} 
                         onChange={(e) => handleYearChange(parseInt(e.target.value))}
                         className="bg-transparent border-none text-lg font-bold text-slate-400 focus:ring-0 outline-none cursor-pointer"
                       >
                         {Array.from({ length: 10 }, (_, i) => 2024 + i).map(y => <option key={y} value={y}>{y}</option>)}
                       </select>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())} className="rounded-lg text-xs font-bold text-slate-500 h-8">Today</Button>
               </div>

               <div className="grid grid-cols-7 gap-px bg-slate-100">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="bg-slate-50 p-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">{day}</div>
                  ))}
                  {calendarDays.map((date, i) => {
                    const isToday = date.currentMonth && date.day === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();
                    
                    const dayLogs = logs?.filter((l: any) => {
                       const logDate = new Date(l.scheduledDate);
                       return date.currentMonth && 
                              logDate.getDate() === date.day && 
                              logDate.getMonth() === currentMonth && 
                              logDate.getFullYear() === currentYear;
                    }) || [];

                    return (
                      <div key={i} className={`bg-white min-h-[120px] p-2 hover:bg-slate-50/50 transition-colors cursor-pointer group border-b border-r border-slate-50 ${!date.currentMonth ? 'opacity-30' : ''}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-bold ${isToday ? 'w-6 h-6 rounded-full bg-medical-blue text-white flex items-center justify-center' : date.currentMonth ? 'text-medical-navy' : 'text-slate-300'}`}>
                            {date.day}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {dayLogs.map((l: any) => (
                            <Link key={l._id} href={`/maintenance/${l._id}`}>
                              <div className={`text-[8px] p-1.5 rounded-lg font-black truncate shadow-sm transition-transform hover:scale-105 ${
                                l.status === 'completed' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-blue-50 text-blue-700 border border-blue-100'
                              }`}>
                                {l.equipmentId?.name}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    );
                  })}
               </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
           <Card className="border-none shadow-sm">
             <CardHeader>
               <CardTitle className="text-sm font-bold text-medical-navy">Maintenance Summary</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Scheduled this month</span>
                  <span className="text-sm font-bold text-medical-navy">{summary?.scheduled || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Completed</span>
                  <span className="text-sm font-bold text-green-600">{summary?.completed || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Pending/Overdue</span>
                  <span className="text-sm font-bold text-red-600">{summary?.pending || 0}</span>
                </div>
                <div className="pt-4 border-t border-slate-50">
                   <p className="text-[10px] text-slate-400 uppercase font-bold mb-2 tracking-widest">Compliance Rate</p>
                   <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-medical-blue transition-all duration-1000" style={{ width: `${summary?.complianceRate || 0}%` }}></div>
                   </div>
                   <p className="text-right text-[10px] font-black mt-1 text-medical-blue">{summary?.complianceRate || 0}%</p>
                </div>
             </CardContent>
           </Card>

           <Card className="bg-medical-navy text-white p-6 border-none shadow-lg overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-medical-blue/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <h4 className="font-bold mb-2 relative z-10">Export Schedule</h4>
              <p className="text-xs text-slate-400 mb-6 relative z-10 leading-relaxed">Download the maintenance calendar for your department in PDF or Excel format for offline tracking.</p>
              <div className="space-y-2 relative z-10">
                <Button 
                  onClick={() => handleExport('pdf')}
                  className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs h-10 rounded-xl font-bold transition-all"
                >
                  PDF Export
                </Button>
                <Button 
                  onClick={() => handleExport('csv')}
                  className="w-full bg-medical-blue hover:bg-medical-blue/90 text-white text-xs h-10 rounded-xl font-bold shadow-lg shadow-medical-blue/20 transition-all"
                >
                  Excel (CSV) Export
                </Button>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
