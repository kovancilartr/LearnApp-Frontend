"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { RoleGuard } from "@/components/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store";
import { courseService } from "@/lib/services";
import { Course } from "@/types";
import { useCreateEnrollmentRequest, useStudentEnrollmentRequests } from "@/hooks/useCourseQuery";
import { useGlobalProgress } from "@/hooks/useGlobalProgress";
import {
  BookOpen,
  Play,
  CheckCircle,
  Clock,
  FileText,
  Award,
  ChevronRight,
  Users,
  Loader2,
  UserPlus,
} from "lucide-react";
import Link from "next/link";

export default function StudentCourseDetailPage() {
  const params = useParams();

  const { user } = useAuthStore();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentRequestStatus, setEnrollmentRequestStatus] = useState<'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED'>('NONE');

  // Progress store integration
  const { 
    getCourseProgressPercentage, 
    getCompletedLessonsCount, 
    getTotalLessonsCount,
    getLessonCompletionStatus,
    ensureCourseProgress 
  } = useGlobalProgress();

  // React Query hooks
  const createEnrollmentRequestMutation = useCreateEnrollmentRequest();
  const studentId = user?.studentProfile?.id || user?.id;
  const { data: enrollmentRequests } = useStudentEnrollmentRequests(studentId || "");

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch course details
        const courseData = await courseService.getCourse(courseId);
        setCourse(courseData);

        if (user?.id) {
          // For enrollment check, we need to use the actual student profile ID
          // Check if student is enrolled using the new endpoint
          try {
            const enrollments = await courseService.getMyEnrollments();
            const isStudentEnrolled = enrollments.some(
              (enrollment) => enrollment.courseId === courseId
            );
            setIsEnrolled(isStudentEnrolled);

            // If enrolled, initialize progress store
            if (isStudentEnrolled && user?.studentProfile?.id) {
              await ensureCourseProgress(courseId);
            }
          } catch (enrollmentError) {
            console.error('Error checking enrollments:', enrollmentError);
            // If we can't check enrollments, assume not enrolled
            setIsEnrolled(false);
          }
        }
      } catch (error) {
        console.error('Error fetching course:', error);
        toast.error("Kurs bilgileri yüklenirken bir hata oluştu.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, user?.id, user?.studentProfile?.id, ensureCourseProgress]);

  // Check enrollment request status
  useEffect(() => {
    if (enrollmentRequests && courseId) {
      const request = enrollmentRequests.find((req: any) => req.courseId === courseId);
      if (request) {
        setEnrollmentRequestStatus(request.status);
      } else {
        setEnrollmentRequestStatus('NONE');
      }
    }
  }, [enrollmentRequests, courseId]);

  const handleEnrollmentRequest = async () => {
    if (!user?.id) {
      toast.error("Kursa kayıt başvurusu yapmak için giriş yapmanız gerekiyor.");
      return;
    }

    try {
      await createEnrollmentRequestMutation.mutateAsync({
        courseId,
        message: "Kursa katılmak istiyorum."
      });
      
      setEnrollmentRequestStatus('PENDING');
      toast.success("Kursa kayıt başvurunuz gönderildi! Admin onayını bekliyor.");
    } catch (error) {
      console.error('Error creating enrollment request:', error);
      toast.error("Kayıt başvurusu gönderilirken bir hata oluştu.");
    }
  };

  const totalLessons = course?.sections?.reduce(
    (sum, section) => sum + (section.lessons?.length || 0),
    0
  ) || 0;

  // Get real-time progress from store
  const progressPercentage = isEnrolled ? getCourseProgressPercentage(courseId) : 0;
  const completedCount = isEnrolled ? getCompletedLessonsCount(courseId) : 0;
  const storeTotalLessons = isEnrolled ? getTotalLessonsCount(courseId) : totalLessons;

  if (isLoading) {
    return (
      <RoleGuard allowedRoles={["STUDENT"]}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <div className="text-lg">Kurs yükleniyor...</div>
          </div>
        </div>
      </RoleGuard>
    );
  }

  if (!course) {
    return (
      <RoleGuard allowedRoles={["STUDENT"]}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Kurs Bulunamadı</h2>
            <p className="text-muted-foreground mb-4">
              Aradığınız kurs mevcut değil.
            </p>
            <Button asChild>
              <Link href="/student/courses">Kurslarıma Dön</Link>
            </Button>
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={["STUDENT"]}>
      <div className="space-y-6">
        {/* Course Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <p className="text-muted-foreground max-w-2xl">
              {course.description}
            </p>
            {(course as Course).teacher && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                <span>Eğitmen: {(course as Course).teacher?.user.name}</span>
              </div>
            )}
          </div>
          {isEnrolled ? (
            <Badge className="bg-green-100 text-green-800 border-green-300">
              Kayıtlı
            </Badge>
          ) : (
            <Badge variant="outline" className="border-orange-300 text-orange-700">
              Kayıt Gerekli
            </Badge>
          )}
        </div>

        {/* Enrollment Card */}
        {!isEnrolled && (
          <Card className={`border-2 ${
            enrollmentRequestStatus === 'PENDING' 
              ? 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200'
              : enrollmentRequestStatus === 'REJECTED'
              ? 'bg-gradient-to-br from-red-50 to-pink-100 border-red-200'
              : 'bg-gradient-to-br from-orange-50 to-yellow-100 border-orange-200'
          }`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${
                enrollmentRequestStatus === 'PENDING' 
                  ? 'text-blue-900'
                  : enrollmentRequestStatus === 'REJECTED'
                  ? 'text-red-900'
                  : 'text-orange-900'
              }`}>
                {enrollmentRequestStatus === 'PENDING' ? (
                  <>
                    <Clock className="h-6 w-6 text-blue-600" />
                    Başvuru Beklemede
                  </>
                ) : enrollmentRequestStatus === 'REJECTED' ? (
                  <>
                    <UserPlus className="h-6 w-6 text-red-600" />
                    Başvuru Reddedildi
                  </>
                ) : (
                  <>
                    <UserPlus className="h-6 w-6 text-orange-600" />
                    Kursa Kayıt Ol
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {enrollmentRequestStatus === 'PENDING' ? (
                  <>
                    <p className="text-blue-800">
                      Kursa kayıt başvurunuz admin onayını bekliyor. Onaylandığında size bildirilecektir.
                    </p>
                    <div className="flex items-center gap-2 p-3 bg-blue-100 rounded-lg">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <span className="text-blue-800 font-medium">Durum: Onay Bekliyor</span>
                    </div>
                  </>
                ) : enrollmentRequestStatus === 'REJECTED' ? (
                  <>
                    <p className="text-red-800">
                      Kursa kayıt başvurunuz reddedildi. Tekrar başvuru yapabilirsiniz.
                    </p>
                    <Button 
                      onClick={handleEnrollmentRequest}
                      disabled={createEnrollmentRequestMutation.isPending}
                      className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
                    >
                      {createEnrollmentRequestMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Başvuru Gönderiliyor...
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Tekrar Başvur
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-orange-800">
                      Bu kursa erişim sağlamak için kayıt başvurusu yapmanız gerekiyor. Başvurunuz admin tarafından değerlendirilecektir.
                    </p>
                    <Button 
                      onClick={handleEnrollmentRequest}
                      disabled={createEnrollmentRequestMutation.isPending}
                      className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700"
                    >
                      {createEnrollmentRequestMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Başvuru Gönderiliyor...
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Kayıt Başvurusu Yap
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress Overview */}
        {isEnrolled && (
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Award className="h-6 w-6 text-blue-600" />
                İlerleme Durumu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-blue-800 font-medium">Tamamlanan Dersler</span>
                  <span className="text-blue-900 font-bold text-lg">
                    {completedCount} / {storeTotalLessons || totalLessons}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <Progress value={progressPercentage} className="h-4 bg-blue-200" />
                  <div className="flex justify-between text-sm text-blue-700">
                    <span>%{progressPercentage} tamamlandı</span>
                    <span>{(storeTotalLessons || totalLessons) - completedCount} ders kaldı</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white/60 rounded-lg border border-blue-200">
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      {storeTotalLessons || totalLessons}
                    </div>
                    <div className="text-sm text-blue-800 font-medium">
                      Toplam Ders
                    </div>
                  </div>
                  <div className="text-center p-4 bg-white/60 rounded-lg border border-green-200">
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      {completedCount}
                    </div>
                    <div className="text-sm text-green-800 font-medium">
                      Tamamlanan
                    </div>
                  </div>
                  <div className="text-center p-4 bg-white/60 rounded-lg border border-orange-200">
                    <div className="text-3xl font-bold text-orange-600 mb-1">
                      {(course as Course).quizzes?.length || 0}
                    </div>
                    <div className="text-sm text-orange-800 font-medium">Quiz</div>
                  </div>
                </div>

                {progressPercentage === 100 && (
                  <div className="text-center p-4 bg-green-100 border border-green-300 rounded-lg">
                    <div className="text-green-800 font-semibold">🎉 Tebrikler!</div>
                    <div className="text-green-700 text-sm">Bu kursu başarıyla tamamladınız!</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Course Content */}
        {isEnrolled && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Sections and Lessons */}
            <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-semibold">Kurs İçeriği</h2>

            {(course as Course).sections?.map((section, sectionIndex) => (
              <Card key={section.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    {sectionIndex + 1}. {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {section.lessons?.map((lesson, lessonIndex) => {
                      const isCompleted = getLessonCompletionStatus(courseId, lesson.id);
                      return (
                        <div
                          key={lesson.id}
                          className={`group relative p-4 border-2 rounded-lg transition-all duration-200 ${
                            isCompleted
                              ? "border-green-200 bg-green-50 hover:bg-green-100"
                              : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div
                                className={`p-3 rounded-full transition-colors ${
                                  isCompleted
                                    ? "bg-green-200 text-green-700"
                                    : "bg-blue-100 text-blue-600 group-hover:bg-blue-200"
                                }`}
                              >
                                {isCompleted ? (
                                  <CheckCircle className="h-5 w-5" />
                                ) : (
                                  <Play className="h-5 w-5" />
                                )}
                              </div>
                              <div>
                                <h4 className={`font-semibold text-lg ${
                                  isCompleted ? "text-green-800" : "text-gray-900"
                                }`}>
                                  {sectionIndex + 1}.{lessonIndex + 1} {lesson.title}
                                </h4>
                                <div className="flex items-center gap-3 mt-1">
                                  {lesson.videoUrl && (
                                    <span className="flex items-center gap-1 text-sm text-red-600 bg-red-100 px-2 py-1 rounded-full">
                                      <Play className="h-3 w-3" />
                                      Video
                                    </span>
                                  )}
                                  {lesson.content && (
                                    <span className="flex items-center gap-1 text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                                      <FileText className="h-3 w-3" />
                                      İçerik
                                    </span>
                                  )}
                                  {lesson.pdfUrl && (
                                    <span className="flex items-center gap-1 text-sm text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                                      <FileText className="h-3 w-3" />
                                      PDF
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {isCompleted && (
                                <Badge variant="secondary" className="bg-green-200 text-green-800">
                                  Tamamlandı
                                </Badge>
                              )}
                              <Button asChild className={`${
                                isCompleted 
                                  ? "bg-green-600 hover:bg-green-700" 
                                  : "bg-blue-600 hover:bg-blue-700"
                              }`}>
                                <Link
                                  href={`/student/courses/${courseId}/lessons/${lesson.id}`}
                                >
                                  {isCompleted ? "Tekrar İzle" : "Başla"}
                                  <ChevronRight className="h-4 w-4 ml-2" />
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-gradient-to-br from-indigo-50 to-purple-100 border-indigo-200">
              <CardHeader>
                <CardTitle className="text-indigo-900">Hızlı İşlemler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                  <Link
                    href={`/student/courses/${courseId}/lessons/${
                      (course as Course).sections?.[0]?.lessons?.[0]?.id
                    }`}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {progressPercentage === 0 ? "Kursa Başla" : "Derslere Devam Et"}
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full border-purple-300 text-purple-700 hover:bg-purple-50">
                  <Link href={`/student/progress`}>
                    <Award className="h-4 w-4 mr-2" />
                    İlerleme Raporu
                  </Link>
                </Button>
                {progressPercentage === 100 && (
                  <Button asChild variant="outline" className="w-full border-green-300 text-green-700 hover:bg-green-50">
                    <Link href={`/student/courses`}>
                      <BookOpen className="h-4 w-4 mr-2" />
                      Diğer Kurslar
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Quizzes */}
            {(course as Course).quizzes &&
              (course as Course).quizzes!.length > 0 && (
                <Card className="bg-gradient-to-br from-orange-50 to-red-100 border-orange-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-900">
                      <Clock className="h-5 w-5 text-orange-600" />
                      Quizler
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(course as Course).quizzes!.map((quiz, index) => (
                      <div
                        key={quiz.id}
                        className="p-4 bg-white/70 border border-orange-200 rounded-lg hover:bg-white/90 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-orange-900">
                              Quiz {index + 1}: {quiz.title}
                            </h4>
                            <div className="flex items-center gap-3 mt-2 text-sm">
                              <span className="flex items-center gap-1 text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                                <Clock className="h-3 w-3" />
                                {quiz.duration
                                  ? `${Math.floor(quiz.duration / 60)} dk`
                                  : "Sınırsız"}
                              </span>
                              <span className="flex items-center gap-1 text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                                <Users className="h-3 w-3" />
                                {quiz.attemptsAllowed} deneme
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button asChild className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                          <Link
                            href={`/student/courses/${courseId}/quizzes/${quiz.id}`}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Quiz'i Başlat
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

            {/* Course Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Kurs İstatistikleri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Toplam Bölüm
                  </span>
                  <span className="font-medium">
                    {(course as Course).sections?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Toplam Ders
                  </span>
                  <span className="font-medium">{storeTotalLessons || totalLessons}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Toplam Quiz
                  </span>
                  <span className="font-medium">
                    {(course as Course).quizzes?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Tamamlanma
                  </span>
                  <span className="font-medium">{progressPercentage}%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        )}
      </div>
    </RoleGuard>
  );
}
