'use client';

import { Course } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, Users, Play } from 'lucide-react';
import { useGlobalProgress } from '@/hooks/useGlobalProgress';
import { useEffect } from 'react';
import Link from 'next/link';
import { CourseEnrollmentButton } from './CourseEnrollmentButton';

interface CourseCardProps {
  course: Course;
  isEnrolled?: boolean;
  onEnroll?: (courseId: string) => void;
  isEnrolling?: boolean;
  showProgress?: boolean;
  progress?: number;
}

export function CourseCard({ 
  course, 
  isEnrolled = false, 
  onEnroll, 
  isEnrolling = false,
  showProgress = false,
  progress = 0
}: CourseCardProps) {
  const { 
    getCourseProgressPercentage, 
    getCompletedLessonsCount, 
    getTotalLessonsCount,
    ensureCourseProgress 
  } = useGlobalProgress();

  // Initialize progress for enrolled courses
  useEffect(() => {
    if (isEnrolled) {
      ensureCourseProgress(course.id);
    }
  }, [isEnrolled, course.id, ensureCourseProgress]); // Remove ensureCourseProgress from dependencies

  const totalLessons = (course as any).sections?.reduce((sum: number, section: any) => 
    sum + (section.lessons?.length || 0), 0) || 0;
  
  const totalQuizzes = (course as any).quizzes?.length || 0;
  const enrollmentCount = (course as any).enrollments?.length || 0;

  // Get real-time progress from store for enrolled courses
  const realTimeProgress = isEnrolled ? getCourseProgressPercentage(course.id) : progress;
  const completedLessons = isEnrolled ? getCompletedLessonsCount(course.id) : 0;
  const storeTotalLessons = isEnrolled ? getTotalLessonsCount(course.id) : totalLessons;

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
            {course.title}
          </CardTitle>
          {isEnrolled && (
            <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
              <BookOpen className="h-3 w-3 mr-1" />
              Kayıtlı
            </Badge>
          )}
        </div>
        {course.description && (
          <p className="text-sm text-muted-foreground line-clamp-3 mt-2">
            {course.description}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Course Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-blue-50 rounded-lg">
            <BookOpen className="h-4 w-4 mx-auto mb-1 text-blue-600" />
            <div className="text-xs font-medium text-blue-800">{totalLessons}</div>
            <div className="text-xs text-blue-600">Ders</div>
          </div>
          <div className="p-2 bg-purple-50 rounded-lg">
            <Clock className="h-4 w-4 mx-auto mb-1 text-purple-600" />
            <div className="text-xs font-medium text-purple-800">{totalQuizzes}</div>
            <div className="text-xs text-purple-600">Quiz</div>
          </div>
          <div className="p-2 bg-orange-50 rounded-lg">
            <Users className="h-4 w-4 mx-auto mb-1 text-orange-600" />
            <div className="text-xs font-medium text-orange-800">{enrollmentCount}</div>
            <div className="text-xs text-orange-600">Öğrenci</div>
          </div>
        </div>

        {/* Teacher Info */}
        {(course as any).teacher && (
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <Users className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Eğitmen</div>
              <div className="text-sm font-medium">{(course as any).teacher.user.name}</div>
            </div>
          </div>
        )}

        {/* Progress Bar (for enrolled courses) */}
        {showProgress && isEnrolled && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">İlerleme</span>
              <span className="text-blue-600 font-bold">{realTimeProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 relative overflow-hidden"
                style={{ width: `${realTimeProgress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>
            <div className="text-xs text-center text-muted-foreground">
              {realTimeProgress === 100 ? '🎉 Tamamlandı!' : `${completedLessons} / ${storeTotalLessons || totalLessons} ders`}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          {isEnrolled ? (
            <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
              <Link href={`/student/courses/${course.id}`}>
                <Play className="h-4 w-4 mr-2" />
                {realTimeProgress === 100 ? 'Kursu Gözden Geçir' : 'Kursa Devam Et'}
              </Link>
            </Button>
          ) : (
            <div className="space-y-2">
              <Button asChild variant="outline" className="w-full hover:bg-blue-50 hover:border-blue-300">
                <Link href={`/student/courses/${course.id}`}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Detayları Gör
                </Link>
              </Button>
              <CourseEnrollmentButton 
                courseId={course.id}
                courseTitle={course.title}
                isEnrolled={isEnrolled}
                className="w-full"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}