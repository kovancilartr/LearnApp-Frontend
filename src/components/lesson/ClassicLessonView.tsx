"use client";

import { useState } from "react";
import { LessonSidebar } from "@/components/course/LessonSidebar";
import { LessonHeader } from "@/components/course/LessonHeader";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LessonData } from "@/hooks/useLessonData";
import { LessonVideoContent } from "../course/LessonVideoContent";

interface ClassicLessonViewProps {
  lessonData: LessonData;
  courseId: string;
  lessonId: string;
}

// Local Course interface that matches LessonSidebar expectations
interface Course {
  id: string;
  title: string;
  sections: Array<{
    id: string;
    title: string;
    order: number;
    courseId: string;
    lessons: Array<{
      id: string;
      title: string;
      content?: string;
      videoUrl?: string;
      pdfUrl?: string;
      order: number;
      sectionId: string;
    }>;
  }>;
}

export function ClassicLessonView({
  lessonData,
  courseId,
  lessonId,
}: ClassicLessonViewProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const {
    course,
    lesson,
    allLessons,
    currentLessonIndex,
    previousLesson,
    nextLesson,
    currentSection,
    isCompleted,
    isMarkingComplete,
    handleMarkComplete,
  } = lessonData;

  if (!course || !lesson) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Ders Bulunamadı</h2>
          <p className="text-muted-foreground mb-4">
            Aradığınız ders mevcut değil veya erişim izniniz bulunmuyor.
          </p>
          <Button asChild>
            <Link href={`/student/courses/${courseId}`}>Kursa Geri Dön</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Lesson Sidebar */}
      <LessonSidebar
        course={course as Course}
        currentLessonId={lessonId}
        currentLessonIndex={currentLessonIndex}
        allLessons={allLessons}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Lesson Header */}
      <LessonHeader
        course={course as Course}
        currentLessonIndex={currentLessonIndex}
        allLessons={allLessons}
        currentSection={currentSection || undefined}
        previousLesson={previousLesson}
        nextLesson={nextLesson}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        currentLessonId={lessonId}
      />

      {/* Main Content */}
      <div
        className={cn(
          "transition-all duration-300",
          isSidebarOpen ? "lg:ml-80" : ""
        )}
      >
        <LessonVideoContent
          lesson={lesson}
          isCompleted={isCompleted}
          onMarkComplete={handleMarkComplete}
          isMarkingComplete={isMarkingComplete}
          courseId={courseId}
        />
      </div>
    </div>
  );
}
