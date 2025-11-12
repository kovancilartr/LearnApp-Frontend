'use client';

import { QuizScore } from '@/types/auth.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Award, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Calendar,
  Target
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface QuizResultsProps {
  quizResults: QuizScore[];
  loading?: boolean;
}

export function QuizResults({ quizResults, loading = false }: QuizResultsProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Quiz Sonuçları
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (quizResults.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Quiz Sonuçları
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Award className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">Henüz quiz tamamlanmamış</p>
            <p className="text-sm text-gray-400">
              Çocuğunuz henüz herhangi bir quiz tamamlamamış.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate statistics
  const averageScore = quizResults.reduce((sum, quiz) => sum + (quiz.score / quiz.maxScore) * 100, 0) / quizResults.length;
  const highestScore = Math.max(...quizResults.map(quiz => (quiz.score / quiz.maxScore) * 100));
  const lowestScore = Math.min(...quizResults.map(quiz => (quiz.score / quiz.maxScore) * 100));
  
  // Sort by date (newest first)
  const sortedResults = [...quizResults].sort((a, b) => 
    new Date(b.attemptDate).getTime() - new Date(a.attemptDate).getTime()
  );

  // Calculate trend (compare last 3 with previous 3)
  const getTrend = () => {
    if (sortedResults.length < 2) return 'stable';
    
    const recent = sortedResults.slice(0, Math.min(3, sortedResults.length));
    const previous = sortedResults.slice(3, Math.min(6, sortedResults.length));
    
    if (previous.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((sum, quiz) => sum + (quiz.score / quiz.maxScore) * 100, 0) / recent.length;
    const previousAvg = previous.reduce((sum, quiz) => sum + (quiz.score / quiz.maxScore) * 100, 0) / previous.length;
    
    const difference = recentAvg - previousAvg;
    
    if (difference > 5) return 'up';
    if (difference < -5) return 'down';
    return 'stable';
  };

  const trend = getTrend();

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 80) return 'bg-blue-500';
    if (percentage >= 70) return 'bg-yellow-500';
    if (percentage >= 60) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getScoreBadgeVariant = (percentage: number): "default" | "secondary" | "destructive" | "outline" => {
    if (percentage >= 80) return 'default';
    if (percentage >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Award className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Quiz</p>
                <p className="text-2xl font-bold text-gray-900">{quizResults.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Ortalama Puan</p>
                <p className="text-2xl font-bold text-gray-900">%{Math.round(averageScore)}</p>
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
                <p className="text-sm font-medium text-gray-600">En Yüksek Puan</p>
                <p className="text-2xl font-bold text-gray-900">%{Math.round(highestScore)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                {getTrendIcon()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Trend</p>
                <p className={`text-2xl font-bold ${getTrendColor()}`}>
                  {trend === 'up' ? 'Yükseliş' : trend === 'down' ? 'Düşüş' : 'Stabil'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quiz Results List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Detaylı Quiz Sonuçları
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedResults.map((quiz, index) => {
              const percentage = (quiz.score / quiz.maxScore) * 100;
              return (
                <div key={quiz.quizId} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{quiz.quizTitle}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(quiz.attemptDate), 'dd MMM yyyy, HH:mm', { locale: tr })}
                        </span>
                        <span>{quiz.score}/{quiz.maxScore} puan</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={getScoreBadgeVariant(percentage)}>
                        %{Math.round(percentage)}
                      </Badge>
                      {index === 0 && (
                        <Badge variant="outline" className="text-xs">
                          En Son
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Progress value={percentage} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Performance indicator */}
                  <div className="mt-3 flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getScoreColor(percentage)}`}></div>
                    <span className="text-sm text-gray-600">
                      {percentage >= 90 ? 'Mükemmel' :
                       percentage >= 80 ? 'Çok İyi' :
                       percentage >= 70 ? 'İyi' :
                       percentage >= 60 ? 'Orta' : 'Geliştirilmeli'}
                    </span>
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