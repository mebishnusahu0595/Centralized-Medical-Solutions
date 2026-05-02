'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Megaphone, 
  Plus, 
  Calendar, 
  ShieldCheck, 
  Trash2, 
  X, 
  Send,
  Users,
  Target,
  AlertCircle
} from 'lucide-react';
import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import toast from 'react-hot-toast';

export default function SuperAnnouncementsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetType, setTargetType] = useState<'all' | 'specific'>('all');
  const [selectedHospitals, setSelectedHospitals] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['super-announcements'],
    queryFn: async () => {
      const res = await api.get('/announcements');
      return res.data.data;
    }
  });

  const { data: hospitals } = useQuery({
    queryKey: ['super-hospitals-simple'],
    queryFn: async () => {
      const res = await api.get('/hospitals');
      return res.data.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: (newAnnouncement: any) => api.post('/announcements', newAnnouncement),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-announcements'] });
      setIsModalOpen(false);
      toast.success('Announcement broadcasted successfully!');
    },
    onError: () => toast.error('Failed to send announcement')
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/announcements/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-announcements'] });
      toast.success('Announcement deleted');
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const payload = {
      title: formData.get('title'),
      content: formData.get('content'),
      priority: formData.get('priority'),
      targetType,
      targetHospitals: targetType === 'specific' ? selectedHospitals : []
    };

    if (targetType === 'specific' && selectedHospitals.length === 0) {
      return toast.error('Please select at least one hospital');
    }

    createMutation.mutate(payload);
  };

  const toggleHospital = (id: string) => {
    setSelectedHospitals(prev => 
      prev.includes(id) ? prev.filter(h => h !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-medical-navy mb-1">Global Announcements</h1>
          <p className="text-slate-500 text-sm">Broadcast critical updates and system alerts to all hospital users.</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-medical-blue hover:bg-medical-blue/90 text-white rounded-xl gap-2 h-11 px-6 shadow-lg shadow-medical-blue/20"
        >
          <Plus size={18} /> New Broadcast
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="p-12 text-center animate-pulse text-medical-navy font-bold">Retrieving broadcast history...</div>
        ) : announcements?.length === 0 ? (
          <Card className="p-20 text-center border-dashed border-2 bg-slate-50/50">
             <Megaphone size={48} className="mx-auto mb-4 text-slate-200" />
             <h3 className="text-lg font-bold text-medical-navy">No Active Announcements</h3>
             <p className="text-slate-500 text-sm max-w-xs mx-auto mt-1">Start by creating a system-wide broadcast to inform users about maintenance or updates.</p>
          </Card>
        ) : (
          announcements?.map((ann: any) => (
            <Card key={ann._id} className="border-none shadow-sm group hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="flex gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${
                    ann.priority === 'critical' ? 'bg-red-50 text-red-600' : 
                    ann.priority === 'high' ? 'bg-orange-50 text-orange-600' :
                    'bg-blue-50 text-medical-blue'
                  }`}>
                    <Megaphone size={28} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xl font-bold text-medical-navy leading-tight">{ann.title}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <Calendar size={12} /> {new Date(ann.createdAt).toLocaleString()}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            ann.priority === 'critical' ? 'bg-red-100 text-red-700' : 
                            ann.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {ann.priority} Priority
                          </span>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => deleteMutation.mutate(ann._id)}
                        className="h-9 w-9 text-slate-300 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all rounded-full"
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                    <p className="text-sm text-slate-600 mt-4 leading-relaxed whitespace-pre-wrap">{ann.content}</p>
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-2">
                          {ann.targetType === 'all' ? <Users size={12} /> : <Target size={12} />}
                          Target: {ann.targetType === 'all' ? 'All Facilities' : `${ann.targetHospitals?.length} Facilities`}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 uppercase tracking-widest">
                          <ShieldCheck size={12} /> Super Admin Verified
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl bg-white rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-8 bg-medical-navy text-white relative">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                <Megaphone size={24} />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold">New Platform Broadcast</DialogTitle>
                <p className="text-white/60 text-sm">Send urgent updates to hospital administrators.</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-white/40 hover:text-white hover:bg-white/10 rounded-full"
            >
              <X size={20} />
            </Button>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Announcement Title</label>
                <input 
                  name="title"
                  required
                  placeholder="e.g., Scheduled System Maintenance"
                  className="w-full px-4 py-3 rounded-xl border border-slate-100 focus:border-medical-blue focus:ring-4 focus:ring-medical-blue/5 outline-none transition-all font-medium text-medical-navy placeholder:text-slate-300"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Broadcast Content</label>
                <textarea 
                  name="content"
                  required
                  rows={4}
                  placeholder="Write the details of your announcement here..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-100 focus:border-medical-blue focus:ring-4 focus:ring-medical-blue/5 outline-none transition-all font-medium text-medical-navy placeholder:text-slate-300 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Priority Level</label>
                  <select 
                    name="priority"
                    className="w-full px-4 py-3 rounded-xl border border-slate-100 focus:border-medical-blue focus:ring-4 focus:ring-medical-blue/5 outline-none transition-all font-medium text-medical-navy appearance-none"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="critical">Critical (Red Alert)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Recipient Target</label>
                  <div className="flex bg-slate-50 p-1 rounded-xl">
                    <button 
                      type="button"
                      onClick={() => setTargetType('all')}
                      className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${targetType === 'all' ? 'bg-white text-medical-navy shadow-sm' : 'text-slate-400'}`}
                    >
                      All Hospitals
                    </button>
                    <button 
                      type="button"
                      onClick={() => setTargetType('specific')}
                      className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${targetType === 'specific' ? 'bg-white text-medical-navy shadow-sm' : 'text-slate-400'}`}
                    >
                      Selected
                    </button>
                  </div>
                </div>
              </div>

              {targetType === 'specific' && (
                <div className="p-4 bg-slate-50 rounded-2xl space-y-3 animate-in fade-in slide-in-from-top-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Facilities ({selectedHospitals.length})</p>
                  <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                    {hospitals?.map((h: any) => (
                      <button
                        key={h._id}
                        type="button"
                        onClick={() => toggleHospital(h._id)}
                        className={`flex items-center justify-between p-2.5 rounded-lg border text-left transition-all ${
                          selectedHospitals.includes(h._id) 
                            ? 'bg-medical-blue/5 border-medical-blue text-medical-blue' 
                            : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200'
                        }`}
                      >
                        <span className="text-[10px] font-bold truncate">{h.name}</span>
                        {selectedHospitals.includes(h._id) && <ShieldCheck size={12} />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-2">
              <Button 
                type="button"
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 h-12 rounded-xl font-bold text-slate-400 hover:text-slate-600"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1 h-12 rounded-xl font-bold bg-medical-blue hover:bg-medical-blue/90 text-white gap-2 shadow-lg shadow-medical-blue/20"
              >
                {createMutation.isPending ? 'Sending...' : (
                  <>
                    <Send size={18} /> Broadcast Now
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
