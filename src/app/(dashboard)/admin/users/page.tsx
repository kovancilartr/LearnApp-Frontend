"use client";

import { RoleGuard } from "@/components/auth";
import { UserManagement } from "@/components/admin/users/UserManagement";

export default function AdminUsersPage() {
  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <UserManagement />
    </RoleGuard>
  );
}
