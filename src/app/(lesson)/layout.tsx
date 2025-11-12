"use client";

import { ReactNode } from "react";

interface LessonLayoutProps {
  children: ReactNode;
}

export default function LessonLayout({ children }: LessonLayoutProps) {
  return (
    <div className="min-h-screen bg-black">
      {/* Tam ekran lesson/video deneyimi için minimal layout */}
      <main className="h-screen overflow-hidden">
        {children}
      </main>
    </div>
  );
}