"use client";

import { useParams } from "next/navigation";
import { RoleGuard } from "@/components/auth";
import { Loader2 } from "lucide-react";
import { useLessonData } from "@/hooks/useLessonData";
import { useLessonFocusStore } from "@/store/lessonFocusStore";
import { ModernLessonView } from "@/components/lesson/ModernLessonView";
import { ClassicLessonView } from "@/components/lesson/ClassicLessonView";

export default function LessonPage() {
  const params = useParams();
  const courseId = params.id as string;
  const lessonId = params.lessonId as string;

  // Get lesson data using the shared hook
  const lessonData = useLessonData(courseId, lessonId);

  console.log("lessonData", lessonData);

  // Get current focus mode
  const { getCurrentMode, adminDefaultMode } = useLessonFocusStore();
  const currentMode = getCurrentMode();

  if (lessonData.isLoading) {
    return (
      <RoleGuard allowedRoles={["STUDENT"]}>
        <div className="flex items-center justify-center h-screen bg-black text-white">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
            <div className="text-lg">Ders yükleniyor...</div>
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={["STUDENT"]}>
      {currentMode === "classic" ? (
        <ClassicLessonView
          lessonData={lessonData}
          courseId={courseId}
          lessonId={lessonId}
        />
      ) : currentMode === "modern" ? (
        <ModernLessonView
          lessonData={lessonData}
          courseId={courseId}
          lessonId={lessonId}
        />
      ) : currentMode === "auto" && adminDefaultMode === "classic" ? (
        <ClassicLessonView
          lessonData={lessonData}
          courseId={courseId}
          lessonId={lessonId}
        />
      ) : adminDefaultMode === "modern" ? (
        <ModernLessonView
          lessonData={lessonData}
          courseId={courseId}
          lessonId={lessonId}
        />
      ) : null}
    </RoleGuard>
  );
}
