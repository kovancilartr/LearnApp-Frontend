"use client";

import { RoleGuard } from "@/components/auth";
import { CourseManagement } from "@/components/admin/courses";

export default function AdminCoursesPage() {
  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <CourseManagement />
    </RoleGuard>
  );
}
