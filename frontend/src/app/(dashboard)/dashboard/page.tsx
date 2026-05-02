'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { 
  Stethoscope, 
  AlertTriangle, 
  CheckCircle2, 
  Wrench,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

export default function HospitalDashboard() {
  const router = useRouter();
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await api.get('/analytics/dashboard');
      return res.data.data;
    }
  });

  if (isLoading) return <div className="animate-pulse">Loading dashboard...</div>;

  const kpis = [
    { 
      label: 'Total Equipment', 
      value: stats?.stats?.totalEquipment || 0, 
      icon: Stethoscope, 
      color: 'bg-blue-50 text-blue-600',
      trend: 'Facility Total',
      trendUp: true
    },
    { 
      label: 'Out of Service', 
      value: stats?.stats?.outOfService || 0, 
      icon: AlertTriangle, 
      color: 'bg-red-50 text-red-600',
      trend: 'Needs Attention',
      trendUp: false
    },
    { 
      label: 'Open Issues', 
      value: stats?.stats?.openReports || 0, 
      icon: Activity, 
      color: 'bg-amber-50 text-amber-600',
      trend: 'Service Reports',
      trendUp: true
    },
    { 
      label: 'Maintenance Due', 
      value: stats?.stats?.maintenanceDue || 0, 
      icon: Wrench, 
      color: 'bg-green-50 text-green-600',
      trend: 'Next 7 days',
      trendUp: true
    }
  ];

  const chartData = stats?.charts?.uptimeTrend || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-medical-navy mb-2">Hospital Command Center</h1>
        <p className="text-slate-500">Real-time overview of your facility's biomedical assets.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${kpi.color} p-3 rounded-xl`}>
                  <kpi.icon size={24} />
                </div>
                <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${kpi.trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                   {kpi.trend}
                </div>
              </div>
              <p className="text-slate-500 text-sm font-medium">{kpi.label}</p>
              <h3 className="text-3xl font-bold text-medical-navy mt-1">{kpi.value}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Equipment Uptime %</CardTitle>
            <CardDescription>Aggregate availability based on real-time compliance and service status.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorUptime" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} domain={[80, 100]} />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                  <Area type="monotone" dataKey="uptime" stroke="#0EA5E9" strokeWidth={3} fillOpacity={1} fill="url(#colorUptime)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Alerts List */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Critical Alerts</CardTitle>
            <CardDescription>High priority service reports requiring immediate attention.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {!stats?.criticalAlerts || stats.criticalAlerts.length === 0 ? (
                <div className="py-12 text-center">
                  <CheckCircle2 className="mx-auto mb-2 text-emerald-100" size={40} />
                  <p className="text-sm text-slate-400">No critical issues reported</p>
                </div>
              ) : (
                stats?.criticalAlerts.map((alert: any) => (
                  <div key={alert._id} className="flex gap-4 group cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <AlertTriangle size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-medical-navy truncate">{alert.title || 'Equipment Breakdown'}</p>
                      <p className="text-[10px] text-slate-400 mb-1 truncate">{alert.description || 'System failure reported'}</p>
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-[4px] text-[8px] font-black bg-red-100 text-red-700 uppercase">
                          CRITICAL
                        </span>
                        <span className="text-[9px] text-slate-300 font-bold uppercase">
                          {new Date(alert.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Button 
              variant="ghost" 
              className="w-full mt-6 text-medical-blue font-bold text-[10px] uppercase tracking-widest hover:bg-medical-blue/5"
              onClick={() => router.push('/service-reports')}
            >
              View All Alerts
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
