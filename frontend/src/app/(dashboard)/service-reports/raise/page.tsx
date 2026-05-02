'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  AlertTriangle, 
  Search, 
  Stethoscope, 
  MapPin, 
  Send,
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function RaiseIssuePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null);
  const [formData, setFormData] = useState({
    issueDescription: '',
    priority: 'medium',
    location: ''
  });

  const { data: equipmentList, isLoading } = useQuery({
    queryKey: ['equipment-search', searchTerm],
    queryFn: async () => {
      if (searchTerm.length < 2) return [];
      const res = await api.get('/equipment', { params: { search: searchTerm } });
      return res.data.data;
    },
    enabled: searchTerm.length >= 2
  });

  const raiseMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/service-reports', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Service report raised successfully. Super Admin notified.');
      queryClient.invalidateQueries({ queryKey: ['service-reports'] });
      router.push('/service-reports');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to raise report');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipment) return toast.error('Please select an equipment first');
    
    raiseMutation.mutate({
      equipmentId: selectedEquipment._id,
      ...formData
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/service-reports">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-black text-medical-navy tracking-tight">Raise Service Issue</h1>
          <p className="text-slate-500 text-sm">Report technical problems or breakdown of medical equipment.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-sm overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-medical-navy">1. Select Equipment</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input 
                  placeholder="Search by equipment name or code..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all"
                />
              </div>

              {isLoading && <div className="text-center py-4 text-xs text-slate-400 animate-pulse">Searching registry...</div>}

              {equipmentList && equipmentList.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {equipmentList.map((item: any) => (
                    <button
                      key={item._id}
                      onClick={() => {
                        setSelectedEquipment(item);
                        setFormData(prev => ({ ...prev, location: item.location?.ward || item.location?.room || '' }));
                        setSearchTerm('');
                      }}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
                        selectedEquipment?._id === item._id 
                          ? 'border-medical-blue bg-medical-blue/5 ring-1 ring-medical-blue' 
                          : 'border-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-medical-blue">
                          <Stethoscope size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-medical-navy">{item.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{item.equipmentCode}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${
                          item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {selectedEquipment && (
                <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="text-green-600" size={20} />
                    <div>
                      <p className="text-xs font-bold text-green-800">Selected: {selectedEquipment.name}</p>
                      <p className="text-[10px] text-green-600">S/N: {selectedEquipment.serialNumber || 'N/A'}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedEquipment(null)} className="text-green-700 font-bold text-[10px]">Change</Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-medical-navy">2. Issue Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Describe the problem</label>
                <textarea 
                  name="issueDescription"
                  value={formData.issueDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, issueDescription: e.target.value }))}
                  placeholder="Example: Machine is showing error code E-24 and heating up after 10 mins of use..."
                  className="w-full min-h-[120px] p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-medical-blue/20 transition-all resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Priority Level</label>
                  <select 
                    name="priority"
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:bg-white transition-all appearance-none cursor-pointer"
                  >
                    <option value="low">Low - General maintenance</option>
                    <option value="medium">Medium - Functional but impaired</option>
                    <option value="high">High - Impacting patient care</option>
                    <option value="critical">Critical - Complete breakdown</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Exact Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <Input 
                      name="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g. Ward 3, 2nd Floor" 
                      className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-100"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button 
            onClick={handleSubmit}
            disabled={raiseMutation.isPending || !selectedEquipment || !formData.issueDescription}
            className="w-full bg-medical-navy hover:bg-medical-navy/90 text-white font-bold h-14 rounded-2xl shadow-xl shadow-medical-navy/20 flex items-center justify-center gap-3 transition-all"
          >
            {raiseMutation.isPending ? 'Submitting Report...' : <><Send size={20} /> Submit Service Report</>}
          </Button>
        </div>

        <div className="space-y-6">
          <Card className="bg-medical-navy text-white overflow-hidden relative border-none shadow-sm">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <AlertTriangle size={80} />
            </div>
            <CardHeader>
              <CardTitle className="text-white text-sm">Emergency Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-400 leading-relaxed">
                If this is a life-critical equipment failure requiring immediate assistance, please call our 24/7 technical hotline after submitting the report.
              </p>
              <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-xl text-center">
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Direct Line</p>
                <p className="text-lg font-black text-medical-blue">+91 1800-CMS-HELP</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-amber-50 border-l-4 border-l-amber-500">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertCircle size={18} />
                <CardTitle className="text-sm font-bold">Reporting Guidelines</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="text-[11px] text-amber-700 space-y-2 list-disc pl-4 font-medium leading-relaxed">
                <li>Include specific error codes if displayed on the screen.</li>
                <li>Critical priority will automatically mark the asset as "Out of Service".</li>
                <li>Photos can be attached after the report is created in the details view.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
