"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useGlobalProgress } from "@/hooks/useGlobalProgress";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  BookOpen,
  X,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { LessonData } from "@/hooks/useLessonData";
import { LessonFocusModeSelector } from "./LessonFocusModeSelector";
import { LessonVideoPlayer } from "../course/LessonVideoPlayer";

interface ModernLessonViewProps {
  lessonData: LessonData;
  courseId: string;
  lessonId: string;
}

export function ModernLessonView({
  lessonData,
  courseId,
  lessonId,
}: ModernLessonViewProps) {
  const router = useRouter();
  const [showSidebar, setShowSidebar] = useState(true);
  const { getCourseProgressPercentage } = useGlobalProgress();

  const { course, lesson, isCompleted, isMarkingComplete, handleMarkComplete } =
    lessonData;

  const courseProgress = getCourseProgressPercentage(courseId);

  const getNextLesson = (): any => {
    if (!course?.sections) return null;

    let foundCurrent = false;
    for (const section of course.sections) {
      for (const sectionLesson of section.lessons || []) {
        if (foundCurrent) {
          return sectionLesson;
        }
        if (sectionLesson.id === lessonId) {
          foundCurrent = true;
        }
      }
    }
    return null;
  };

  const getPreviousLesson = (): any => {
    if (!course?.sections) return null;

    let previousLesson: unknown = null;
    for (const section of course.sections) {
      for (const sectionLesson of section.lessons || []) {
        if (sectionLesson.id === lessonId) {
          return previousLesson;
        }
        previousLesson = sectionLesson;
      }
    }
    return null;
  };

  const nextLessonComputed = getNextLesson();
  const previousLessonComputed = getPreviousLesson();

  if (!lesson || !course) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Ders Bulunamadı</h2>
          <Button asChild variant="outline">
            <Link href={`/student/courses/${courseId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kursa Dön
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-black text-white">
      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300`}>
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/student/courses/${courseId}`)}
              className="text-white hover:text-black hover:bg-gray-200"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">{lesson.title}</h1>
              <p className="text-sm text-gray-400">{course.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-400 cursor-default">
              İlerleme: %{courseProgress}
            </div>
            <LessonFocusModeSelector
              variant="ghost"
              size="sm"
              className="text-white hover:bg-gray-300"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSidebar(!showSidebar)}
              className="text-white hover:bg-gray-300"
            >
              <BookOpen className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Video/Content Area */}
        <div className="flex-1 flex items-center justify-center bg-black p-6 min-h-0">
          {lesson.videoUrl ? (
            <div className="w-full max-w-6xl">
              <LessonVideoPlayer videoUrl={lesson.videoUrl} />
            </div>
          ) : (
            <div className="text-center text-white">
              <div className="text-6xl mb-4">📹</div>
              <h3 className="text-xl font-semibold mb-2">Video Bulunamadı</h3>
              <p className="text-gray-400">
                Bu ders için henüz video eklenmemiş.
              </p>
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {previousLessonComputed && (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="text-black"
                >
                  <Link
                    href={`/student/courses/${courseId}/lessons/${previousLessonComputed.id}`}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Önceki Ders
                  </Link>
                </Button>
              )}
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={() => handleMarkComplete(lessonId)}
                variant={"default"}
                size="sm"
                disabled={isMarkingComplete}
                className={
                  isCompleted
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-green-600 hover:bg-green-700 text-black"
                }
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {isMarkingComplete
                  ? "Güncelleniyor..."
                  : isCompleted
                  ? "Tamamlandı ✓"
                  : "Tamamlandı Olarak İşaretle"}
              </Button>

              {nextLessonComputed && (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="text-black"
                >
                  <Link
                    href={`/student/courses/${courseId}/lessons/${nextLessonComputed.id}`}
                  >
                    Sonraki Ders
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      {showSidebar && (
        <div className="w-80 bg-gray-900 border-l border-gray-700 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Kurs İçeriği</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(false)}
                className="text-gray-400 hover:text-black"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {course.sections?.map((section, sectionIndex) => (
                <div key={section.id}>
                  <h4 className="font-medium text-gray-300 mb-2">
                    {sectionIndex + 1}. {section.title}
                  </h4>
                  <div className="space-y-1">
                    {section.lessons?.map((sectionLesson, lessonIndex) => {
                      const isCurrentLesson = sectionLesson.id === lessonId;
                      const isLessonCompleted =
                        lessonData.isCompleted && sectionLesson.id === lessonId;

                      return (
                        <Link
                          key={sectionLesson.id}
                          href={`/student/courses/${courseId}/lessons/${sectionLesson.id}`}
                          className={`block p-2 rounded text-sm transition-colors ${
                            isCurrentLesson
                              ? "bg-blue-600 text-white"
                              : "text-gray-400 hover:text-white hover:bg-gray-800"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex-shrink-0">
                              {isLessonCompleted ? (
                                <CheckCircle className="h-4 w-4 text-green-400" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border border-gray-600" />
                              )}
                            </div>
                            <span className="truncate">
                              {sectionIndex + 1}.{lessonIndex + 1}{" "}
                              {sectionLesson.title}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
