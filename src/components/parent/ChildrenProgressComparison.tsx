'use client';

import React from 'react';
import { useChildrenProgressComparison } from '@/hooks/useParentQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Users,
  BookOpen, 
  TrendingUp, 
  Award, 
  Activity, 
  Trophy,
  Target,
  AlertTriangle,
  Lightbulb,
  RefreshCw,
  BarChart3,
  Calendar,
  Flame
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ChildrenProgressComparisonProps {
  className?: string;
}

export function ChildrenProgressComparison({ className }: ChildrenProgressComparisonProps) {

  const { 
    data: comparison, 
    isLoading, 
    error, 
    refetch 
  } = useChildrenProgressComparison();

  const handleRefresh = () => {
    refetch();
    toast.success('Karşılaştırma yenilendi');
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Karşılaştırma yükleniyor...</span>
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
            <BarChart3 className="h-12 w-12 mx-auto text-red-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Karşılaştırma Yüklenemedi
            </h3>
            <p className="text-gray-600 mb-4">
              Çocuklar arası karşılaştırma yüklenirken bir hata oluştu.
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

  if (!comparison || comparison.children.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Karşılaştırma Yapılamıyor
            </h3>
            <p className="text-gray-600">
              Karşılaştırma için en az bir çocuğunuzun kayıtlı olması gerekiyor.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Çocuklar Arası İlerleme Karşılaştırması
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Karşılaştırma Tarihi: {new Date(comparison.comparisonGeneratedAt).toLocaleDateString('tr-TR')}
              </p>
            </div>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Yenile
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Insights Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Önemli Bulgular
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Performer */}
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
              <Trophy className="h-6 w-6 text-green-600 mt-1" />
              <div>
                <h4 className="font-medium text-green-900">En Başarılı</h4>
                <p className="text-sm text-green-700">
                  {comparison.insights.topPerformer} genel performansta öne çıkıyor.
                </p>
              </div>
            </div>

            {/* Most Improved */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h4 className="font-medium text-blue-900">En Çok Gelişen</h4>
                <p className="text-sm text-blue-700">
                  {comparison.insights.mostImproved} bu hafta en aktif öğrenci.
                </p>
              </div>
            </div>

            {/* Needs Attention */}
            {comparison.insights.needsAttention.length > 0 && (
              <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-orange-600 mt-1" />
                <div>
                  <h4 className="font-medium text-orange-900">Dikkat Gereken</h4>
                  <p className="text-sm text-orange-700">
                    {comparison.insights.needsAttention.join(', ')} için ek destek gerekebilir.
                  </p>
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
              <Target className="h-6 w-6 text-purple-600 mt-1" />
              <div>
                <h4 className="font-medium text-purple-900">Öneriler</h4>
                <div className="text-sm text-purple-700 space-y-1">
                  {comparison.insights.recommendations.map((rec, index) => (
                    <p key={index}>• {rec}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Children Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Detaylı Karşılaştırma
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {comparison.children
              .sort((a, b) => a.rankings.overallRank - b.rankings.overallRank)
              .map((child, index) => (
                <ChildComparisonCard 
                  key={child.childId} 
                  child={child} 
                  rank={index + 1}
                  totalChildren={comparison.children.length}
                />
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performans Metrikleri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Overall Progress Comparison */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Genel İlerleme Karşılaştırması</h4>
              <div className="space-y-3">
                {comparison.children
                  .sort((a, b) => b.metrics.overallProgress - a.metrics.overallProgress)
                  .map((child) => (
                    <div key={child.childId} className="flex items-center gap-4">
                      <div className="w-24 text-sm font-medium truncate">
                        {child.childName}
                      </div>
                      <div className="flex-1">
                        <Progress value={child.metrics.overallProgress} className="h-3" />
                      </div>
                      <div className="w-16 text-sm text-right">
                        %{child.metrics.overallProgress}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Quiz Score Comparison */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Quiz Skoru Karşılaştırması</h4>
              <div className="space-y-3">
                {comparison.children
                  .sort((a, b) => b.metrics.averageQuizScore - a.metrics.averageQuizScore)
                  .map((child) => (
                    <div key={child.childId} className="flex items-center gap-4">
                      <div className="w-24 text-sm font-medium truncate">
                        {child.childName}
                      </div>
                      <div className="flex-1">
                        <Progress value={child.metrics.averageQuizScore} className="h-3" />
                      </div>
                      <div className="w-16 text-sm text-right">
                        %{child.metrics.averageQuizScore}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Weekly Activity Comparison */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Bu Hafta Aktivite Karşılaştırması</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {comparison.children
                  .sort((a, b) => b.metrics.lessonsCompletedThisWeek - a.metrics.lessonsCompletedThisWeek)
                  .map((child) => (
                    <div key={child.childId} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{child.childName}</span>
                        <Badge variant="outline">
                          #{child.rankings.activityRank}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {child.metrics.lessonsCompletedThisWeek} ders bu hafta
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface ChildComparisonCardProps {
  child: any;
  rank: number;
  totalChildren: number;
}

function ChildComparisonCard({ child, rank, totalChildren }: ChildComparisonCardProps) {
  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-600 bg-yellow-50';
    if (rank === 2) return 'text-gray-600 bg-gray-50';
    if (rank === 3) return 'text-orange-600 bg-orange-50';
    return 'text-blue-600 bg-blue-50';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-4 w-4" />;
    if (rank <= 3) return <Award className="h-4 w-4" />;
    return <Target className="h-4 w-4" />;
  };

  return (
    <div className="border rounded-lg p-6 space-y-4">
      {/* Child Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${getRankColor(rank)}`}>
            {getRankIcon(rank)}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{child.childName}</h3>
            <p className="text-sm text-gray-600">
              Genel Sıralama: {rank}/{totalChildren}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            %{child.metrics.overallProgress}
          </div>
          <div className="text-sm text-gray-600">Genel İlerleme</div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <BookOpen className="h-6 w-6 mx-auto text-blue-600 mb-1" />
          <div className="text-lg font-bold text-blue-900">
            {child.metrics.coursesCompleted}/{child.metrics.totalCourses}
          </div>
          <div className="text-xs text-blue-700">Kurs Tamamlama</div>
        </div>

        <div className="text-center p-3 bg-green-50 rounded-lg">
          <Award className="h-6 w-6 mx-auto text-green-600 mb-1" />
          <div className="text-lg font-bold text-green-900">
            %{child.metrics.averageQuizScore}
          </div>
          <div className="text-xs text-green-700">Ortalama Quiz</div>
        </div>

        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <Activity className="h-6 w-6 mx-auto text-purple-600 mb-1" />
          <div className="text-lg font-bold text-purple-900">
            {child.metrics.lessonsCompletedThisWeek}
          </div>
          <div className="text-xs text-purple-700">Bu Hafta Ders</div>
        </div>

        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <Flame className="h-6 w-6 mx-auto text-orange-600 mb-1" />
          <div className="text-lg font-bold text-orange-900">
            {child.metrics.streakDays}
          </div>
          <div className="text-xs text-orange-700">Gün Serisi</div>
        </div>
      </div>

      {/* Rankings */}
      <div className="grid grid-cols-4 gap-4 pt-4 border-t">
        <div className="text-center">
          <div className="text-sm text-gray-600">İlerleme</div>
          <Badge variant="outline" className="mt-1">
            #{child.rankings.progressRank}
          </Badge>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600">Quiz Skoru</div>
          <Badge variant="outline" className="mt-1">
            #{child.rankings.quizScoreRank}
          </Badge>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600">Aktivite</div>
          <Badge variant="outline" className="mt-1">
            #{child.rankings.activityRank}
          </Badge>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600">Genel</div>
          <Badge variant="outline" className="mt-1">
            #{child.rankings.overallRank}
          </Badge>
        </div>
      </div>

      {/* Last Activity */}
      <div className="flex items-center gap-2 text-sm text-gray-600 pt-2 border-t">
        <Calendar className="h-4 w-4" />
        <span>Son Aktivite:</span>
        <span className="font-medium">
          {child.metrics.lastActivityAt ? 
            new Date(child.metrics.lastActivityAt).toLocaleDateString('tr-TR') : 
            'Henüz aktivite yok'
          }
        </span>
      </div>
    </div>
  );
}