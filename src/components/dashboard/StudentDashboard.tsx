"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCourseQuery } from "@/hooks/useCourseQuery";
import { Section } from "@/types";
import Link from "next/link";
import { BookOpen, Award, Clock, TrendingUp, FileText } from "lucide-react";

export function StudentDashboard() {
  const { user } = useAuth();
  const { 
    data: enrolledCourses, 
    isLoading: isLoadingEnrolled 
  } = useCourseQuery.useStudentEnrollments(user?.id || '');
  
  const { 
    data: availableCourses, 
    isLoading: isLoadingAvailable 
  } = useCourseQuery.useCourses();

  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedLessons: 0,
    totalLessons: 0,
    completionRate: 0,
  });

  useEffect(() => {
    if (enrolledCourses && Array.isArray(enrolledCourses) && enrolledCourses.length > 0) {
      const totalLessons = enrolledCourses.reduce(
        (sum, enrollment) =>
          sum +
          ((enrollment.course as any)?.sections?.reduce(
            (sectionSum: number, section: Section) =>
              sectionSum + (section.lessons?.length || 0),
            0
          ) || 0),
        0
      );

      // Bu gerçek bir completion hesaplaması değil, örnek amaçlı
      const completedLessons = Math.floor(totalLessons * 0.6); // %60 tamamlanmış varsayalım
      const completionRate =
        totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0;

      setStats({
        enrolledCourses: enrolledCourses?.length || 0,
        completedLessons,
        totalLessons,
        completionRate,
      });
    } else {
      setStats({
        enrolledCourses: 0,
        completedLessons: 0,
        totalLessons: 0,
        completionRate: 0,
      });
    }
  }, [enrolledCourses]);

  if (isLoadingEnrolled || isLoadingAvailable) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Dashboard yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Hoş geldiniz, {user?.name}!
        </h1>
        <p className="text-gray-600">
          Öğrenci dashboard'unuzdan kurslarınızı takip edebilir ve yeni kurslara
          kayıt olabilirsiniz.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Kayıtlı Kurs</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.enrolledCourses}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Award className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Tamamlanan Ders
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.completedLessons}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Toplam Ders</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.totalLessons}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Tamamlanma Oranı
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                %{stats.completionRate}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Hızlı İşlemler
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/dashboard/student/courses"
            className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all duration-200 border border-blue-200 hover:shadow-md"
          >
            <BookOpen className="h-5 w-5 text-blue-600 mr-3" />
            <span className="text-sm font-medium text-blue-900">Kurslarım</span>
          </Link>

          <Link
            href="/dashboard/student/courses"
            className="flex items-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg hover:from-green-100 hover:to-green-200 transition-all duration-200 border border-green-200 hover:shadow-md"
          >
            <BookOpen className="h-5 w-5 text-green-600 mr-3" />
            <span className="text-sm font-medium text-green-900">
              Kurslara Gözat
            </span>
          </Link>

          <Link
            href="/student/enrollment-requests"
            className="flex items-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg hover:from-orange-100 hover:to-orange-200 transition-all duration-200 border border-orange-200 hover:shadow-md"
          >
            <FileText className="h-5 w-5 text-orange-600 mr-3" />
            <span className="text-sm font-medium text-orange-900">
              Başvurularım
            </span>
          </Link>

          <Link
            href="/student/progress"
            className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg hover:from-purple-100 hover:to-purple-200 transition-all duration-200 border border-purple-200 hover:shadow-md"
          >
            <TrendingUp className="h-5 w-5 text-purple-600 mr-3" />
            <span className="text-sm font-medium text-purple-900">
              İlerleme Raporu
            </span>
          </Link>
        </div>
      </div>

      {/* Current Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrolled Courses */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Devam Eden Kurslarım
            </h2>
            <Link
              href="/dashboard/student/courses"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Tümünü Gör →
            </Link>
          </div>

          {!enrolledCourses ||
          !Array.isArray(enrolledCourses) ||
          enrolledCourses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Henüz hiçbir kursa kayıt olmadınız.
              <Link
                href="/dashboard/student/courses"
                className="block mt-2 text-blue-600 hover:text-blue-800 font-medium"
              >
                Kurslara göz atın →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {enrolledCourses.slice(0, 3).map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {enrollment.course?.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {(enrollment.course as any)?.sections?.length || 0} bölüm • İlerleme: %60
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/student/courses/${enrollment.course?.id}`}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Devam Et →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Courses */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Önerilen Kurslar
            </h2>
            <Link
              href="/dashboard/student/courses"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Tümünü Gör →
            </Link>
          </div>

          {!availableCourses?.items ||
          !Array.isArray(availableCourses.items) ||
          availableCourses.items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Şu anda mevcut kurs bulunmuyor.
            </div>
          ) : (
            <div className="space-y-3">
              {availableCourses.items.slice(0, 3).map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {course.sections?.length || 0} bölüm •{" "}
                      {course.enrollments?.length || 0} öğrenci
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/student/courses/${course.id}`}
                    className="text-sm text-green-600 hover:text-green-800 font-medium"
                  >
                    Kayıt Ol →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Test Content for Scroll */}
      <div className="space-y-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Test Bölümü {i}
            </h3>
            <p className="text-gray-600 mb-4">
              Bu bölüm sticky header efektini test etmek için eklendi. 
              Sayfayı aşağı kaydırdığınızda header'ın opacity'sinin değiştiğini 
              ve sabit kaldığını görebilirsiniz.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Alt Başlık {i}.1</h4>
                <p className="text-sm text-gray-600">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Alt Başlık {i}.2</h4>
                <p className="text-sm text-gray-600">
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco 
                  laboris nisi ut aliquip ex ea commodo consequat.
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
