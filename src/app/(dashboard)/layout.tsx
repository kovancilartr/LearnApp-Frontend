"use client";

import { ProtectedRoute } from "@/components/auth";
import { Navigation } from "@/components/layout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requireAuth={true}>
      <Navigation>{children}</Navigation>
    </ProtectedRoute>
  );
}
