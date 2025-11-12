"use client";

import { useState } from "react";
import { CourseCard } from "@/components/course/CourseCard";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { useAuthStore } from "@/store";
import { toast } from "react-hot-toast";
import {
  useCourses,
  useStudentEnrollments,
  useEnrollInCourse,
} from "@/hooks/useCourseQuery";
import {
  Search,
  BookOpen,
  Users,
  TrendingUp,
  Star,
  Award,
  Zap,
  Sparkles,
  GraduationCap,
  Loader2,
  Grid3X3,
  List,
  ArrowRight,
  Play,
  Target,
} from "lucide-react";
import Link from "next/link";

export default function CoursesPage() {
  const { user } = useAuthStore();

  // React Query hooks
  const { data: coursesData, isLoading: isLoadingCourses } = useCourses();
  const { data: enrollmentsData } = useStudentEnrollments(
    user?.studentProfile?.id || user?.id || ""
  );
  const enrollMutation = useEnrollInCourse();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "beginner" | "intermediate" | "advanced"
  >("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Extract courses from API response
  const availableCourses = (coursesData as any)?.items || [];
  const enrolledCourses = enrollmentsData || [];

  const handleEnroll = async (courseId: string) => {
    if (!user) {
      toast.error(
        "Giriş Gerekli - Kursa kayıt olmak için giriş yapmanız gerekiyor."
      );
      return;
    }

    if (user.role !== "STUDENT") {
      toast.error("Yetki Hatası - Sadece öğrenciler kurslara kayıt olabilir.");
      return;
    }

    try {
      await enrollMutation.mutateAsync({ courseId, studentId: undefined });
      toast.success("Başarılı - Kursa başarıyla kayıt oldunuz!");
    } catch (error) {
      console.error("Hata - Kursa kayıt olurken bir hata oluştu:", error);
      toast.error("Hata - Kursa kayıt olurken bir hata oluştu.");
    }
  };

  const filteredCourses = Array.isArray(availableCourses)
    ? availableCourses.filter((course: any) => {
        const matchesSearch =
          course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.description?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = selectedFilter === "all" || true;

        return matchesSearch && matchesFilter;
      })
    : [];

  const enrolledCourseIds = new Set(
    enrolledCourses.map(
      (enrollment: any) => enrollment.courseId || enrollment.course?.id
    )
  );

  if (isLoadingCourses) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
              </div>
              <div className="text-center space-y-2">
                <div className="text-xl font-semibold text-gray-800">
                  Kurslar yükleniyor...
                </div>
                <div className="text-sm text-gray-500">
                  En iyi öğrenme deneyimi için hazırlanıyor
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Modern Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900">
        <div className="absolute inset-0 bg-black/20"></div>

        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center space-y-8 max-w-5xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-white/20">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white/90 font-medium">
                {availableCourses.length} Aktif Kurs
              </span>
              <Sparkles className="h-4 w-4 text-yellow-300" />
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-6xl md:text-7xl font-black text-white leading-tight tracking-tight">
                Öğrenme
                <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Yolculuğun
                </span>
                <span className="block text-5xl md:text-6xl">Başlasın</span>
              </h1>

              <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed font-light">
                Dünya standartlarında eğitimler, uzman mentorlar ve interaktif
                projelerle
                <span className="font-semibold text-white">
                  {" "}
                  kariyerinde fark yarat
                </span>
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Link href="/student/courses">
                <Button
                  size="lg"
                  className="group bg-white text-gray-900 hover:bg-gray-50 font-semibold px-8 py-4 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                >
                  <Play className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  Hemen Başla
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">
                  {availableCourses.length}+
                </div>
                <div className="text-blue-200 text-sm">Kurs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">
                  {availableCourses.reduce(
                    (sum: number, course: any) =>
                      sum + (course.enrollments?.length || 0),
                    0
                  )}
                  +
                </div>
                <div className="text-blue-200 text-sm">Öğrenci</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">
                  {
                    new Set(
                      availableCourses
                        .map((course: any) => course.teacherId)
                        .filter(Boolean)
                    ).size
                  }
                  +
                </div>
                <div className="text-blue-200 text-sm">Eğitmen</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="space-y-16">
          {/* Features Section */}
          <div className="grid gap-8 md:grid-cols-3 -mt-16 relative z-10 py-2">
            <Card className="group bg-white/90 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 rounded-3xl overflow-hidden">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Hedef Odaklı
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Kariyerinde fark yaratacak pratik beceriler kazanmak için
                  tasarlanmış kurslar
                </p>
                <div className="mt-4 text-3xl font-black text-blue-600">
                  {availableCourses.length}
                </div>
                <div className="text-sm text-gray-500">Aktif Kurs</div>
              </CardContent>
            </Card>

            <Card className="group bg-white/90 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 rounded-3xl overflow-hidden">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Topluluk
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Binlerce öğrenci ile birlikte öğren, deneyimlerini paylaş ve
                  network oluştur
                </p>
                <div className="mt-4 text-3xl font-black text-purple-600">
                  {availableCourses.reduce(
                    (sum: number, course: any) =>
                      sum + (course.enrollments?.length || 0),
                    0
                  )}
                  +
                </div>
                <div className="text-sm text-gray-500">Öğrenci</div>
              </CardContent>
            </Card>

            <Card className="group bg-white/90 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 rounded-3xl overflow-hidden">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Uzman Eğitmenler
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Sektörün en deneyimli profesyonellerinden birebir öğrenme
                  fırsatı
                </p>
                <div className="mt-4 text-3xl font-black text-orange-600">
                  {
                    new Set(
                      availableCourses
                        .map((course: any) => course.teacherId)
                        .filter(Boolean)
                    ).size
                  }
                  +
                </div>
                <div className="text-sm text-gray-500">Eğitmen</div>
              </CardContent>
            </Card>
          </div>

          {/* User Progress Status */}
          {user && user.role === "STUDENT" && enrolledCourses.length > 0 && (
            <Card className="bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 border-0 shadow-2xl rounded-3xl overflow-hidden">
              <CardContent className="p-8">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center">
                        <GraduationCap className="h-8 w-8 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-yellow-900">
                          🎉
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-2xl mb-2">
                        Harika gidiyorsun!
                      </h3>
                      <p className="text-gray-600 text-lg">
                        <span className="font-semibold text-emerald-600">
                          {enrolledCourses.length} kursa
                        </span>{" "}
                        kayıtlısın. Öğrenme yolculuğuna devam et! 🚀
                      </p>
                    </div>
                  </div>
                  <Button
                    asChild
                    size="lg"
                    className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white rounded-2xl px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Link href="/student/courses">
                      <BookOpen className="mr-2 h-5 w-5" />
                      Kurslarıma Git
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search and Filters */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <Search className="h-6 w-6 text-gray-400" />
                </div>
                <Input
                  placeholder="Hangi alanda uzmanlaşmak istiyorsun? (React, Python, Design...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-16 pr-6 py-4 text-lg border-2 border-gray-200 bg-white rounded-2xl shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 placeholder:text-gray-400"
                />
              </div>

              {/* Filters and View Toggle */}
              <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                <div className="flex gap-3 flex-wrap">
                  {[
                    { key: "all", label: "Tümü", icon: BookOpen },
                    { key: "beginner", label: "Başlangıç", icon: Zap },
                    { key: "intermediate", label: "Orta", icon: TrendingUp },
                    { key: "advanced", label: "İleri", icon: Award },
                  ].map(({ key, label, icon: Icon }) => (
                    <Button
                      key={key}
                      variant={selectedFilter === key ? "default" : "outline"}
                      onClick={() => setSelectedFilter(key as any)}
                      className={`rounded-2xl px-6 py-3 font-semibold transition-all duration-300 ${
                        selectedFilter === key
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                          : "bg-white/90 text-gray-700 hover:bg-white hover:shadow-md border-2 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {label}
                    </Button>
                  ))}
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-2 bg-gray-100 rounded-2xl p-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={`rounded-xl px-4 py-2 transition-all duration-200 ${
                      viewMode === "grid"
                        ? "bg-white shadow-sm text-gray-900"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Grid3X3 className="h-4 w-4 mr-2" />
                    Grid
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={`rounded-xl px-4 py-2 transition-all duration-200 ${
                      viewMode === "list"
                        ? "bg-white shadow-sm text-gray-900"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <List className="h-4 w-4 mr-2" />
                    Liste
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Course Grid/List */}
          {filteredCourses.length === 0 ? (
            <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-2xl rounded-3xl">
              <CardContent className="text-center py-20">
                <div className="max-w-lg mx-auto space-y-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto">
                      <BookOpen className="h-12 w-12 text-gray-400" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Search className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {searchTerm ? "Sonuç bulunamadı" : "Kurslar yükleniyor"}
                    </h3>
                    <p className="text-gray-600 text-lg leading-relaxed">
                      {searchTerm
                        ? "Farklı anahtar kelimeler deneyebilir veya filtreleri değiştirebilirsin"
                        : "Harika kurslar çok yakında burada olacak"}
                    </p>
                  </div>
                  {searchTerm && (
                    <Button
                      onClick={() => setSearchTerm("")}
                      variant="outline"
                      size="lg"
                      className="rounded-2xl px-8 py-3 border-2 border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-all duration-300"
                    >
                      <Search className="mr-2 h-4 w-4" />
                      Aramayı Temizle
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {/* Results Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {searchTerm
                      ? `"${searchTerm}" için sonuçlar`
                      : "Tüm Kurslar"}
                  </h2>
                  <p className="text-gray-600">
                    En kaliteli eğitimlerle kariyerinde fark yarat
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-4 py-2 rounded-full font-semibold"
                >
                  {filteredCourses.length} kurs bulundu
                </Badge>
              </div>

              {/* Course Grid */}
              <div
                className={`grid gap-8 ${
                  viewMode === "grid"
                    ? "md:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1 max-w-4xl mx-auto"
                }`}
              >
                {filteredCourses.map((course: any, index: number) => (
                  <div
                    key={course.id}
                    className="group"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CourseCard
                      course={course}
                      isEnrolled={enrolledCourseIds.has(course.id)}
                      onEnroll={
                        user?.role === "STUDENT" ? handleEnroll : undefined
                      }
                      isEnrolling={enrollMutation.isPending}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Call to Action */}
          {!user && (
            <Card className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 border-0 shadow-3xl overflow-hidden rounded-3xl">
              <div className="absolute inset-0 bg-black/20"></div>

              <CardContent className="relative text-center py-20 px-8">
                <div className="max-w-4xl mx-auto space-y-8">
                  {/* Icon Animation */}
                  <div className="flex items-center justify-center space-x-4 mb-8">
                    <Sparkles className="h-12 w-12 text-yellow-300 animate-pulse" />
                    <Star className="h-8 w-8 text-yellow-300 animate-pulse" />
                    <Sparkles className="h-12 w-12 text-yellow-300 animate-pulse" />
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-4xl md:text-5xl font-black text-white leading-tight">
                      Kariyerinde
                      <span className="block bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                        Fark Yarat
                      </span>
                    </h3>
                    <p className="text-xl text-indigo-100 max-w-3xl mx-auto leading-relaxed">
                      Dünya standartlarında eğitimler, uzman mentorlar ve
                      interaktif projelerle
                      <span className="font-semibold text-white">
                        {" "}
                        geleceğini şekillendir
                      </span>
                      . Binlerce başarılı öğrencimize katıl!
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-8 py-8 max-w-2xl mx-auto">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white">
                        {availableCourses.length}+
                      </div>
                      <div className="text-indigo-200 text-sm">Kurs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white">24/7</div>
                      <div className="text-indigo-200 text-sm">Destek</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white">∞</div>
                      <div className="text-indigo-200 text-sm">Erişim</div>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4">
                    <Button
                      asChild
                      size="lg"
                      className="group bg-white text-gray-900 hover:bg-gray-50 font-bold px-10 py-4 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                    >
                      <Link href="/register">
                        <Zap className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
                        Ücretsiz Başla
                        <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="border-2 border-white/30 text-white hover:bg-white/10 font-bold px-10 py-4 rounded-2xl backdrop-blur-sm hover:border-white/50 transition-all duration-300"
                    >
                      <Link href="/login">
                        <Users className="mr-3 h-6 w-6" />
                        Giriş Yap
                      </Link>
                    </Button>
                  </div>

                  {/* Trust Indicators */}
                  <div className="pt-8 text-center">
                    <p className="text-indigo-200 text-sm mb-4">
                      Güvenilir platform
                    </p>
                    <div className="flex items-center justify-center space-x-6 text-indigo-300">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm">4.9/5 Puan</span>
                      </div>
                      <div className="w-1 h-1 bg-indigo-300 rounded-full"></div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span className="text-sm">10K+ Öğrenci</span>
                      </div>
                      <div className="w-1 h-1 bg-indigo-300 rounded-full"></div>
                      <div className="flex items-center space-x-1">
                        <Award className="h-4 w-4" />
                        <span className="text-sm">Sertifikalı</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
