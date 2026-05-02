'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Shield, Smartphone, Globe, Cloud } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-medical-navy mb-1">System Settings</h1>
        <p className="text-slate-500 text-sm">Configure your preferences and notification rules.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell size={18} className="text-medical-blue" /> Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-slate-100">
            <div className="py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-medical-navy">Maintenance Alerts</p>
                <p className="text-xs text-slate-500">Receive notifications when equipment is due for service.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-medical-navy">SLA Breaches</p>
                <p className="text-xs text-slate-500">Immediate alerts for high-priority service report delays.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-medical-navy">Email Reports</p>
                <p className="text-xs text-slate-500">Weekly maintenance and compliance summary via email.</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield size={18} className="text-medical-blue" /> Security & Access
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-slate-100">
            <div className="py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-medical-navy">Two-Factor Authentication</p>
                <p className="text-xs text-slate-500">Add an extra layer of security to your login.</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl">Setup 2FA</Button>
            </div>
            <div className="py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-medical-navy">Session Management</p>
                <p className="text-xs text-slate-500">View and manage your active sessions on other devices.</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl">Manage Sessions</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
