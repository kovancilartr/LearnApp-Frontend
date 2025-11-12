'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { RoleGuard } from '@/components/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useCourse } from '@/hooks/useCourseQuery';
import { Course } from '@/types';
import { 
  ArrowLeft, 
  Edit, 
  Plus, 
  Users, 
  BookOpen, 
  FileText,
  Play,
  Award,
  MoreVertical,
  Trash2,
  Eye,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;
  
  const { 
    data: course, 
    isLoading,
    error
  } = useCourse(courseId);

  const [activeTab, setActiveTab] = useState('overview');
  
  const totalLessons = course?.sections?.reduce((total, section) => 
    total + (section.lessons?.length || 0), 0
  ) || 0;

  const totalStudents = course?.enrollments?.length || 0;
  const courseQuizzes = course?.quizzes || [];

  if (isLoading) {
    return (
      <RoleGuard allowedRoles={['TEACHER']}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <div className="ml-3 text-lg">Kurs yükleniyor...</div>
        </div>
      </RoleGuard>
    );
  }

  if (error || !course) {
    return (
      <RoleGuard allowedRoles={['TEACHER']}>
        <div className="flex flex-col items-center justify-center py-12">
          <h3 className="text-lg font-semibold mb-2">Kurs bulunamadı</h3>
          <p className="text-muted-foreground mb-4">
            Aradığınız kurs mevcut değil veya erişim yetkiniz bulunmuyor.
          </p>
          <Link href="/dashboard/teacher/courses">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kurslara Dön
            </Button>
          </Link>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={['TEACHER']}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/teacher/courses">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Geri
              </Button>
            </Link>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">{course.title}</h2>
              <p className="text-muted-foreground">
                {course.description || 'Açıklama eklenmemiş'}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Link href={`/dashboard/teacher/courses/${courseId}/edit`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Düzenle
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Kursu Sil
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Öğrenci Sayısı</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                Kayıtlı öğrenci
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bölüm Sayısı</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{course?.sections?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Kurs bölümü
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ders Sayısı</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLessons}</div>
              <p className="text-xs text-muted-foreground">
                Toplam ders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sınav Sayısı</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courseQuizzes.length}</div>
              <p className="text-xs text-muted-foreground">
                Aktif sınav
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
            <TabsTrigger value="content">İçerik</TabsTrigger>
            <TabsTrigger value="quizzes">Sınavlar</TabsTrigger>
            <TabsTrigger value="students">Öğrenciler</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Kurs Bilgileri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Oluşturulma Tarihi:</span>
                    <span className="text-sm text-muted-foreground">
                      {course.createdAt ? new Date(course.createdAt).toLocaleDateString('tr-TR') : 'Tarih yok'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Son Güncelleme:</span>
                    <span className="text-sm text-muted-foreground">
                      {course.updatedAt ? new Date(course.updatedAt).toLocaleDateString('tr-TR') : 'Bilinmiyor'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Durum:</span>
                    <Badge variant="secondary">Aktif</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Hızlı İşlemler</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href={`/dashboard/teacher/courses/${courseId}/sections/new`} className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Plus className="mr-2 h-4 w-4" />
                      Yeni Bölüm Ekle
                    </Button>
                  </Link>
                  <Link href={`/dashboard/teacher/courses/${courseId}/quizzes/new`} className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Plus className="mr-2 h-4 w-4" />
                      Yeni Sınav Oluştur
                    </Button>
                  </Link>
                  <Link href={`/dashboard/teacher/courses/${courseId}/students`} className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="mr-2 h-4 w-4" />
                      Öğrenci Yönetimi
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">Kurs İçerik Yönetimi</h3>
                  <p className="text-muted-foreground mb-4">
                    Kurs içeriği yönetimi geliştirme aşamasındadır.
                  </p>
                  <div className="space-y-2">
                    <Link href={`/dashboard/teacher/courses/${courseId}/sections/new`}>
                      <Button className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Yeni Bölüm Ekle
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quizzes" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Sınavlar</h3>
              <Link href={`/dashboard/teacher/courses/${courseId}/quizzes/new`}>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Sınav Oluştur
                </Button>
              </Link>
            </div>

            {courseQuizzes.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Henüz sınav oluşturulmamış</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Öğrencilerinizi değerlendirmek için sınavlar oluşturun.
                  </p>
                  <Link href={`/dashboard/teacher/courses/${courseId}/quizzes/new`}>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      İlk Sınavı Oluştur
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {courseQuizzes.map((quiz) => (
                  <Card key={quiz.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{quiz.title}</span>
                        <Badge variant="outline">
                          {quiz.questions.length} soru
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Süre:</span>
                          <span>
                            {quiz.duration ? `${Math.floor(quiz.duration / 60)} dakika` : 'Sınırsız'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Deneme Hakkı:</span>
                          <span>{quiz.attemptsAllowed}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Toplam Deneme:</span>
                          <span>{quiz.attempts?.length || 0}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2 pt-4">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="mr-2 h-4 w-4" />
                          Önizle
                        </Button>
                        <Link href={`/dashboard/teacher/quizzes/${quiz.id}/edit`} className="flex-1">
                          <Button size="sm" className="w-full">
                            <Edit className="mr-2 h-4 w-4" />
                            Düzenle
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Kayıtlı Öğrenciler</h3>
              <Badge variant="secondary">
                {totalStudents} öğrenci
              </Badge>
            </div>

            {totalStudents === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Henüz öğrenci kaydı yok</h3>
                  <p className="text-muted-foreground text-center">
                    Öğrenciler kursa kayıt olduğunda burada görünecekler.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {course.enrollments?.map((enrollment) => (
                  <Card key={enrollment.id}>
                    <CardContent className="flex items-center justify-between p-6">
                      <div>
                        <h4 className="font-medium">
                          {enrollment.student?.user.name || 'İsimsiz Öğrenci'}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {enrollment.student?.user.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Kayıt: {new Date(enrollment.createdAt).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">Aktif</Badge>
                        <Button variant="outline" size="sm">
                          İlerlemeyi Gör
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </RoleGuard>
  );
}