"use client";

import { useCourseAnalytics } from "@/hooks";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BookOpen,
  Users,
  TrendingUp,
  AlertCircle,
  GraduationCap,
  FileText,
  HelpCircle,
  ExternalLink,
  Award,
} from "lucide-react";
import { useState } from "react";

interface PopularCoursesTableProps {
  className?: string;
  limit?: number;
  showActions?: boolean;
}

function PopularCoursesTable({
  className,
  limit = 10,
  showActions = true,
}: PopularCoursesTableProps) {
  const { data: courses, isLoading, error, refetch } = useCourseAnalytics();
  const [sortBy, setSortBy] = useState<
    "studentCount" | "completionRate" | "averageProgress"
  >("studentCount");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  if (error) {
    return (
      <div className={className}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              Popüler kurslar yüklenirken hata oluştu: {error.message}
            </span>
            <button
              onClick={() => refetch()}
              className="ml-2 text-sm underline hover:no-underline"
            >
              Tekrar dene
            </button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={className}>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-6 w-16" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className={className}>
        <Card className="p-8 text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Henüz kurs verisi yok
          </h3>
          <p className="text-gray-600">
            Kurslar oluşturulduğunda popüler kurslar listesi burada görünecek.
          </p>
        </Card>
      </div>
    );
  }

  // Sıralama fonksiyonu
  const sortedCourses = [...courses].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];

    if (sortOrder === "desc") {
      return bValue - aValue;
    }
    return aValue - bValue;
  });

  const displayCourses = sortedCourses.slice(0, limit);

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const getCompletionBadgeColor = (rate: number) => {
    if (rate >= 80) return "bg-green-100 text-green-800";
    if (rate >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getProgressBadgeColor = (progress: number) => {
    if (progress >= 75) return "bg-blue-100 text-blue-800";
    if (progress >= 50) return "bg-purple-100 text-purple-800";
    return "bg-gray-100 text-gray-800";
  };

  const getSortIcon = (column: typeof sortBy) => {
    if (sortBy !== column) return null;
    return sortOrder === "desc" ? "↓" : "↑";
  };

  return (
    <div className={className}>
      <Card className="p-6">
        {/* Başlık */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Award className="h-5 w-5 mr-2 text-yellow-600" />
            Popüler Kurslar
          </h2>
          <Badge variant="outline">
            {displayCourses.length} / {courses.length} kurs
          </Badge>
        </div>

        {/* Sıralama Butonları */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={sortBy === "studentCount" ? "default" : "outline"}
            size="sm"
            onClick={() => handleSort("studentCount")}
            className="flex items-center gap-1"
          >
            <Users className="h-3 w-3" />
            Öğrenci Sayısı {getSortIcon("studentCount")}
          </Button>
          <Button
            variant={sortBy === "completionRate" ? "default" : "outline"}
            size="sm"
            onClick={() => handleSort("completionRate")}
            className="flex items-center gap-1"
          >
            <TrendingUp className="h-3 w-3" />
            Tamamlanma Oranı {getSortIcon("completionRate")}
          </Button>
          <Button
            variant={sortBy === "averageProgress" ? "default" : "outline"}
            size="sm"
            onClick={() => handleSort("averageProgress")}
            className="flex items-center gap-1"
          >
            <FileText className="h-3 w-3" />
            Ortalama İlerleme {getSortIcon("averageProgress")}
          </Button>
        </div>

        {/* Tablo */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Kurs Adı</TableHead>
                <TableHead>Öğretmen</TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Users className="h-4 w-4" />
                    Öğrenci
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <FileText className="h-4 w-4" />
                    Ders
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <HelpCircle className="h-4 w-4" />
                    Quiz
                  </div>
                </TableHead>
                <TableHead className="text-center">Tamamlanma</TableHead>
                <TableHead className="text-center">İlerleme</TableHead>
                <TableHead className="text-center">Oluşturulma</TableHead>
                {showActions && (
                  <TableHead className="text-center">İşlemler</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayCourses.map((course, index) => (
                <TableRow key={course.courseId} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm">
                      {index + 1}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900 line-clamp-2">
                        {course.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {course.courseId}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <GraduationCap className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm">
                        {course.teacherName || "Atanmamış"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="font-medium">
                      {course.studentCount}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm font-medium">
                      {course.lessonCount}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm font-medium">
                      {course.quizCount}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      className={getCompletionBadgeColor(course.completionRate)}
                    >
                      %{course.completionRate.toFixed(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      className={getProgressBadgeColor(course.averageProgress)}
                    >
                      %{course.averageProgress.toFixed(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm text-gray-600">
                      {new Date(course.createdAt).toLocaleDateString("tr-TR")}
                    </span>
                  </TableCell>
                  {showActions && (
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          // Kurs detay sayfasına yönlendir
                          window.open(
                            `/admin/courses/${course.courseId}`,
                            "_blank"
                          );
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Özet İstatistikler */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {displayCourses.reduce(
                  (sum, course) => sum + course.studentCount,
                  0
                )}
              </div>
              <div className="text-sm text-gray-600">Toplam Öğrenci</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {displayCourses.reduce(
                  (sum, course) => sum + course.lessonCount,
                  0
                )}
              </div>
              <div className="text-sm text-gray-600">Toplam Ders</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {displayCourses.reduce(
                  (sum, course) => sum + course.quizCount,
                  0
                )}
              </div>
              <div className="text-sm text-gray-600">Toplam Quiz</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {displayCourses.length > 0
                  ? (
                      displayCourses.reduce(
                        (sum, course) => sum + course.completionRate,
                        0
                      ) / displayCourses.length
                    ).toFixed(1)
                  : 0}
                %
              </div>
              <div className="text-sm text-gray-600">Ort. Tamamlanma</div>
            </div>
          </div>
        </div>

        {/* Daha Fazla Göster */}
        {courses.length > limit && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              {courses.length - limit} kurs daha var.{" "}
              <a
                href="/admin/courses"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Tümünü görüntüle →
              </a>
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

export { PopularCoursesTable };
