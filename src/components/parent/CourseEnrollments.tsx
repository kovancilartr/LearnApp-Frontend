'use client';

import { Course, Enrollment } from '@/types/course.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Calendar, 
  User, 
  Clock,
  CheckCircle,
  PlayCircle,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import Link from 'next/link';

interface CourseEnrollment extends Enrollment {
  course: Course & {
    _count?: {
      sections: number;
      enrollments: number;
    };
    progress?: {
      completedLessons: number;
      totalLessons: number;
      completionPercentage: number;
      lastActivity?: string;
    };
  };
}

interface CourseEnrollmentsProps {
  enrollments: CourseEnrollment[];
  childName: string;
  loading?: boolean;
}

export function CourseEnrollments({ 
  enrollments, 
  childName, 
  loading = false 
}: CourseEnrollmentsProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Kurs Kayıtları
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (enrollments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Kurs Kayıtları
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">Henüz kursa kayıt olmamış</p>
            <p className="text-sm text-gray-400">
              {childName} henüz herhangi bir kursa kayıt olmamış.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate overall statistics
  const totalCourses = enrollments.length;
  const completedCourses = enrollments.filter(e => 
    e.course.progress?.completionPercentage === 100
  ).length;
  const inProgressCourses = enrollments.filter(e => 
    e.course.progress && e.course.progress.completionPercentage > 0 && e.course.progress.completionPercentage < 100
  ).length;
  const notStartedCourses = enrollments.filter(e => 
    !e.course.progress || e.course.progress.completionPercentage === 0
  ).length;

  const overallProgress = enrollments.reduce((sum, enrollment) => 
    sum + (enrollment.course.progress?.completionPercentage || 0), 0
  ) / enrollments.length;

  return (
    <div className="space-y-6">
      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Kurs</p>
                <p className="text-2xl font-bold text-gray-900">{totalCourses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Tamamlanan</p>
                <p className="text-2xl font-bold text-gray-900">{completedCourses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <PlayCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Devam Eden</p>
                <p className="text-2xl font-bold text-gray-900">{inProgressCourses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Ortalama İlerleme</p>
                <p className="text-2xl font-bold text-gray-900">%{Math.round(overallProgress)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {childName} - Kayıtlı Kurslar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {enrollments.map((enrollment) => {
              const course = enrollment.course;
              const progress = course.progress;
              const completionPercentage = progress?.completionPercentage || 0;
              
              const getStatusBadge = () => {
                if (completionPercentage === 100) {
                  return <Badge className="bg-green-100 text-green-800">Tamamlandı</Badge>;
                } else if (completionPercentage > 0) {
                  return <Badge className="bg-yellow-100 text-yellow-800">Devam Ediyor</Badge>;
                } else {
                  return <Badge variant="outline">Başlanmadı</Badge>;
                }
              };

              return (
                <div key={enrollment.id} className="p-6 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                        {getStatusBadge()}
                      </div>
                      
                      {course.description && (
                        <p className="text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                      )}

                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Kayıt: {format(new Date(enrollment.createdAt), 'dd MMM yyyy', { locale: tr })}
                        </span>
                        
                        {course.teacher && (
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {course.teacher.user.name}
                          </span>
                        )}

                        {course._count && (
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            {course._count.sections} bölüm
                          </span>
                        )}

                        {progress?.lastActivity && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Son aktivite: {format(new Date(progress.lastActivity), 'dd MMM', { locale: tr })}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Link href={`/courses/${course.id}`}>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Kursu Görüntüle
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Progress Section */}
                  {progress && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">İlerleme</span>
                        <span className="text-sm text-gray-600">
                          {progress.completedLessons}/{progress.totalLessons} ders tamamlandı
                        </span>
                      </div>
                      
                      <Progress value={completionPercentage} className="h-2" />
                      
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>%0</span>
                        <span className="font-medium">%{Math.round(completionPercentage)}</span>
                        <span>%100</span>
                      </div>
                    </div>
                  )}

                  {/* Quick Stats */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">
                          {progress?.totalLessons || 0}
                        </p>
                        <p className="text-xs text-gray-500">Toplam Ders</p>
                      </div>
                      
                      <div>
                        <p className="text-2xl font-bold text-green-600">
                          {progress?.completedLessons || 0}
                        </p>
                        <p className="text-xs text-gray-500">Tamamlanan</p>
                      </div>
                      
                      <div>
                        <p className="text-2xl font-bold text-purple-600">
                          %{Math.round(completionPercentage)}
                        </p>
                        <p className="text-xs text-gray-500">İlerleme</p>
                      </div>
                      
                      <div>
                        <p className="text-2xl font-bold text-orange-600">
                          {course._count?.enrollments || 0}
                        </p>
                        <p className="text-xs text-gray-500">Toplam Öğrenci</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}