'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { RoleGuard } from '@/components/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { courseService } from '@/lib/services';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Section {
  id: string;
  title: string;
  order: number;
  lessons: any[];
}

export default function EditSectionPage() {
  const params = useParams();
  const router = useRouter();

  const courseId = params.id as string;
  const sectionId = params.sectionId as string;
  
  const [section, setSection] = useState<Section | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    order: 0
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchSection = async () => {
      try {
        const sectionData = await courseService.getSection(sectionId);
        setSection(sectionData);
        setFormData({
          title: sectionData.title,
          order: sectionData.order
        });
      } catch (error: any) {
        toast.error('Hata - Bölüm bilgileri yüklenirken bir hata oluştu');
      } finally {
        setIsLoading(false);
      }
    };

    if (sectionId) {
      fetchSection();
    }
  }, [sectionId, toast]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Bölüm başlığı gereklidir';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Bölüm başlığı en az 3 karakter olmalıdır';
    }
    
    if (formData.order < 0) {
      newErrors.order = 'Sıra numarası 0 veya pozitif olmalıdır';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await courseService.updateSection(sectionId, {
        title: formData.title.trim(),
        order: formData.order
      });

      toast.success('Başarılı - Bölüm başarıyla güncellendi');
      
      router.push(`/teacher/courses/${courseId}`);
    } catch (error: any) {
      toast.error(`Hata - ${error.response?.data?.error?.message || 'Bölüm güncellenirken bir hata oluştu'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await courseService.deleteSection(sectionId);
      
      toast.success('Başarılı - Bölüm başarıyla silindi');
      
      router.push(`/teacher/courses/${courseId}`);
    } catch (error: any) {
      toast.error(`Hata - ${error.response?.data?.error?.message || 'Bölüm silinirken bir hata oluştu'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
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
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </RoleGuard>
    );
  }

  if (!section) {
    return (
      <RoleGuard allowedRoles={['TEACHER']}>
        <div className="flex flex-col items-center justify-center py-12">
          <h3 className="text-lg font-semibold mb-2">Bölüm bulunamadı</h3>
          <p className="text-muted-foreground mb-4">
            Düzenlemek istediğiniz bölüm mevcut değil veya erişim yetkiniz bulunmuyor.
          </p>
          <Link href={`/teacher/courses/${courseId}`}>
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kursa Dön
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
              Kursa Dön
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Bölümü Düzenle</h2>
            <p className="text-muted-foreground">
              {section.title} bölümünü düzenleyin
            </p>
          </div>
        </div>

        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Bölüm Bilgileri</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Bölüm Başlığı <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Örn: Giriş ve Temel Kavramlar"
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500">{errors.title}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order">Sıra Numarası</Label>
                  <Input
                    id="order"
                    type="number"
                    min="0"
                    value={formData.order}
                    onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className={errors.order ? 'border-red-500' : ''}
                  />
                  {errors.order && (
                    <p className="text-sm text-red-500">{errors.order}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Bölümün kursta görüneceği sırayı belirler (0 = en başta)
                  </p>
                </div>

                <div className="flex justify-between pt-6 border-t">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        type="button" 
                        variant="destructive"
                        disabled={isDeleting}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Bölümü Sil
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Bölümü silmek istediğinizden emin misiniz?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Bu işlem geri alınamaz. Bölüm ve içindeki tüm dersler kalıcı olarak silinecektir.
                          {section.lessons.length > 0 && (
                            <span className="block mt-2 font-medium text-red-600">
                              Bu bölümde {section.lessons.length} ders bulunmaktadır.
                            </span>
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>İptal</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {isDeleting ? 'Siliniyor...' : 'Evet, Sil'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <div className="flex space-x-4">
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
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}