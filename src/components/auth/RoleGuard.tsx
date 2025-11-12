'use client';

import { useAuth } from '@/hooks';
import { User } from '@/types';
import { Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: User['role'][];
  fallback?: React.ReactNode;
  showFallback?: boolean;
}

export function RoleGuard({ 
  children, 
  allowedRoles, 
  fallback,
  showFallback = true 
}: RoleGuardProps) {
  const { user, isAuthenticated, isLoading, isInitialized } = useAuth();

  // Show loading state
  if (!isInitialized || isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // User not authenticated
  if (!isAuthenticated || !user) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (!showFallback) {
      return null;
    }

    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <CardTitle className="text-xl text-gray-700">
              Authentication Required
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Please log in to access this content.
            </p>
            <Link href="/login">
              <Button className="w-full">
                Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User doesn't have required role
  if (!allowedRoles.includes(user.role)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (!showFallback) {
      return null;
    }

    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-orange-400 mx-auto mb-4" />
            <CardTitle className="text-xl text-gray-700">
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              You don't have permission to access this content.
            </p>
            <div className="text-sm text-gray-500">
              <p>Your role: <span className="font-medium">{user.role}</span></p>
              <p>Required roles: <span className="font-medium">{allowedRoles.join(', ')}</span></p>
            </div>
            <Link href={`/dashboard/${user.role.toLowerCase()}`}>
              <Button variant="outline" className="w-full">
                Go to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}