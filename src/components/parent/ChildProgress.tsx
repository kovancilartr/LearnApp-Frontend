'use client';

import { ChildProgress as ChildProgressType } from '@/types/auth.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  TrendingUp, 
  Award, 
  Clock,
  CheckCircle,
  PlayCircle,
  FileText
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface ChildProgressProps {
  progress: ChildProgressType;
  loading?: boolean;
}

export function ChildProgress({ progress, loading = false }: ChildProgressProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const overallProgress = progress.totalLessons > 0 
    ? (progress.completedLessons / progress.totalLessons) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Kurs</p>
                <p className="text-2xl font-bold text-gray-900">{progress.totalCourses}</p>
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
                <p className="text-sm font-medium text-gray-600">Tamamlanan Ders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {progress.completedLessons}/{progress.totalLessons}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Genel İlerleme</p>
                <p className="text-2xl font-bold text-gray-900">%{Math.round(overallProgress)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Award className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Ortalama Quiz Puanı</p>
                <p className="text-2xl font-bold text-gray-900">
                  {progress.averageQuizScore ? `%${Math.round(progress.averageQuizScore)}` : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Kurs İlerlemeleri
          </CardTitle>
        </CardHeader>
        <CardContent>
          {progress.courseProgress.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Henüz kursa kayıt olmamış</p>
            </div>
          ) : (
            <div className="space-y-4">
              {progress.courseProgress.map((course) => (
                <div key={course.courseId} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{course.courseTitle}</h3>
                      <p className="text-sm text-gray-500">
                        {course.completedLessons}/{course.totalLessons} ders tamamlandı
                      </p>
                    </div>
                    <Badge variant={course.completionPercentage === 100 ? "default" : "secondary"}>
                      %{Math.round(course.completionPercentage)}
                    </Badge>
                  </div>
                  
                  <Progress value={course.completionPercentage} className="mb-3" />
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Award className="h-4 w-4" />
                        {course.quizScores.length} quiz
                      </span>
                      {course.lastActivity && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDistanceToNow(new Date(course.lastActivity), { 
                            addSuffix: true, 
                            locale: tr 
                          })}
                        </span>
                      )}
                    </div>
                  </div>

                  {course.quizScores.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm font-medium text-gray-700 mb-2">Son Quiz Sonuçları:</p>
                      <div className="flex flex-wrap gap-2">
                        {course.quizScores.slice(0, 3).map((quiz) => (
                          <Badge 
                            key={quiz.quizId} 
                            variant={quiz.score >= 70 ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {quiz.quizTitle}: %{Math.round((quiz.score / quiz.maxScore) * 100)}
                          </Badge>
                        ))}
                        {course.quizScores.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{course.quizScores.length - 3} daha
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
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
          {progress.recentActivity.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Henüz aktivite bulunmuyor</p>
            </div>
          ) : (
            <div className="space-y-3">
              {progress.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {activity.type === 'lesson_completed' && (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                    {activity.type === 'quiz_completed' && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                    {activity.type === 'course_enrolled' && (
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(activity.timestamp), { 
                          addSuffix: true, 
                          locale: tr 
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    {activity.courseTitle && (
                      <p className="text-xs text-gray-500 mt-1">
                        Kurs: {activity.courseTitle}
                      </p>
                    )}
                    {activity.score !== undefined && (
                      <Badge variant="outline" className="text-xs mt-1">
                        Puan: %{activity.score}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}