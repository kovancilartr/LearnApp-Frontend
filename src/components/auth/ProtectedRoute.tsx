'use client';

import { ReactNode } from 'react';
import { AuthGuard } from './AuthGuard';
import { RoleGuard } from './RoleGuard';
import { User } from '@/types';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: User['role'][];
  requireAuth?: boolean;
  fallback?: ReactNode;
  showFallback?: boolean;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  requireAuth = true,
  fallback,
  showFallback = true,
}: ProtectedRouteProps) {
  return (
    <AuthGuard requireAuth={requireAuth}>
      {allowedRoles ? (
        <RoleGuard 
          allowedRoles={allowedRoles} 
          fallback={fallback}
          showFallback={showFallback}
        >
          {children}
        </RoleGuard>
      ) : (
        children
      )}
    </AuthGuard>
  );
}