'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar,
  Target,
  Clock,
  Award
} from 'lucide-react';
import { StudentProgressSummary, RecentCompletion } from '@/lib/services';
import { cn } from '@/lib/utils';

interface ProgressChartProps {
  progressSummary: StudentProgressSummary;
  recentCompletions?: RecentCompletion[];
}

export function ProgressChart({ progressSummary, recentCompletions = [] }: ProgressChartProps) {
  const {
    totalCourses,
    totalLessonsCompleted,
    totalLessonsAvailable,
    overallProgressPercentage,
    courseProgresses
  } = progressSummary;

  // Calculate additional stats
  const completedCourses = courseProgresses.filter(cp => cp.progressPercentage === 100).length;
  const inProgressCourses = courseProgresses.filter(cp => cp.progressPercentage > 0 && cp.progressPercentage < 100).length;
  const notStartedCourses = courseProgresses.filter(cp => cp.progressPercentage === 0).length;

  // Calculate average progress per course
  const averageProgressPerCourse = totalCourses > 0 
    ? Math.round(courseProgresses.reduce((sum, cp) => sum + cp.progressPercentage, 0) / totalCourses)
    : 0;

  // Get recent activity stats
  const recentCompletionsThisWeek = recentCompletions.filter(completion => {
    const completionDate = new Date(completion.completedAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return completionDate >= weekAgo;
  }).length;

  return (
    <div className="space-y-6">
      {/* Overall Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Genel İlerleme Özeti
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Progress Bar */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Toplam İlerleme</span>
              <span className="text-2xl font-bold text-blue-600">
                {overallProgressPercentage}%
              </span>
            </div>
            <Progress value={overallProgressPercentage} className="h-4" />
            <div className="text-sm text-muted-foreground text-center">
              {totalLessonsCompleted} / {totalLessonsAvailable} ders tamamlandı
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Award className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-green-800">{completedCourses}</div>
              <div className="text-sm text-green-600">Tamamlanan Kurs</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-blue-800">{inProgressCourses}</div>
              <div className="text-sm text-blue-600">Devam Eden Kurs</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Target className="h-6 w-6 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold text-orange-800">{averageProgressPerCourse}%</div>
              <div className="text-sm text-orange-600">Ortalama İlerleme</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Clock className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold text-purple-800">{recentCompletionsThisWeek}</div>
              <div className="text-sm text-purple-600">Bu Hafta Tamamlanan</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Progress Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            Kurs Bazında İlerleme
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {courseProgresses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Henüz hiçbir kursa kayıt olmadınız.
              </div>
            ) : (
              courseProgresses.map((courseProgress) => (
                <div key={courseProgress.courseId} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{courseProgress.courseTitle}</h4>
                      <p className="text-sm text-muted-foreground">
                        {courseProgress.completedLessons} / {courseProgress.totalLessons} ders
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {courseProgress.progressPercentage}%
                      </span>
                      {courseProgress.progressPercentage === 100 && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <Award className="h-3 w-3 mr-1" />
                          Tamamlandı
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Progress 
                    value={courseProgress.progressPercentage} 
                    className={cn(
                      "h-2",
                      courseProgress.progressPercentage === 100 && "bg-green-100"
                    )}
                  />
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {recentCompletions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Son Aktiviteler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentCompletions.slice(0, 5).map((completion, index) => {
                const completionDate = new Date(completion.completedAt);
                const isToday = completionDate.toDateString() === new Date().toDateString();
                const isYesterday = completionDate.toDateString() === new Date(Date.now() - 86400000).toDateString();
                
                let dateText = completionDate.toLocaleDateString('tr-TR');
                if (isToday) dateText = 'Bugün';
                else if (isYesterday) dateText = 'Dün';

                return (
                  <div key={`${completion.lessonId}-${index}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{completion.lessonTitle}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {completion.courseTitle} • {completion.sectionTitle}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground flex-shrink-0">
                      {dateText}
                    </div>
                  </div>
                );
              })}
              
              {recentCompletions.length > 5 && (
                <div className="text-center text-sm text-muted-foreground">
                  +{recentCompletions.length - 5} aktivite daha
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievement Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-600" />
            Başarılar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* First Course Completed */}
            {completedCourses > 0 && (
              <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
                <div className="text-2xl mb-2">🏆</div>
                <div className="font-medium text-yellow-800">İlk Kurs</div>
                <div className="text-xs text-yellow-600">Tamamlandı</div>
              </div>
            )}

            {/* Multiple Courses */}
            {completedCourses >= 3 && (
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <div className="text-2xl mb-2">🎯</div>
                <div className="font-medium text-blue-800">Çoklu Kurs</div>
                <div className="text-xs text-blue-600">3+ Kurs Tamamlandı</div>
              </div>
            )}

            {/* High Progress */}
            {overallProgressPercentage >= 80 && (
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                <div className="text-2xl mb-2">⚡</div>
                <div className="font-medium text-green-800">Yüksek İlerleme</div>
                <div className="text-xs text-green-600">%80+ İlerleme</div>
              </div>
            )}

            {/* Active Learner */}
            {recentCompletionsThisWeek >= 5 && (
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                <div className="text-2xl mb-2">🔥</div>
                <div className="font-medium text-purple-800">Aktif Öğrenci</div>
                <div className="text-xs text-purple-600">Bu Hafta 5+ Ders</div>
              </div>
            )}

            {/* Perfect Score */}
            {completedCourses > 0 && overallProgressPercentage === 100 && (
              <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg border border-pink-200">
                <div className="text-2xl mb-2">💎</div>
                <div className="font-medium text-pink-800">Mükemmel</div>
                <div className="text-xs text-pink-600">%100 Tamamlama</div>
              </div>
            )}

            {/* Consistent Learner */}
            {recentCompletions.length >= 10 && (
              <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg border border-indigo-200">
                <div className="text-2xl mb-2">📚</div>
                <div className="font-medium text-indigo-800">Düzenli Öğrenci</div>
                <div className="text-xs text-indigo-600">Sürekli Aktivite</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}