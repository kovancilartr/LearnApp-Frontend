'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { RoleGuard } from '@/components/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCourseStore } from '@/store/courseStore';
import { courseService } from '@/lib/services';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Save } from 'lucide-react';

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  
  const { 
    selectedCourse, 
    setSelectedCourse, 
    fetchCourses,
    isLoading 
  } = useCourseStore();
  
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchCourses().then(() => {
        const { courses } = useCourseStore.getState();
        const course = courses.find(c => c.id === courseId);
        if (course) {
          setSelectedCourse(course);
          setFormData({
            title: course.title,
            description: course.description || ''
          });
        }
      });
    }
  }, [courseId, fetchCourses, setSelectedCourse]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Kurs başlığı gereklidir';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Kurs başlığı en az 3 karakter olmalıdır';
    }
    
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Açıklama en fazla 500 karakter olabilir';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !selectedCourse) {
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedCourse = await courseService.updateCourse(courseId, {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined
      });

      setSelectedCourse(updatedCourse);
      
      toast.success('Başarılı - Kurs başarıyla güncellendi');
      
      router.push(`/teacher/courses/${courseId}`);
    } catch (error: any) {
      toast.error(`Hata - ${error.response?.data?.error?.message || 'Kurs güncellenirken bir hata oluştu'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (isLoading) {
    return (
      <RoleGuard allowedRoles={['TEACHER']}>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        </div>
      </RoleGuard>
    );
  }

  if (!selectedCourse) {
    return (
      <RoleGuard allowedRoles={['TEACHER']}>
        <div className="flex flex-col items-center justify-center py-12">
          <h3 className="text-lg font-semibold mb-2">Kurs bulunamadı</h3>
          <p className="text-muted-foreground mb-4">
            Düzenlemek istediğiniz kurs mevcut değil veya erişim yetkiniz bulunmuyor.
          </p>
          <Link href="/teacher/courses">
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
        <div className="flex items-center space-x-4">
          <Link href={`/teacher/courses/${courseId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Kursu Düzenle</h2>
            <p className="text-muted-foreground">
              {selectedCourse.title} kursunu düzenleyin
            </p>
          </div>
        </div>

        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Kurs Bilgileri</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Kurs Başlığı <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Örn: React ile Web Geliştirme"
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500">{errors.title}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Kurs Açıklaması</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Kursunuz hakkında kısa bir açıklama yazın..."
                    rows={4}
                    className={errors.description ? 'border-red-500' : ''}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    {errors.description && (
                      <p className="text-red-500">{errors.description}</p>
                    )}
                    <p className="ml-auto">
                      {formData.description.length}/500
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Link href={`/teacher/courses/${courseId}`}>
                    <Button type="button" variant="outline">
                      İptal
                    </Button>
                  </Link>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Güncelleniyor...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Değişiklikleri Kaydet
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}