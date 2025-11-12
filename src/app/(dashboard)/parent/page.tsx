'use client';

import { RoleGuard } from '@/components/auth';
import { ParentDashboard } from '@/components/dashboard';

export default function ParentDashboardPage() {
  return (
    <RoleGuard allowedRoles={['PARENT']}>
      <ParentDashboard />
    </RoleGuard>
  );
}