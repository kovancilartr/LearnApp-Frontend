'use client';

import { useEffect, useState } from 'react';
import { RoleGuard } from '@/components/auth';
import { CourseCard } from '@/components/course/CourseCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useCourseStore } from '@/store';
import { toast } from 'react-hot-toast';
import { useGlobalProgress } from '@/hooks/useGlobalProgress';
import { Search, BookOpen, Clock, TrendingUp } from 'lucide-react';

export default function StudentCoursesPage() {

  const {
    enrolledCourses,
    availableCourses,
    isLoadingCourses,
    isEnrolling,
    error,
    fetchEnrolledCourses,
    fetchAvailableCourses,
    enrollInCourse,
  } = useCourseStore();

  const { getOverallProgress, ensureCourseProgress } = useGlobalProgress();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('enrolled');

  useEffect(() => {
    fetchEnrolledCourses();
    fetchAvailableCourses();
  }, [fetchEnrolledCourses, fetchAvailableCourses]);

  // Initialize progress for all enrolled courses
  useEffect(() => {
    if (enrolledCourses && enrolledCourses.length > 0) {
      enrolledCourses.forEach(course => {
        ensureCourseProgress(course.id);
      });
    }
  }, [enrolledCourses, enrolledCourses.length, ensureCourseProgress]); // Only depend on length, not the whole array

  useEffect(() => {
    if (error) {
      toast.error(`Hata: ${error.error.message}`);
    }
  }, [error, toast]);

  const handleEnroll = async (courseId: string) => {
    try {
      const enrollment = await enrollInCourse(courseId);
      if (enrollment) {
        toast.success("Başarılı - Kursa başarıyla kayıt oldunuz!");
        // Refresh courses
        fetchEnrolledCourses();
        fetchAvailableCourses();
      }
    } catch (error) {
      toast.error("Hata - Kursa kayıt olurken bir hata oluştu.");
    }
  };

  const filteredEnrolledCourses = (enrolledCourses || []).filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAvailableCourses = (availableCourses || []).filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get overall progress from store
  const overallProgress = getOverallProgress();

  if (isLoadingCourses) {
    return (
      <RoleGuard allowedRoles={['STUDENT']}>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Kurslar yükleniyor...</div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={['STUDENT']}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Kurslarım</h2>
          <p className="text-muted-foreground">
            Kayıtlı olduğunuz kurslara devam edin veya yeni kurslara kayıt olun
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">Kayıtlı Kurslar</CardTitle>
              <div className="p-2 bg-blue-200 rounded-lg">
                <BookOpen className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{enrolledCourses?.length || 0}</div>
              <p className="text-xs text-blue-700 mt-1">
                Aktif kayıtlarınız
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Mevcut Kurslar</CardTitle>
              <div className="p-2 bg-green-200 rounded-lg">
                <Clock className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">{availableCourses?.length || 0}</div>
              <p className="text-xs text-green-700 mt-1">
                Kayıt olabileceğiniz kurslar
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">Ortalama İlerleme</CardTitle>
              <div className="p-2 bg-purple-200 rounded-lg">
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">
                {overallProgress.percentage}%
              </div>
              <p className="text-xs text-purple-700 mt-1">
                {overallProgress.completed} / {overallProgress.total} ders tamamlandı
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Kurs ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="enrolled">
              Kayıtlı Kurslarım ({filteredEnrolledCourses.length})
            </TabsTrigger>
            <TabsTrigger value="available">
              Mevcut Kurslar ({filteredAvailableCourses.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="enrolled" className="space-y-4">
            {filteredEnrolledCourses.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">
                    {searchTerm ? 'Arama sonucu bulunamadı' : 'Henüz kayıtlı kursunuz yok'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm 
                      ? 'Farklı anahtar kelimeler deneyebilirsiniz'
                      : 'Mevcut kurslar sekmesinden kurslara kayıt olabilirsiniz'
                    }
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={() => setActiveTab('available')}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Mevcut Kurslara Göz At
                    </button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredEnrolledCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    isEnrolled={true}
                    showProgress={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="available" className="space-y-4">
            {filteredAvailableCourses.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">
                    {searchTerm ? 'Arama sonucu bulunamadı' : 'Şu anda mevcut kurs bulunmuyor'}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm 
                      ? 'Farklı anahtar kelimeler deneyebilirsiniz'
                      : 'Yeni kurslar eklendiğinde burada görünecek'
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredAvailableCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    isEnrolled={false}
                    onEnroll={handleEnroll}
                    isEnrolling={isEnrolling}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </RoleGuard>
  );
}