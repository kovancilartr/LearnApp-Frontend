'use client';

import { RoleGuard } from '@/components/auth';
import { AdminDashboard } from '@/components/dashboard';

export default function AdminDashboardPage() {
  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <AdminDashboard />
    </RoleGuard>
  );
}