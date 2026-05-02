'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { 
  Bell, 
  Megaphone, 
  AlertCircle, 
  Info, 
  CheckCircle2, 
  X,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useRef } from 'react';

export default function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any | null>(null);
  const queryClient = useQueryClient();
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [panelRef]);

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications');
      return res.data.data;
    },
    refetchInterval: 30000 // Poll every 30s
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification removed');
    }
  });

  const unreadCount = notifications?.filter((n: any) => !n.isRead).length || 0;

  const handleNotificationClick = (notif: any) => {
    if (!notif.isRead) {
      markAsReadMutation.mutate(notif._id);
    }
    setSelectedNotification(notif);
    setIsOpen(false);
  };

  const getIcon = (type: string, priority: string) => {
    if (type === 'announcement') return <Megaphone className="text-medical-blue" size={16} />;
    if (priority === 'critical' || priority === 'high') return <AlertCircle className="text-red-500" size={16} />;
    if (priority === 'medium') return <Info className="text-blue-500" size={16} />;
    return <CheckCircle2 className="text-green-500" size={16} />;
  };

  return (
    <div className="relative" ref={panelRef}>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setIsOpen(!isOpen)}
        className={`relative text-slate-500 hover:text-medical-blue hover:bg-medical-blue/5 ${isOpen ? 'bg-medical-blue/5 text-medical-blue' : ''}`}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full border-2 border-white text-[8px] text-white flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-100 shadow-2xl rounded-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 bg-medical-navy text-white flex items-center justify-between">
            <h3 className="text-sm font-bold">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                {unreadCount} New
              </span>
            )}
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-slate-400 animate-pulse">Loading updates...</div>
            ) : notifications?.length === 0 ? (
              <div className="p-12 text-center">
                 <Bell size={32} className="mx-auto mb-2 text-slate-100" />
                 <p className="text-xs text-slate-400">All caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {notifications?.map((notif: any) => (
                  <div 
                    key={notif._id} 
                    className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors relative group ${!notif.isRead ? 'bg-blue-50/30' : ''}`}
                    onClick={() => handleNotificationClick(notif)}
                  >
                    {!notif.isRead && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-medical-blue" />
                    )}
                    <div className="flex gap-3">
                      <div className="mt-0.5 shrink-0">
                        {getIcon(notif.type, notif.priority)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs ${!notif.isRead ? 'font-bold text-medical-navy' : 'text-slate-600'}`}>
                          {notif.title}
                        </p>
                        <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{notif.message}</p>
                        <p className="text-[9px] text-slate-300 mt-2 font-medium">
                          {new Date(notif.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
            <button className="text-[10px] font-bold text-medical-blue hover:underline uppercase tracking-widest">
              View All Notifications
            </button>
          </div>
        </div>
      )}

      {/* Notification Detail Dialog */}
      <Dialog open={!!selectedNotification} onOpenChange={() => setSelectedNotification(null)}>
        <DialogContent className="max-w-md bg-white rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <div className={`p-8 ${
            selectedNotification?.priority === 'critical' ? 'bg-red-600' : 
            selectedNotification?.type === 'announcement' ? 'bg-medical-navy' : 
            'bg-medical-blue'
          } text-white relative`}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                {getIcon(selectedNotification?.type, selectedNotification?.priority)}
              </div>
              <div className="flex-1 pr-8">
                <DialogTitle className="text-xl font-bold leading-tight">{selectedNotification?.title}</DialogTitle>
                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-1">
                  {selectedNotification?.type === 'announcement' ? 'Global Broadcast' : 'System Alert'} • {new Date(selectedNotification?.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSelectedNotification(null)}
              className="absolute top-6 right-6 text-white/40 hover:text-white hover:bg-white/10 rounded-full"
            >
              <X size={20} />
            </Button>
          </div>
          <div className="p-8">
            <div className="prose prose-slate prose-sm max-w-none">
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                {selectedNotification?.message}
              </p>
            </div>
            
            {selectedNotification?.link && (
              <Button 
                className="w-full mt-8 bg-medical-navy hover:bg-medical-navy/90 text-white rounded-xl gap-2"
                onClick={() => {
                  router.push(selectedNotification.link);
                  setSelectedNotification(null);
                }}
              >
                Take Action <ExternalLink size={16} />
              </Button>
            )}

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-50">
              <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest italic">
                {selectedNotification?.priority === 'critical' ? 'Requires Immediate Attention' : 'System Verified Notification'}
              </p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  deleteNotificationMutation.mutate(selectedNotification._id);
                  setSelectedNotification(null);
                }}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 text-[10px] font-bold gap-1"
              >
                <Trash2 size={12} /> Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
