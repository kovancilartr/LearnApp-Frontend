'use client';

import { useAuth } from '@/hooks';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function AuthGuard({ 
  children, 
  requireAuth = true, 
  redirectTo 
}: AuthGuardProps) {
  const { isAuthenticated, isLoading, isInitialized, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isInitialized || isLoading) return;

    if (requireAuth && !isAuthenticated) {
      // Store the intended destination for redirect after login
      const returnUrl = pathname !== '/login' && pathname !== '/register' ? pathname : '/';
      try {
        sessionStorage.setItem('returnUrl', returnUrl);
      } catch (error) {
        // Ignore sessionStorage errors in SSR
      }
      router.push(redirectTo || '/login');
    } else if (!requireAuth && isAuthenticated) {
      // Check if there's a return URL stored
      let returnUrl = null;
      try {
        returnUrl = sessionStorage.getItem('returnUrl');
      } catch (error) {
        // Ignore sessionStorage errors in SSR
      }
      
      if (returnUrl) {
        try {
          sessionStorage.removeItem('returnUrl');
        } catch (error) {
          // Ignore sessionStorage errors in SSR
        }
        router.push(returnUrl);
      } else if (user) {
        // Redirect to appropriate dashboard based on role
        router.push(`/${user.role.toLowerCase()}`);
      } else {
        router.push('/');
      }
    }
  }, [isAuthenticated, isInitialized, isLoading, requireAuth, redirectTo, router, pathname, user]);

  // Show loading spinner while auth state is being determined
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if auth requirements aren't met
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (!requireAuth && isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}