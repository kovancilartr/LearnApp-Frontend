'use client';

import { useEffect, useState } from 'react';
import { RoleGuard } from '@/components/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCourseStore } from '@/store';
import { toast } from 'react-hot-toast';
import { useGlobalProgress } from '@/hooks/useGlobalProgress';
import { Course } from '@/types/course.types';
import { 
  Award, 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Target,
  Calendar,
  CheckCircle,
  Play,
  Users
} from 'lucide-react';
import Link from 'next/link';

export default function StudentProgressPage() {

  const {
    enrolledCourses,
    isLoadingCourses,
    error,
    fetchEnrolledCourses,
  } = useCourseStore();

  const { 
    getOverallProgress, 
    getCourseProgressPercentage, 
    getCompletedLessonsCount, 
    getTotalLessonsCount,
    ensureCourseProgress 
  } = useGlobalProgress();

  const [progressData, setProgressData] = useState<Record<string, {
    totalLessons: number;
    completedLessons: number;
    completionPercentage: number;
    quizzesTaken: number;
    totalQuizzes: number;
    averageQuizScore: number;
    timeSpent: number;
    lastActivity: Date;
  }>>({});

  useEffect(() => {
    fetchEnrolledCourses();
  }, [fetchEnrolledCourses]);

  // Initialize progress for all enrolled courses
  useEffect(() => {
    if (enrolledCourses && enrolledCourses.length > 0) {
      enrolledCourses.forEach(course => {
        ensureCourseProgress(course.id);
      });
    }
  }, [enrolledCourses, enrolledCourses.length, ensureCourseProgress]); // Only depend on length, not the whole array

  useEffect(() => {
    if (error) {
      toast.error(`Hata: ${error.error.message}`);
    }
  }, [error, toast]);

  // Get real progress data from store
  useEffect(() => {
    if ((enrolledCourses?.length || 0) > 0) {
      const realProgressData = (enrolledCourses || []).reduce((acc, course) => {
        const courseData = course as Course;
        const totalLessons = courseData.sections?.reduce((sum: number, section) => 
          sum + (section.lessons?.length || 0), 0) || 0;

        // Get real-time progress from store
        const completionPercentage = getCourseProgressPercentage(course.id);
        const completedLessons = getCompletedLessonsCount(course.id);
        const storeTotalLessons = getTotalLessonsCount(course.id);

        acc[course.id] = {
          totalLessons: storeTotalLessons || totalLessons,
          completedLessons,
          completionPercentage,
          quizzesTaken: 0, // TODO: Get from backend quiz attempts
          totalQuizzes: courseData.quizzes?.length || 0,
          averageQuizScore: 0, // TODO: Calculate from backend quiz results
          timeSpent: 0, // TODO: Get from backend time tracking
          lastActivity: new Date(), // TODO: Get from backend activity tracking
        };
        return acc;
      }, {} as Record<string, {
        totalLessons: number;
        completedLessons: number;
        completionPercentage: number;
        quizzesTaken: number;
        totalQuizzes: number;
        averageQuizScore: number;
        timeSpent: number;
        lastActivity: Date;
      }>);

      setProgressData(realProgressData);
    }
  }, [enrolledCourses, getCourseProgressPercentage, getCompletedLessonsCount, getTotalLessonsCount]);

  // Get overall progress from store
  const overallProgress = getOverallProgress();

  // Calculate overall stats
  const overallStats = (enrolledCourses || []).reduce((acc, course) => {
    const courseProgress = progressData[course.id];
    if (courseProgress) {
      acc.totalLessons += courseProgress.totalLessons;
      acc.completedLessons += courseProgress.completedLessons;
      acc.totalQuizzes += courseProgress.totalQuizzes;
      acc.quizzesTaken += courseProgress.quizzesTaken;
      acc.totalTimeSpent += courseProgress.timeSpent;
      acc.quizScores.push(courseProgress.averageQuizScore);
    }
    return acc;
  }, {
    totalLessons: 0,
    completedLessons: 0,
    totalQuizzes: 0,
    quizzesTaken: 0,
    totalTimeSpent: 0,
    quizScores: [] as number[]
  });

  const overallCompletionRate = overallProgress.percentage;
  const averageQuizScore = overallStats.quizScores.length > 0
    ? Math.round(overallStats.quizScores.reduce((sum, score) => sum + score, 0) / overallStats.quizScores.length)
    : 0;

  if (isLoadingCourses) {
    return (
      <RoleGuard allowedRoles={['STUDENT']}>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">İlerleme raporu yükleniyor...</div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={['STUDENT']}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">İlerleme Raporu</h2>
          <p className="text-muted-foreground">
            Öğrenme yolculuğunuzdaki ilerlemenizi takip edin
          </p>
        </div>

        {/* Overall Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">Genel İlerleme</CardTitle>
              <div className="p-2 bg-blue-200 rounded-lg">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900 mb-2">{overallCompletionRate}%</div>
              <p className="text-xs text-blue-700 mb-3">
                {overallProgress.completed} / {overallProgress.total} ders tamamlandı
              </p>
              <Progress value={overallCompletionRate} className="h-2 bg-blue-200" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Quiz Ortalaması</CardTitle>
              <div className="p-2 bg-green-200 rounded-lg">
                <Award className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900 mb-2">{averageQuizScore}%</div>
              <p className="text-xs text-green-700">
                {overallStats.quizzesTaken} / {overallStats.totalQuizzes} quiz tamamlandı
              </p>
              <div className="mt-2">
                {averageQuizScore >= 80 ? (
                  <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
                    🎉 Mükemmel!
                  </span>
                ) : averageQuizScore >= 60 ? (
                  <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">
                    👍 İyi
                  </span>
                ) : (
                  <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded-full">
                    💪 Geliştirebilir
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">Toplam Süre</CardTitle>
              <div className="p-2 bg-purple-200 rounded-lg">
                <Clock className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900 mb-2">{overallStats.totalTimeSpent}h</div>
              <p className="text-xs text-purple-700">
                Öğrenme süresi
              </p>
              <div className="mt-2">
                <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">
                  ⏱️ {Math.round(overallStats.totalTimeSpent / (enrolledCourses?.length || 1))}h/kurs
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-800">Aktif Kurslar</CardTitle>
              <div className="p-2 bg-orange-200 rounded-lg">
                <BookOpen className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900 mb-2">{enrolledCourses?.length || 0}</div>
              <p className="text-xs text-orange-700">
                Kayıtlı kurslar
              </p>
              <div className="mt-2">
                <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded-full">
                  📚 Aktif öğrenme
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Progress Details */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Kurs Detayları</h3>
          
          {(enrolledCourses?.length || 0) === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Henüz kayıtlı kursunuz yok</h3>
                <p className="text-muted-foreground mb-4">
                  Öğrenme yolculuğunuza başlamak için kurslara kayıt olun
                </p>
                <Button asChild>
                  <Link href="/student/courses">
                    Kurslara Göz At
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {(enrolledCourses || []).map((course) => {
                const courseProgressData = progressData[course.id];
                if (!courseProgressData) return null;

                const {
                  totalLessons,
                  completedLessons,
                  completionPercentage,
                  quizzesTaken,
                  averageQuizScore,
                  timeSpent,
                  lastActivity
                } = courseProgressData;

                return (
                  <Card key={course.id} className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-xl">{course.title}</CardTitle>
                            <Badge 
                              variant={completionPercentage === 100 ? "default" : "secondary"}
                              className={completionPercentage === 100 ? "bg-green-600" : ""}
                            >
                              {completionPercentage === 100 ? (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Tamamlandı
                                </>
                              ) : (
                                `%${completionPercentage} tamamlandı`
                              )}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {course.description}
                          </p>
                          {(course as Course).teacher && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                                <Users className="h-3 w-3" />
                              </div>
                              <span>Eğitmen: {(course as Course).teacher?.user.name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Progress Bar */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Ders İlerlemesi</span>
                          <span className="text-blue-600 font-bold">{completedLessons} / {totalLessons}</span>
                        </div>
                        <div className="space-y-1">
                          <Progress value={completionPercentage} className="h-3" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>%{completionPercentage} tamamlandı</span>
                            <span>{totalLessons - completedLessons} ders kaldı</span>
                          </div>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                          <div className="text-2xl font-bold text-blue-600 mb-1">{completedLessons}</div>
                          <div className="text-xs text-blue-800 font-medium">Tamamlanan Ders</div>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                          <div className="text-2xl font-bold text-green-600 mb-1">{quizzesTaken}</div>
                          <div className="text-xs text-green-800 font-medium">Alınan Quiz</div>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                          <div className="text-2xl font-bold text-purple-600 mb-1">{averageQuizScore}%</div>
                          <div className="text-xs text-purple-800 font-medium">Quiz Ortalaması</div>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                          <div className="text-2xl font-bold text-orange-600 mb-1">{timeSpent}h</div>
                          <div className="text-xs text-orange-800 font-medium">Harcanan Süre</div>
                        </div>
                      </div>

                      {/* Performance Indicator */}
                      <div className={`p-3 rounded-lg border ${
                        completionPercentage === 100 
                          ? "bg-green-50 border-green-200" 
                          : completionPercentage >= 50 
                          ? "bg-blue-50 border-blue-200" 
                          : "bg-yellow-50 border-yellow-200"
                      }`}>
                        <div className="flex items-center gap-2">
                          {completionPercentage === 100 ? (
                            <>
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              <span className="text-green-800 font-medium">🎉 Kurs tamamlandı! Harika iş çıkardınız.</span>
                            </>
                          ) : completionPercentage >= 50 ? (
                            <>
                              <TrendingUp className="h-5 w-5 text-blue-600" />
                              <span className="text-blue-800 font-medium">📈 İyi ilerleme kaydediyorsunuz!</span>
                            </>
                          ) : (
                            <>
                              <Target className="h-5 w-5 text-yellow-600" />
                              <span className="text-yellow-800 font-medium">🎯 Kursa daha fazla zaman ayırabilirsiniz.</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Last Activity and Actions */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Son aktivite: {lastActivity.toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button asChild variant="outline" size="sm" className="hover:bg-blue-50">
                            <Link href={`/student/courses/${course.id}`}>
                              <Target className="h-4 w-4 mr-2" />
                              Detaylar
                            </Link>
                          </Button>
                          <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
                            <Link href={`/student/courses/${course.id}`}>
                              <Play className="h-4 w-4 mr-2" />
                              {completionPercentage === 100 ? "Tekrar Gözden Geçir" : "Devam Et"}
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Achievement Section */}
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-100 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-900">
              <Award className="h-6 w-6 text-yellow-600" />
              🏆 Başarılarınız
            </CardTitle>
            <p className="text-yellow-700 text-sm">Öğrenme yolculuğunuzdaki kilometre taşları</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Always show first achievement */}
              <div className="text-center p-6 bg-white/70 rounded-xl border border-yellow-200 hover:bg-white/90 transition-colors">
                <div className="w-16 h-16 bg-yellow-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-yellow-600" />
                </div>
                <h4 className="font-bold text-yellow-900 mb-2">🌟 İlk Adım</h4>
                <p className="text-sm text-yellow-700">İlk kursa kayıt oldunuz</p>
                <div className="mt-2">
                  <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">
                    Kazanıldı ✓
                  </span>
                </div>
              </div>
              
              {/* Learning enthusiasm achievement */}
              <div className={`text-center p-6 rounded-xl border transition-colors ${
                overallStats.completedLessons >= 10 
                  ? "bg-white/70 border-blue-200 hover:bg-white/90" 
                  : "bg-gray-100/50 border-gray-200"
              }`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  overallStats.completedLessons >= 10 
                    ? "bg-blue-200" 
                    : "bg-gray-200"
                }`}>
                  <BookOpen className={`h-8 w-8 ${
                    overallStats.completedLessons >= 10 
                      ? "text-blue-600" 
                      : "text-gray-400"
                  }`} />
                </div>
                <h4 className={`font-bold mb-2 ${
                  overallStats.completedLessons >= 10 
                    ? "text-blue-900" 
                    : "text-gray-600"
                }`}>
                  📚 Öğrenme Tutkusu
                </h4>
                <p className={`text-sm ${
                  overallStats.completedLessons >= 10 
                    ? "text-blue-700" 
                    : "text-gray-500"
                }`}>
                  10 ders tamamlayın
                </p>
                <div className="mt-2">
                  {overallStats.completedLessons >= 10 ? (
                    <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                      Kazanıldı ✓
                    </span>
                  ) : (
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                      {overallStats.completedLessons}/10 ders
                    </span>
                  )}
                </div>
              </div>
              
              {/* High performance achievement */}
              <div className={`text-center p-6 rounded-xl border transition-colors ${
                averageQuizScore >= 80 
                  ? "bg-white/70 border-green-200 hover:bg-white/90" 
                  : "bg-gray-100/50 border-gray-200"
              }`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  averageQuizScore >= 80 
                    ? "bg-green-200" 
                    : "bg-gray-200"
                }`}>
                  <Target className={`h-8 w-8 ${
                    averageQuizScore >= 80 
                      ? "text-green-600" 
                      : "text-gray-400"
                  }`} />
                </div>
                <h4 className={`font-bold mb-2 ${
                  averageQuizScore >= 80 
                    ? "text-green-900" 
                    : "text-gray-600"
                }`}>
                  🎯 Yüksek Performans
                </h4>
                <p className={`text-sm ${
                  averageQuizScore >= 80 
                    ? "text-green-700" 
                    : "text-gray-500"
                }`}>
                  Quiz ortalaması %80 üzerinde
                </p>
                <div className="mt-2">
                  {averageQuizScore >= 80 ? (
                    <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
                      Kazanıldı ✓
                    </span>
                  ) : (
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                      %{averageQuizScore} ortalama
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Additional achievements for completed courses */}
            {(enrolledCourses || []).some(course => {
              const courseProgress = progressData[course.id];
              return courseProgress?.completionPercentage === 100;
            }) && (
              <div className="mt-6 pt-6 border-t border-yellow-200">
                <h5 className="font-semibold text-yellow-900 mb-4 text-center">🏅 Kurs Tamamlama Başarıları</h5>
                <div className="flex flex-wrap justify-center gap-3">
                  {(enrolledCourses || []).map(course => {
                    const courseProgress = progressData[course.id];
                    if (courseProgress?.completionPercentage === 100) {
                      return (
                        <div key={course.id} className="text-center p-3 bg-white/70 rounded-lg border border-green-200">
                          <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
                          <div className="text-xs font-medium text-green-800 line-clamp-1">
                            {course.title}
                          </div>
                          <div className="text-xs text-green-600">Tamamlandı</div>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}