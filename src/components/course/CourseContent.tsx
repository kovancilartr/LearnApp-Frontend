import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Award,
  BookOpen,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  Play,
  PlayCircle,
  Users,
} from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { Course } from "@/types";
import CourseNotEnrolledCard from "./CourseNotEnrolledCard";
import CourseProgressOverview from "./CourseProgressOverview";

interface CourseContentProps {
  course: Course;
  courseId: string;
  completedCount: number;
  progressPercentage: number;
  storeTotalLessons: number;
  totalLessons: number;
  getLessonCompletionStatus: (courseId: string, lessonId: string) => boolean;
  isEnrolled: boolean;
  enrollmentRequestStatus: "NONE" | "PENDING" | "APPROVED" | "REJECTED";
  handleEnrollmentRequest: () => void;
  createEnrollmentRequestMutation: {
    isPending: boolean;
  };
}

const CourseContent = ({
  course,
  courseId,
  completedCount,
  progressPercentage,
  storeTotalLessons,
  totalLessons,
  getLessonCompletionStatus,
  isEnrolled,
  enrollmentRequestStatus,
  handleEnrollmentRequest,
  createEnrollmentRequestMutation,
}: CourseContentProps) => {
  // State to track which sections are expanded (all expanded by default)
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >(
    (course as Course).sections?.reduce((acc, section) => {
      acc[section.id] = true; // All sections expanded by default
      return acc;
    }, {} as Record<string, boolean>) || {}
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Sections and Lessons */}
      <div className="lg:col-span-2 space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Kurs İçeriği
        </h2>

        {(course as Course).sections?.map((section, sectionIndex) => {
          const isExpanded = expandedSections[section.id];
          const completedLessonsInSection =
            section.lessons?.filter((lesson) =>
              getLessonCompletionStatus(courseId, lesson.id)
            ).length || 0;
          const totalLessonsInSection = section.lessons?.length || 0;

          return (
            <Card
              key={section.id}
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            >
              <CardHeader
                className="cursor-pointer  transition-colors"
                onClick={() => toggleSection(section.id)}
              >
                <CardTitle className="flex items-center justify-between text-gray-900 dark:text-gray-100">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <span>
                      {sectionIndex + 1}. {section.title}
                    </span>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>
                        ({completedLessonsInSection}/{totalLessonsInSection})
                      </span>
                      {completedLessonsInSection === totalLessonsInSection &&
                        totalLessonsInSection > 0 && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              {isExpanded && (
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {section.lessons?.map((lesson, lessonIndex) => {
                      const isCompleted = getLessonCompletionStatus(
                        courseId,
                        lesson.id
                      );
                      return (
                        <div
                          key={lesson.id}
                          className={`group relative px-4 sm:px-6 py-4 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                            isCompleted ? "bg-green-50/30 dark:bg-gray-800" : ""
                          }`}
                        >
                          <div className="flex items-center gap-2 sm:gap-4">
                            {/* Lesson Number & Status */}
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                              <div className="flex-shrink-0">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                                    isCompleted
                                      ? "bg-green-700 text-white"
                                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 group-hover:bg-purple-100 dark:group-hover:bg-purple-900 group-hover:text-purple-600 dark:group-hover:text-purple-300"
                                  }`}
                                >
                                  {isCompleted ? (
                                    <CheckCircle className="h-4 w-4" />
                                  ) : (
                                    <span>{lessonIndex + 1}</span>
                                  )}
                                </div>
                              </div>

                              {/* Lesson Info */}
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate text-sm sm:text-base">
                                    {lesson.title}
                                  </h4>
                                  {isCompleted && (
                                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                  )}
                                </div>

                                {/* Content Types */}
                                <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                                  {lesson.videoUrl && (
                                    <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                                      <PlayCircle className="h-3 w-3" />
                                      <span className="hidden sm:inline">
                                        Video
                                      </span>
                                    </div>
                                  )}
                                  {lesson.content && (
                                    <div className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
                                      <FileText className="h-3 w-3" />
                                      <span className="hidden sm:inline">
                                        İçerik
                                      </span>
                                    </div>
                                  )}
                                  {lesson.pdfUrl && (
                                    <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
                                      <FileText className="h-3 w-3" />
                                      <span className="hidden sm:inline">
                                        PDF
                                      </span>
                                    </div>
                                  )}
                                  {(lesson.videoUrl ||
                                    lesson.content ||
                                    lesson.pdfUrl) && (
                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                      •
                                    </span>
                                  )}
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {sectionIndex + 1}.{lessonIndex + 1}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Action Button */}
                            <div className="flex-shrink-0">
                              <Button
                                asChild
                                size="sm"
                                variant={isCompleted ? "outline" : "default"}
                                className={`transition-all duration-200 text-xs sm:text-sm ${
                                  isCompleted
                                    ? "hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                                    : "bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800"
                                }`}
                              >
                                <Link
                                  href={`/student/courses/${courseId}/lessons/${lesson.id}`}
                                >
                                  {isCompleted ? (
                                    <>
                                      <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                                      <span className="hidden sm:inline">
                                        Tekrar İzle
                                      </span>
                                      <span className="sm:hidden">Tekrar</span>
                                    </>
                                  ) : (
                                    <>
                                      <Play className="h-3 w-3 sm:h-4 sm:w-4" />
                                      <span>Başla</span>
                                    </>
                                  )}
                                </Link>
                              </Button>
                            </div>
                          </div>

                          {/* Progress Indicator */}
                          {isCompleted && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-r-full"></div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Quick Actions */}
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-800">
          <CardHeader>
            <CardTitle className="text-indigo-900 dark:text-indigo-100 text-center text-lg">
              İşlemler
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isEnrolled && (
              <>
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-700 dark:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900"
                >
                  <Link
                    href={`/student/courses/${courseId}/lessons/${
                      (course as Course).sections?.[0]?.lessons?.[0]?.id
                    }`}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline dark:text-white">
                      {progressPercentage === 0
                        ? "Kursa Başla"
                        : "Derslere Devam Et"}
                    </span>
                    <span className="sm:hidden">
                      {progressPercentage === 0 ? "Başla" : "Devam Et"}
                    </span>
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                >
                  <Link href={`/student/progress`}>
                    <Award className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">İlerleme Raporu</span>
                    <span className="sm:hidden">İlerleme</span>
                  </Link>
                </Button>
              </>
            )}

            {!isEnrolled && (
              <>
                <CourseNotEnrolledCard
                  enrollmentRequestStatus={enrollmentRequestStatus}
                  handleEnrollmentRequest={handleEnrollmentRequest}
                  createEnrollmentRequestMutation={
                    createEnrollmentRequestMutation
                  }
                />
              </>
            )}

            {progressPercentage === 100 && (
              <Button
                asChild
                variant="outline"
                className="w-full border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
              >
                <Link href={`/student/courses`}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Diğer Kurslarım</span>
                  <span className="sm:hidden">Diğer</span>
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Quizzes */}
        {(course as Course).quizzes &&
          (course as Course).quizzes!.length > 0 && (
            <Card className="bg-gradient-to-br from-orange-50 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-900 dark:text-orange-100">
                  <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  Quizler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(course as Course).quizzes!.map((quiz, index) => (
                  <div
                    key={quiz.id}
                    className="p-3 sm:p-4 bg-white/70 dark:bg-gray-800/70 border border-orange-200 dark:border-orange-700 rounded-lg hover:bg-white/90 dark:hover:bg-gray-800/90 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 gap-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-orange-900 dark:text-orange-100 text-sm sm:text-base">
                          Quiz {index + 1}: {quiz.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs sm:text-sm">
                          <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-full">
                            <Clock className="h-3 w-3" />
                            <span className="hidden sm:inline">
                              {quiz.duration
                                ? `${Math.floor(quiz.duration / 60)} dk`
                                : "Sınırsız"}
                            </span>
                            <span className="sm:hidden">
                              {quiz.duration
                                ? `${Math.floor(quiz.duration / 60)}dk`
                                : "∞"}
                            </span>
                          </span>
                          <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                            <Users className="h-3 w-3" />
                            <span className="hidden sm:inline">
                              {quiz.attemptsAllowed} deneme
                            </span>
                            <span className="sm:hidden">
                              {quiz.attemptsAllowed}x
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      asChild
                      className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 dark:from-orange-700 dark:to-red-700 dark:hover:from-orange-800 dark:hover:to-red-800 text-sm"
                    >
                      <Link
                        href={`/student/courses/${courseId}/quizzes/${quiz.id}`}
                      >
                        <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                        <span className="hidden sm:inline">Quiz'i Başlat</span>
                        <span className="sm:hidden">Başlat</span>
                      </Link>
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

        {/* Progress Overview */}
        {isEnrolled && (
          <CourseProgressOverview
            course={course}
            progressPercentage={progressPercentage}
            completedCount={completedCount}
            storeTotalLessons={storeTotalLessons}
            totalLessons={totalLessons}
          />
        )}
      </div>
    </div>
  );
};

export default CourseContent;
