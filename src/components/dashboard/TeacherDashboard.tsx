"use client";

import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTeacherCourses } from "@/hooks/useCourseQuery";
import { Course, Section } from "@/types";
import Link from "next/link";
import { BookOpen, Users, BarChart3, Plus, Loader2 } from "lucide-react";

export function TeacherDashboard() {
  const { user } = useAuth();
  const {
    data: courses,
    isLoading: isLoadingCourses,
    error,
  } = useTeacherCourses();

  const stats = useMemo(() => {
    if (!courses || courses.length === 0) {
      return {
        totalCourses: 0,
        totalStudents: 0,
        totalLessons: 0,
      };
    }

    const totalStudents = courses.reduce(
      (sum, course) => sum + (course.enrollments?.length || 0),
      0
    );
    const totalLessons = courses.reduce(
      (sum, course) =>
        sum +
        (course.sections?.reduce(
          (sectionSum: number, section: Section) => sectionSum + (section.lessons?.length || 0),
          0
        ) || 0),
      0
    );

    return {
      totalCourses: courses.length,
      totalStudents,
      totalLessons,
    };
  }, [courses]);

  if (isLoadingCourses) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <div className="ml-3 text-lg">Dashboard yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-2">
            Dashboard yüklenirken hata oluştu
          </div>
          <p className="text-gray-600">
            Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Hoş geldiniz, {user?.name}!
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Öğretmen dashboard'unuzdan kurslarınızı yönetebilir ve
          öğrencilerinizin ilerlemesini takip edebilirsiniz.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Toplam Kurs
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.totalCourses}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Toplam Öğrenci
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.totalStudents}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Toplam Ders
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.totalLessons}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Hızlı İşlemler
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/dashboard/teacher/courses"
            className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
              Kurslarım
            </span>
          </Link>

          <Link
            href="/dashboard/teacher/students"
            className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
          >
            <Users className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
            <span className="text-sm font-medium text-green-900 dark:text-green-300">
              Öğrencilerim
            </span>
          </Link>

          <Link
            href="/dashboard/teacher/analytics"
            className="flex items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
          >
            <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-3" />
            <span className="text-sm font-medium text-purple-900 dark:text-purple-300">
              Analitik
            </span>
          </Link>

          <button className="flex items-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">
            <Plus className="h-5 w-5 text-orange-600 dark:text-orange-400 mr-3" />
            <span className="text-sm font-medium text-orange-900 dark:text-orange-300">
              Yeni Kurs
            </span>
          </button>
        </div>
      </div>

      {/* Recent Courses */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Son Kurslarım
          </h2>
          <Link
            href="/dashboard/teacher/courses"
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          >
            Tümünü Gör
          </Link>
        </div>

        {!courses || courses.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Henüz kursunuz bulunmuyor.
            <Link
              href="/dashboard/teacher/courses"
              className="block mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
            >
              İlk kursunuzu oluşturun
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {(courses || []).slice(0, 3).map((course) => (
              <div
                key={course.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-colors"
              >
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {course.enrollments?.length || 0} öğrenci •{" "}
                    {course.sections?.length || 0} bölüm
                  </p>
                </div>
                <Link
                  href={`/dashboard/teacher/courses/${course.id}`}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                >
                  Düzenle
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
