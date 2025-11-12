'use client';

import { useState } from 'react';
import Link from 'next/link';
import { RoleGuard } from '@/components/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useTeacherCourses } from '@/hooks/useCourseQuery';
import { 
  BookOpen, 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Eye,
  Calendar,
  FileText,
  Loader2
} from 'lucide-react';

export default function TeacherCoursesPage() {
  const { 
    data: courses, 
    isLoading: isLoadingCourses,
    error 
  } = useTeacherCourses();
  
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCourses = (courses || []).filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <RoleGuard allowedRoles={['TEACHER']}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Kurslarım</h2>
            <p className="text-muted-foreground">
              Kurslarınızı yönetin ve içerik oluşturun
            </p>
          </div>
          <Link href="/dashboard/teacher/courses/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Kurs Oluştur
            </Button>
          </Link>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Kurs ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {isLoadingCourses ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <div className="ml-3 text-lg">Kurslar yükleniyor...</div>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <div className="text-lg text-red-600 mb-2">
                  Kurslar yüklenirken hata oluştu
                </div>
                <p className="text-gray-600">
                  Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : filteredCourses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? 'Kurs bulunamadı' : 'Henüz kurs oluşturmadınız'}
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm 
                  ? 'Arama kriterlerinize uygun kurs bulunamadı.'
                  : 'İlk kursunuzu oluşturarak öğrencilerinizle içerik paylaşmaya başlayın.'
                }
              </p>
              {!searchTerm && (
                <Link href="/dashboard/teacher/courses/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    İlk Kursunuzu Oluşturun
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <span className="line-clamp-2">{course.title}</span>
                    <Badge variant="secondary" className="ml-2">
                      {(course as any).sections?.length || 0} bölüm
                    </Badge>
                  </CardTitle>
                  {course.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {course.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <Users className="mr-1 h-4 w-4" />
                        {(course as any).enrollments?.length || 0} öğrenci
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="mr-1 h-4 w-4" />
                        {course.createdAt ? new Date(course.createdAt).toLocaleDateString('tr-TR') : 'Tarih yok'}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <FileText className="mr-1 h-4 w-4" />
                        {(course as any).sections?.reduce((total: number, section: any) => 
                          total + (section.lessons?.length || 0), 0
                        ) || 0} ders
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <BookOpen className="mr-1 h-4 w-4" />
                        {(course as any).quizzes?.length || 0} sınav
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Link href={`/dashboard/teacher/courses/${course.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="mr-2 h-4 w-4" />
                          Görüntüle
                        </Button>
                      </Link>
                      <Link href={`/dashboard/teacher/courses/${course.id}/edit`} className="flex-1">
                        <Button size="sm" className="w-full">
                          <Edit className="mr-2 h-4 w-4" />
                          Düzenle
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}