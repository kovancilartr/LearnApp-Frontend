"use client";

import { ProtectedRoute } from "@/components/auth";

export default function LessonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requireAuth={true}>
      <div className="min-h-screen bg-background">{children}</div>
    </ProtectedRoute>
  );
}