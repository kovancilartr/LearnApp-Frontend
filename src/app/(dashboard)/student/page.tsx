'use client';

import { RoleGuard } from '@/components/auth';
import { StudentDashboard } from '@/components/dashboard';

export default function StudentDashboardPage() {
  return (
    <RoleGuard allowedRoles={['STUDENT']}>
      <StudentDashboard />
    </RoleGuard>
  );
}