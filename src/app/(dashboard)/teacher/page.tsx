'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RoleGuard } from '@/components/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCourseStore } from '@/store/courseStore';
import { useQuizStore } from '@/store/quizStore';
import { BookOpen, Users, FileText, BarChart3, Plus, Eye } from 'lucide-react';

export default function TeacherDashboardPage() {
  const { 
    courses, 
    isLoadingCourses, 
    fetchCourses 
  } = useCourseStore();
  
  const { 
    quizzes, 
    isLoadingQuizzes, 
    fetchQuizzes 
  } = useQuizStore();

  useEffect(() => {
    fetchCourses();
    fetchQuizzes();
  }, [fetchCourses, fetchQuizzes]);

  const totalStudents = (courses || []).reduce((total, course) => 
    total + ((course as any).enrollments?.length || 0), 0
  );

  const pendingQuizzes = (quizzes || []).filter(quiz => 
    quiz.attempts?.some(attempt => !attempt.finishedAt)
  ).length;

  const averageScore = (quizzes || []).length > 0 
    ? (quizzes || []).reduce((total, quiz) => {
        const completedAttempts = quiz.attempts?.filter(attempt => 
          attempt.finishedAt && attempt.score !== null
        ) || [];
        const quizAverage = completedAttempts.length > 0
          ? completedAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / completedAttempts.length
          : 0;
        return total + quizAverage;
      }, 0) / (quizzes || []).length
    : 0;

  return (
    <RoleGuard allowedRoles={['TEACHER']}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Öğretmen Paneli</h2>
            <p className="text-muted-foreground">
              Kurslarınızı yönetin ve öğrenci ilerlemelerini takip edin
            </p>
          </div>
          <Link href="/teacher/courses/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Kurs
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kurslarım</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingCourses ? '...' : (courses || []).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Aktif kurs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Öğrenci</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingCourses ? '...' : totalStudents}
              </div>
              <p className="text-xs text-muted-foreground">
                Kayıtlı öğrenci
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bekleyen Sınavlar</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingQuizzes ? '...' : pendingQuizzes}
              </div>
              <p className="text-xs text-muted-foreground">
                Değerlendirme bekliyor
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ortalama Puan</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingQuizzes ? '...' : `${averageScore.toFixed(1)}%`}
              </div>
              <p className="text-xs text-muted-foreground">
                Sınıf ortalaması
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Son Kurslar
                <Link href="/teacher/courses">
                  <Button variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    Tümünü Gör
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingCourses ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : (courses || []).length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Henüz kurs oluşturmadınız
                </p>
              ) : (
                <div className="space-y-3">
                  {(courses || []).slice(0, 3).map((course) => (
                    <div key={course.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{course.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {(course as any).enrollments?.length || 0} öğrenci
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {(course as any).sections?.length || 0} bölüm
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Son Sınavlar
                <Link href="/teacher/quizzes">
                  <Button variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    Tümünü Gör
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingQuizzes ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : (quizzes || []).length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Henüz sınav oluşturmadınız
                </p>
              ) : (
                <div className="space-y-3">
                  {(quizzes || []).slice(0, 3).map((quiz) => (
                    <div key={quiz.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{quiz.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {quiz.attempts?.length || 0} deneme
                        </p>
                      </div>
                      <Badge variant="outline">
                        {quiz.questions?.length || 0} soru
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}