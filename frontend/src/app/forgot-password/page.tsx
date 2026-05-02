'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      toast.success("Reset link sent if account exists.");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        <Link href="/" className="flex items-center gap-2 mb-12 justify-center">
          <span className="text-3xl">⚕</span>
          <span className="font-heading text-2xl font-bold tracking-tight text-medical-navy">
            CMS
          </span>
        </Link>

        {!sent ? (
          <>
            <h1 className="text-2xl font-bold text-medical-navy mb-2 text-center">Forgot Password?</h1>
            <p className="text-slate-500 mb-8 text-center text-sm">No worries, it happens. Enter your email and we'll send you a reset link.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-medical-navy">Email Address</label>
                <Input 
                  type="email" 
                  placeholder="name@hospital.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                  className="rounded-xl h-12 border-slate-200"
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-medical-navy hover:bg-medical-navy/90 text-white rounded-xl h-12 text-base font-bold"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">📧</span>
            </div>
            <h2 className="text-2xl font-bold text-medical-navy mb-2">Check your inbox</h2>
            <p className="text-slate-500 mb-8 text-sm">We've sent a password reset link to <br /><span className="font-bold text-slate-700">{email}</span></p>
            <Button 
              variant="outline" 
              onClick={() => setSent(false)}
              className="w-full rounded-xl h-12"
            >
              Didn't receive? Try again
            </Button>
          </div>
        )}

        <div className="mt-8 pt-8 border-t border-slate-100 text-center">
          <Link href="/login" className="text-sm text-medical-blue font-bold hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
