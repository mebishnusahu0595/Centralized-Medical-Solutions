'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=${pathname}`);
    }
  }, [isAuthenticated, router, pathname]);

  if (!isAuthenticated) {
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }

  return <>{children}</>;
}
