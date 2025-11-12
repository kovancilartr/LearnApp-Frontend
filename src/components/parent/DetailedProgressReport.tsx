'use client';

import React from 'react';
import { useDetailedProgressReport } from '@/hooks/useParentQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  TrendingUp, 
  Award, 
  Clock, 
  BookOpen, 
  Users,
  Calendar,
  Download,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface DetailedProgressReportProps {
  className?: string;
}

export function DetailedProgressReport({ className }: DetailedProgressReportProps) {

  const { 
    data: report, 
    isLoading, 
    error, 
    refetch 
  } = useDetailedProgressReport();

  const handleRefresh = () => {
    refetch();
    toast.success('Rapor yenilendi');
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Detaylı rapor yükleniyor...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-red-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Rapor Yüklenemedi
            </h3>
            <p className="text-gray-600 mb-4">
              Detaylı ilerleme raporu yüklenirken bir hata oluştu.
            </p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tekrar Dene
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Report Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Detaylı İlerleme Raporu
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Rapor Tarihi: {new Date(report.reportGeneratedAt).toLocaleDateString('tr-TR')}
              </p>
            </div>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Yenile
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Overall Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Users className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-blue-900">
                {report.overallSummary.totalChildren}
              </div>
              <div className="text-sm text-blue-700">Çocuk</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <BookOpen className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <div className="text-2xl font-bold text-green-900">
                {report.overallSummary.totalCourses}
              </div>
              <div className="text-sm text-green-700">Toplam Kurs</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <TrendingUp className="h-8 w-8 mx-auto text-purple-600 mb-2" />
              <div className="text-2xl font-bold text-purple-900">
                %{report.overallSummary.overallProgressPercentage}
              </div>
              <div className="text-sm text-purple-700">Genel İlerleme</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Award className="h-8 w-8 mx-auto text-orange-600 mb-2" />
              <div className="text-2xl font-bold text-orange-900">
                %{report.overallSummary.averageQuizScore}
              </div>
              <div className="text-sm text-orange-700">Ortalama Quiz Skoru</div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Genel Özet</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Toplam Ders:</span>
                <span className="ml-2 font-medium">{report.overallSummary.totalLessons}</span>
              </div>
              <div>
                <span className="text-gray-600">Tamamlanan Ders:</span>
                <span className="ml-2 font-medium">{report.overallSummary.totalCompletedLessons}</span>
              </div>
              <div>
                <span className="text-gray-600">Toplam Quiz:</span>
                <span className="ml-2 font-medium">{report.overallSummary.totalQuizzesTaken}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Children Reports */}
      <Tabs defaultValue={report.childrenReports[0]?.childId} className="space-y-4">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {report.childrenReports.map((child) => (
            <TabsTrigger key={child.childId} value={child.childId} className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {child.childName}
            </TabsTrigger>
          ))}
        </TabsList>

        {report.childrenReports.map((child) => (
          <TabsContent key={child.childId} value={child.childId} className="space-y-6">
            <ChildDetailedReport child={child} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

interface ChildDetailedReportProps {
  child: any;
}

function ChildDetailedReport({ child }: ChildDetailedReportProps) {
  return (
    <div className="space-y-6">
      {/* Child Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {child.childName} - Genel Durum
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {child.totalCourses}
              </div>
              <div className="text-sm text-gray-600">Toplam Kurs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {child.completedCourses}
              </div>
              <div className="text-sm text-gray-600">Tamamlanan</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {child.inProgressCourses}
              </div>
              <div className="text-sm text-gray-600">Devam Eden</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {child.notStartedCourses}
              </div>
              <div className="text-sm text-gray-600">Başlanmamış</div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Genel İlerleme</span>
                <span>%{child.overallProgressPercentage}</span>
              </div>
              <Progress value={child.overallProgressPercentage} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Tamamlanan Ders:</span>
                <span className="ml-2 font-medium">
                  {child.totalLessonsCompleted}/{child.totalLessonsAvailable}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Ortalama Quiz Skoru:</span>
                <span className="ml-2 font-medium">%{child.averageQuizScore}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Kurs Detayları
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {child.courseDetails.map((course: any) => (
              <div key={course.courseId} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{course.courseTitle}</h4>
                    <p className="text-sm text-gray-600">Öğretmen: {course.teacherName}</p>
                  </div>
                  <Badge variant={course.progressPercentage === 100 ? 'default' : 'secondary'}>
                    %{course.progressPercentage}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Progress value={course.progressPercentage} className="h-2" />
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Ders:</span>
                      <span className="ml-1 font-medium">
                        {course.completedLessons}/{course.totalLessons}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Kayıt:</span>
                      <span className="ml-1 font-medium">
                        {new Date(course.enrolledAt).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Son Aktivite:</span>
                      <span className="ml-1 font-medium">
                        {course.lastActivityAt ? 
                          new Date(course.lastActivityAt).toLocaleDateString('tr-TR') : 
                          'Henüz yok'
                        }
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Tahmini Bitiş:</span>
                      <span className="ml-1 font-medium">
                        {course.estimatedCompletionDate ? 
                          new Date(course.estimatedCompletionDate).toLocaleDateString('tr-TR') : 
                          'Belirsiz'
                        }
                      </span>
                    </div>
                  </div>

                  {course.quizResults.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Quiz Sonuçları</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {course.quizResults.map((quiz: any) => (
                          <div key={quiz.quizId} className="flex justify-between text-sm">
                            <span className="text-gray-600">{quiz.quizTitle}:</span>
                            <span className="font-medium">
                              %{quiz.bestScore} ({quiz.attemptsCount} deneme)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Son Aktiviteler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {child.recentActivity.slice(0, 10).map((activity: any, index: number) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div className="flex items-center gap-3">
                  {activity.activityType === 'lesson_completed' ? (
                    <BookOpen className="h-4 w-4 text-green-600" />
                  ) : (
                    <Award className="h-4 w-4 text-blue-600" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{activity.lessonTitle}</p>
                    <p className="text-xs text-gray-600">{activity.courseTitle}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-xs">
                    {activity.activityType === 'lesson_completed' ? 'Ders' : 'Quiz'}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(activity.completedAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performans Trendleri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="weekly" className="space-y-4">
            <TabsList>
              <TabsTrigger value="weekly">Haftalık</TabsTrigger>
              <TabsTrigger value="monthly">Aylık</TabsTrigger>
            </TabsList>

            <TabsContent value="weekly">
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900">Son 8 Hafta</h4>
                {child.performanceTrends.weeklyProgress.slice(-8).map((week: any, index: number) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b">
                    <div className="text-sm">
                      {new Date(week.weekStart).toLocaleDateString('tr-TR')} - 
                      {new Date(week.weekEnd).toLocaleDateString('tr-TR')}
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="text-green-600">{week.lessonsCompleted} ders</span>
                      <span className="text-blue-600">{week.quizzesTaken} quiz</span>
                      <span className="text-purple-600">%{week.averageScore} ort.</span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="monthly">
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900">Son 6 Ay</h4>
                {child.performanceTrends.monthlyProgress.slice(-6).map((month: any, index: number) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b">
                    <div className="text-sm">
                      {month.month} {month.year}
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="text-green-600">{month.lessonsCompleted} ders</span>
                      <span className="text-orange-600">{month.coursesCompleted} kurs</span>
                      <span className="text-purple-600">%{month.averageScore} ort.</span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}