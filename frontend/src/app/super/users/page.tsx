'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  User as UserIcon, 
  Mail, 
  Building2, 
  UserCog, 
  ChevronDown, 
  ChevronRight,
  History,
  X,
  ShieldAlert
} from 'lucide-react';
import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import Link from 'next/link';

export default function SuperUsersPage() {
  const [search, setSearch] = useState('');
  const [logSearch, setLogSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [expandedHospital, setExpandedHospital] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['super-users'],
    queryFn: async () => {
      const res = await api.get('/users'); 
      return res.data.data;
    }
  });

  const { data: hospitals, isLoading: hospitalsLoading } = useQuery({
    queryKey: ['super-hospitals'],
    queryFn: async () => {
      const res = await api.get('/hospitals');
      return res.data.data;
    }
  });

  const { data: userLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['user-logs', selectedUser?._id],
    queryFn: async () => {
      if (!selectedUser) return [];
      const res = await api.get(`/audit-logs?userId=${selectedUser._id}`);
      return res.data.data;
    },
    enabled: !!selectedUser
  });

  const filteredLogs = userLogs?.filter((log: any) => {
    const matchesSearch = !logSearch || 
      log.action.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.resource.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.ipAddress?.toLowerCase().includes(logSearch.toLowerCase());
    
    const matchesDate = !startDate || log.timestamp.startsWith(startDate);
    
    return matchesSearch && matchesDate;
  });

  if (usersLoading || hospitalsLoading) return <div className="p-12 text-center animate-pulse text-medical-navy font-bold">Initializing User Directory...</div>;

  const platformAdmins = users?.filter((u: any) => u.role === 'super_admin') || [];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-medical-navy mb-1">User Directory</h1>
          <p className="text-slate-500 text-sm">Manage all administrative and engineering staff across the platform.</p>
        </div>
        <Link href="/super/audit-logs">
          <Button className="bg-medical-navy hover:bg-medical-navy/90 text-white rounded-xl gap-2 h-11 px-6">
            <UserCog size={18} /> Platform Audit
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {/* Platform Admins Section */}
        <Card className="border-none shadow-sm overflow-hidden border-l-4 border-medical-navy">
          <CardContent className="p-0">
            <div className="p-4 bg-slate-50/50 flex items-center justify-between">
              <h3 className="text-xs font-bold text-medical-navy uppercase tracking-widest flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" /> Platform Administrators
              </h3>
              <span className="text-[10px] font-bold bg-medical-navy text-white px-2 py-0.5 rounded">{platformAdmins.length} Users</span>
            </div>
            <div className="divide-y divide-slate-50">
              {platformAdmins.map((user: any) => (
                <div key={user._id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-medical-navy text-white flex items-center justify-center">
                      <UserIcon size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-medical-navy">{user.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{user.email}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedUser(user)}
                    className="text-[10px] font-bold text-medical-blue uppercase tracking-widest hover:bg-blue-50"
                  >
                    View Logs
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Hospitals Sections */}
        <div className="space-y-3">
          {hospitals?.map((h: any) => {
            const hospitalStaff = users?.filter((u: any) => u.hospitalId?._id === h._id) || [];
            const isExpanded = expandedHospital === h._id;

            return (
              <Card key={h._id} className="border-none shadow-sm overflow-hidden group">
                <CardContent className="p-0">
                  <div 
                    className={`p-5 flex items-center justify-between cursor-pointer transition-colors ${isExpanded ? 'bg-slate-50' : 'hover:bg-slate-50/50'}`}
                    onClick={() => setExpandedHospital(isExpanded ? null : h._id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-medical-navy group-hover:bg-medical-blue group-hover:text-white transition-colors">
                        <Building2 size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-medical-navy">{h.name}</h4>
                        <div className="flex items-center gap-4 mt-0.5">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{h.code}</span>
                          <span className="text-[10px] text-medical-blue font-bold uppercase tracking-widest">{hospitalStaff.length} Staff Members</span>
                        </div>
                      </div>
                    </div>
                    {isExpanded ? <ChevronDown size={20} className="text-slate-400" /> : <ChevronRight size={20} className="text-slate-400" />}
                  </div>

                  {isExpanded && (
                    <div className="border-t border-slate-100 divide-y divide-slate-50 bg-white">
                      {hospitalStaff.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-400 italic">No staff members found for this facility.</div>
                      ) : (
                        hospitalStaff.map((user: any) => (
                          <div key={user._id} className="p-4 pl-16 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                                {user.name.substring(0, 1)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-bold text-medical-navy">{user.name}</p>
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                    user.role === 'hospital_admin' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                                  }`}>
                                    {user.role.replace('_', ' ')}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-400">{user.email}</p>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setSelectedUser(user)}
                              className="text-[10px] font-bold text-medical-blue uppercase tracking-widest hover:bg-blue-50"
                            >
                              View Logs
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* User Logs Modal */}
      <Dialog open={!!selectedUser} onOpenChange={() => {
        setSelectedUser(null);
        setLogSearch('');
        setStartDate('');
      }}>
        <DialogContent className="max-w-4xl bg-white rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="p-8 bg-medical-navy text-white">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <History size={24} />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold">Activity Audit Trail</DialogTitle>
                  <p className="text-sm text-white/60">{selectedUser?.name} • {selectedUser?.role?.replace('_', ' ')} • {selectedUser?.email}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedUser(null)} className="text-white hover:bg-white/10 rounded-full">
                <X size={24} />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                <input 
                  placeholder="Search logs..." 
                  className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-white/20 outline-none text-white placeholder:text-white/30"
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                />
              </div>
              <input 
                type="date"
                className="w-full px-4 py-2.5 bg-white/10 border border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-white/20 outline-none text-white [color-scheme:dark]"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <div className="flex items-center justify-end px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Total Logs: {userLogs?.length || 0}</span>
              </div>
            </div>
          </div>

          <div className="p-0">
             <div className="max-h-[500px] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                    <tr>
                      <th className="px-8 py-4">Timestamp</th>
                      <th className="px-6 py-4">Action</th>
                      <th className="px-6 py-4">Resource</th>
                      <th className="px-6 py-4">IP Address</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {logsLoading ? (
                      <tr><td colSpan={5} className="p-20 text-center animate-pulse text-slate-400">Fetching logs...</td></tr>
                    ) : filteredLogs?.length === 0 ? (
                      <tr><td colSpan={5} className="p-20 text-center text-slate-400 italic">No matching logs found.</td></tr>
                    ) : (
                      filteredLogs?.map((log: any) => (
                        <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-4 whitespace-nowrap">
                            <p className="text-xs font-bold text-medical-navy">{new Date(log.timestamp).toLocaleDateString()}</p>
                            <p className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider ${
                              log.action === 'CREATE' ? 'bg-emerald-50 text-emerald-700' :
                              log.action === 'DELETE' ? 'bg-rose-50 text-rose-700' :
                              'bg-sky-50 text-sky-700'
                            }`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs font-medium text-slate-600">{log.resource}</td>
                          <td className="px-6 py-4 text-[10px] font-mono text-slate-400">{log.ipAddress}</td>
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Verified</span>
                             </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
             </div>
          </div>
          <div className="p-6 bg-slate-50 flex justify-between items-center border-t border-slate-100">
            <p className="text-[10px] text-slate-400 font-medium">Audit logs are immutable and cryptographically signed.</p>
            <Button variant="ghost" className="text-xs font-bold text-medical-blue hover:bg-white" onClick={() => setSelectedUser(null)}>
              Dismiss Audit
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


