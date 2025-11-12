"use client";

import { useParams } from "next/navigation";
import { RoleGuard } from "@/components/auth";
import { Loader2 } from "lucide-react";
import { useLessonData } from "@/hooks/useLessonData";
import { ClassicLessonView } from "@/components/lesson/ClassicLessonView";

export default function StudentLessonPage() {
  const params = useParams();
  const courseId = params.id as string;
  const lessonId = params.lessonId as string;

  // Get lesson data using the shared hook
  const lessonData = useLessonData(courseId, lessonId);

  if (lessonData.isLoading) {
    return (
      <RoleGuard allowedRoles={["STUDENT"]}>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Kurs yükleniyor...</p>
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={["STUDENT"]}>
      <ClassicLessonView 
        lessonData={lessonData} 
        courseId={courseId} 
        lessonId={lessonId} 
      />
    </RoleGuard>
  );
}
