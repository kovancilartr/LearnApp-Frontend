"use client";

import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Menu,
  List,
  Palette,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LessonFocusModeSelector } from "@/components/lesson/LessonFocusModeSelector";

interface Lesson {
  id: string;
  title: string;
  content?: string;
  videoUrl?: string;
  pdfUrl?: string;
  order: number;
  sectionId: string;
}

interface Section {
  id: string;
  title: string;
  order: number;
  courseId: string;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  sections: Section[];
}

interface LessonHeaderProps {
  course: Course;
  currentLessonIndex: number;
  allLessons: Lesson[];
  currentSection?: Section;
  previousLesson?: Lesson | null;
  nextLesson?: Lesson | null;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  currentLessonId?: string;
}

export function LessonHeader({
  course,
  currentLessonIndex,
  allLessons,
  currentSection,
  previousLesson,
  nextLesson,
  isSidebarOpen,
  onToggleSidebar,
  currentLessonId,
}: LessonHeaderProps) {
  return (
    <div
      className={cn(
        "bg-card border-b border-border transition-all duration-300",
        isSidebarOpen ? "lg:ml-80" : ""
      )}
    >
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Side - Course Info */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg border border-border hover:bg-muted/50 transition-colors"
          >
            <Menu className="h-4 w-4" />
          </Button>

          <Button asChild variant="ghost" size="sm">
            <Link href={`/student/courses/${course.id}`}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Geri
            </Link>
          </Button>

          <div className="h-6 w-px bg-border" />

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">{course.title}</h1>
              <p className="text-muted-foreground text-sm">
                {currentLessonIndex + 1} / {allLessons.length} •{" "}
                {currentSection?.title}
              </p>
            </div>
          </div>
        </div>

        {/* Center - Lesson Navigation */}
        <div className="hidden md:flex items-center gap-2">
          {previousLesson && (
            <Button asChild variant="ghost" size="sm">
              <Link
                href={`/student/courses/${course.id}/lessons/${previousLesson.id}`}
              >
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </Button>
          )}

          <div className="text-muted-foreground text-sm px-3">
            {currentLessonIndex + 1} / {allLessons.length}
          </div>

          {nextLesson && (
            <Button asChild variant="ghost" size="sm">
              <Link
                href={`/student/courses/${course.id}/lessons/${nextLesson.id}`}
              >
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center gap-3">
          <LessonFocusModeSelector
            variant="ghost"
            size="sm"
            className="items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted/50 transition-colors"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted/50 transition-colors"
          >
            <List className="h-4 w-4" />
            <span className="font-medium">İçerik</span>
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-6 pb-4">
        <div className="w-full bg-secondary rounded-full h-1">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-1 rounded-full transition-all duration-500"
            style={{
              width: `${
                allLessons.length > 0
                  ? ((currentLessonIndex + 1) / allLessons.length) * 100
                  : 0
              }%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
