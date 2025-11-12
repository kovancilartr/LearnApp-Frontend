"use client";

import { Button } from "@/components/ui/button";
import { LessonProgressIndicator } from "@/components/progress/LessonCompletionToggle";
import { useProgressStore } from "@/store/progressStore";
import { BookOpen, X } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface LessonSidebarProps {
  course: Course;
  currentLessonId: string;
  currentLessonIndex: number;
  allLessons: Lesson[];
  isOpen: boolean;
  onClose: () => void;
}

export function LessonSidebar({
  course,
  currentLessonId,
  currentLessonIndex,
  allLessons,
  isOpen,
  onClose,
}: LessonSidebarProps) {
  // Use selector to get course progress - this will trigger re-render when it changes
  const courseProgress = useProgressStore(
    (state) => state.courseProgresses[course.id] || null
  );
  return (
    <>
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-80 bg-card border-r border-border transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Kurs İçeriği</h3>
                <p className="text-xs text-muted-foreground">
                  {currentLessonIndex + 1} / {allLessons.length} ders
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Course Progress */}
          <div className="p-4 border-b border-border">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>İlerleme</span>
                <span className="font-medium">
                  {courseProgress?.progressPercentage || 0}%
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${courseProgress?.progressPercentage || 0}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Lessons List */}
          <div className="flex-1 overflow-y-auto">
            {course.sections.map((section, sectionIndex) => (
              <div
                key={section.id}
                className="border-b border-border last:border-b-0"
              >
                <div className="p-4 bg-muted/50">
                  <h4 className="font-medium text-sm">
                    {sectionIndex + 1}. {section.title}
                  </h4>
                </div>
                <div className="space-y-1">
                  {section.lessons.map((lesson, lessonIndex) => {
                    const isCurrentLesson = lesson.id === currentLessonId;

                    return (
                      <div
                        key={lesson.id}
                        className="border-b border-border/50 last:border-b-0"
                      >
                        <LessonProgressIndicator
                          lesson={lesson}
                          lessonId={lesson.id}
                          courseId={course.id}
                          lessonTitle={lesson.title}
                          isActive={isCurrentLesson}
                          onClick={() => {
                            // Navigate to lesson
                            window.location.href = `/student/courses/${course.id}/lessons/${lesson.id}`;
                            // Only close on mobile
                            if (window.innerWidth < 1024) {
                              onClose();
                            }
                          }}
                          showToggle={true}
                        />

                        {/* Lesson Type Indicators */}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
}
