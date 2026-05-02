'use client';

import { useUIStore } from '@/store/uiStore';
import PageLoader from '@/components/ui/PageLoader';
import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function UIProvider({ children }: { children: React.ReactNode }) {
  const isLoading = useUIStore((state) => state.isLoading);
  const setIsLoading = useUIStore((state) => state.setIsLoading);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Show loader on route changes
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [pathname, searchParams, setIsLoading]);

  return (
    <>
      {isLoading && <PageLoader />}
      {children}
    </>
  );
}
