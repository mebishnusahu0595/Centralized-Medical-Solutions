'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4",
      scrolled ? "bg-white/80 backdrop-blur-md shadow-sm" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <img src="/images/image.png" alt="CMS Logo" className="h-10 w-auto" />
          <span className="font-heading text-xl font-extrabold tracking-tighter text-medical-navy hidden sm:block">
            Centralized Medical Solutions
          </span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm font-medium hover:text-medical-blue transition-colors">Features</Link>
          <Link href="#how-it-works" className="text-sm font-medium hover:text-medical-blue transition-colors">How It Works</Link>
          <Link href="#pricing" className="text-sm font-medium hover:text-medical-blue transition-colors">Pricing</Link>
          <Link href="#contact" className="text-sm font-medium hover:text-medical-blue transition-colors">Contact</Link>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link href={user?.role === 'super_admin' ? '/super/dashboard' : '/dashboard'}>
              <Button variant="ghost" className="text-sm font-bold text-medical-blue hover:bg-medical-blue/5">Dashboard</Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button variant="ghost" className="text-sm font-medium">Log In</Button>
            </Link>
          )}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-medical-blue hover:bg-medical-blue/90 text-white rounded-full px-6 font-bold shadow-lg shadow-medical-blue/20">
                Request a Demo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none">
              <div className="bg-medical-navy p-8 text-white">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-white">Request a Personalized Demo</DialogTitle>
                </DialogHeader>
                <p className="text-slate-400 text-sm mt-2">See how CMS can transform your facility's operations.</p>
              </div>
              <div className="p-8">
                <form className="space-y-4" onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  const data = Object.fromEntries(formData.entries());
                  try {
                    const api = (await import("@/lib/axios")).default;
                    const toast = (await import("react-hot-toast")).default;
                    await api.post('/leads', data);
                    toast.success("Demo request sent! We'll contact you soon.");
                    (e.target as HTMLFormElement).reset();
                  } catch (err: any) {
                    const toast = (await import("react-hot-toast")).default;
                    toast.error("Failed to send request.");
                  }
                }}>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input name="name" placeholder="Full Name" required className="rounded-xl h-11" />
                    <Input name="hospitalName" placeholder="Hospital Name" required className="rounded-xl h-11" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input name="phone" placeholder="Phone Number" required className="rounded-xl h-11" />
                    <Input name="email" type="email" placeholder="Work Email" required className="rounded-xl h-11" />
                  </div>
                  <Textarea name="message" placeholder="Message" className="rounded-xl min-h-[100px]" />
                  <Button type="submit" className="w-full bg-medical-blue hover:bg-medical-blue/90 text-white rounded-xl h-12 font-bold">
                    Submit Request
                  </Button>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </nav>
  );
}
