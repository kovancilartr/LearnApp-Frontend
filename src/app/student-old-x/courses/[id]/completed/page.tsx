"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import { courseService } from "@/lib/services";
import { useProgressStore } from "@/store/progressStore";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import {
  CheckCircle,
  Trophy,
  Star,
  BookOpen,
  Clock,
  Award,
  ArrowRight,
  Home,
  Loader2,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description?: string;
  sections: Array<{
    id: string;
    title: string;
    lessons: Array<{
      id: string;
      title: string;
    }>;
  }>;
}

export default function CourseCompletedPage() {
  const params = useParams();
  const router = useRouter();

  const { user } = useAuth();

  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { getCourseProgress } = useProgressStore();
  const courseProgress = getCourseProgress(courseId);

  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setIsLoading(true);
        const courseData = await courseService.getCourse(courseId);
        setCourse(courseData as Course);
      } catch (error) {
        console.error("Error fetching course:", error);
        toast.error("Kurs bilgileri yüklenirken bir hata oluştu.");
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId, toast]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Kurs Bulunamadı</h2>
          <p className="text-muted-foreground mb-4">
            Aradığınız kurs mevcut değil veya erişim izniniz bulunmuyor.
          </p>
          <Button asChild>
            <Link href="/student/courses">Kurslarıma Dön</Link>
          </Button>
        </div>
      </div>
    );
  }

  const totalLessons = courseProgress?.totalLessons || 0;
  const completedLessons = courseProgress?.completedLessons || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-green-950/20 dark:via-blue-950/20 dark:to-purple-950/20">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Celebration Header */}
          <div className="text-center mb-12">
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                <Trophy className="h-16 w-16 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Tebrikler! 🎉
            </h1>

            <p className="text-xl text-muted-foreground mb-2">
              <span className="font-semibold text-foreground">
                {course.title}
              </span>{" "}
              kursunu başarıyla tamamladınız!
            </p>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span>Harika bir başarı!</span>
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-bold text-2xl text-green-700 dark:text-green-300 mb-1">
                  {completedLessons}
                </h3>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Ders Tamamlandı
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Award className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-bold text-2xl text-blue-700 dark:text-blue-300 mb-1">
                  %100
                </h3>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Tamamlanma Oranı
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-bold text-2xl text-purple-700 dark:text-purple-300 mb-1">
                  {course.sections.length}
                </h3>
                <p className="text-sm text-purple-600 dark:text-purple-400">
                  Bölüm Tamamlandı
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Achievement Badge */}
          <Card className="mb-8 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/50 dark:to-orange-950/50">
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
                    Kurs Tamamlama Rozeti
                  </h3>
                  <p className="text-yellow-700 dark:text-yellow-300">
                    Bu başarınız profilinize eklendi
                  </p>
                </div>
              </div>

              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 text-sm">
                <Star className="h-4 w-4 mr-2 fill-current" />
                {course.title} - Sertifika Sahibi
              </Badge>
            </CardContent>
          </Card>

          {/* Course Summary */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <BookOpen className="h-6 w-6 text-blue-600" />
                Kurs Özeti
              </h3>

              <div className="space-y-4">
                {course.sections.map((section, index) => (
                  <div
                    key={section.id}
                    className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">
                        {index + 1}. {section.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {section.lessons.length} ders tamamlandı
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-green-600 border-green-300"
                    >
                      Tamamlandı
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
            >
              <Link href="/student/courses">
                <Home className="h-5 w-5 mr-2" />
                Kurslarıma Dön
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900/20"
            >
              <Link href="/student/progress">
                <ArrowRight className="h-5 w-5 mr-2" />
                İlerleme Raporunu Gör
              </Link>
            </Button>
          </div>

          {/* Motivational Message */}
          <div className="text-center mt-12 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-2xl">
            <p className="text-lg text-muted-foreground italic">
              "Öğrenme yolculuğunuz devam ediyor. Bu başarı, daha büyük
              hedeflere ulaşmanın ilk adımı!"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
