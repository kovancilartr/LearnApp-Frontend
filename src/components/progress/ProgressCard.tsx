'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Award,
  Download,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import { CourseProgress } from '@/lib/services';
import { cn } from '@/lib/utils';

interface ProgressCardProps {
  courseProgress: CourseProgress;
  showActions?: boolean;
  onGenerateCertificate?: (courseId: string) => void;
  isGeneratingCertificate?: boolean;
}

export function ProgressCard({ 
  courseProgress, 
  showActions = true,
  onGenerateCertificate,
  isGeneratingCertificate = false
}: ProgressCardProps) {
  const { 
    courseId, 
    courseTitle, 
    totalLessons, 
    completedLessons, 
    progressPercentage,
    sections,
    enrolledAt
  } = courseProgress;

  const isCompleted = progressPercentage === 100;
  const enrolledDate = new Date(enrolledAt).toLocaleDateString('tr-TR');

  // Calculate section progress
  const completedSections = sections.filter(section => 
    section.lessons.every(lesson => lesson.completed)
  ).length;

  return (
    <Card className={cn(
      "h-full transition-all duration-300 hover:shadow-lg",
      isCompleted && "ring-2 ring-green-200 bg-green-50/50"
    )}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg line-clamp-2 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            {courseTitle}
          </CardTitle>
          {isCompleted && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Award className="h-3 w-3 mr-1" />
              Tamamlandı
            </Badge>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground">
          Kayıt Tarihi: {enrolledDate}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">İlerleme</span>
            <span className={cn(
              "font-bold",
              isCompleted ? "text-green-600" : "text-blue-600"
            )}>
              {progressPercentage}%
            </span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-3"
          />
          <div className="text-xs text-center text-muted-foreground">
            {isCompleted ? (
              <span className="text-green-600 font-medium">
                🎉 Kurs tamamlandı!
              </span>
            ) : (
              `${completedLessons} / ${totalLessons} ders tamamlandı`
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-blue-50 rounded-lg">
            <CheckCircle className="h-4 w-4 mx-auto mb-1 text-blue-600" />
            <div className="text-xs font-medium text-blue-800">{completedLessons}</div>
            <div className="text-xs text-blue-600">Tamamlanan</div>
          </div>
          <div className="p-2 bg-purple-50 rounded-lg">
            <Clock className="h-4 w-4 mx-auto mb-1 text-purple-600" />
            <div className="text-xs font-medium text-purple-800">{totalLessons - completedLessons}</div>
            <div className="text-xs text-purple-600">Kalan</div>
          </div>
          <div className="p-2 bg-orange-50 rounded-lg">
            <TrendingUp className="h-4 w-4 mx-auto mb-1 text-orange-600" />
            <div className="text-xs font-medium text-orange-800">{completedSections}</div>
            <div className="text-xs text-orange-600">Bölüm</div>
          </div>
        </div>

        {/* Section Progress Preview */}
        {sections.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Bölüm İlerlemesi</div>
            <div className="space-y-1">
              {sections.slice(0, 3).map((section) => {
                const sectionCompleted = section.lessons.filter(l => l.completed).length;
                const sectionTotal = section.lessons.length;
                const sectionPercentage = sectionTotal > 0 ? (sectionCompleted / sectionTotal) * 100 : 0;
                
                return (
                  <div key={section.id} className="flex items-center gap-2 text-xs">
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium">{section.title}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${sectionPercentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-8 text-right">
                        {Math.round(sectionPercentage)}%
                      </span>
                    </div>
                  </div>
                );
              })}
              {sections.length > 3 && (
                <div className="text-xs text-muted-foreground text-center">
                  +{sections.length - 3} bölüm daha
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {showActions && (
          <div className="space-y-2 pt-2">
            <Button asChild className="w-full" variant="outline">
              <Link href={`/student/courses/${courseId}`}>
                <Eye className="h-4 w-4 mr-2" />
                Kursu Görüntüle
              </Link>
            </Button>
            
            {isCompleted && onGenerateCertificate && (
              <Button 
                onClick={() => onGenerateCertificate(courseId)}
                disabled={isGeneratingCertificate}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              >
                {isGeneratingCertificate ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Hazırlanıyor...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Sertifika İndir
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}