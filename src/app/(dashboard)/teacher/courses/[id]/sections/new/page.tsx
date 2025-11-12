'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { RoleGuard } from '@/components/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { courseService } from '@/lib/services';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Save } from 'lucide-react';

export default function NewSectionPage() {
  const params = useParams();
  const router = useRouter();

  const courseId = params.id as string;
  
  const [formData, setFormData] = useState({
    title: '',
    order: 0
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      await courseService.createSection(courseId, {
        title: formData.title.trim(),
        order: formData.order
      });

      toast.success('Başarılı - Bölüm başarıyla oluşturuldu');
      
      router.push(`/teacher/courses/${courseId}`);
    } catch (error: any) {
      toast.error(`Hata - ${error.response?.data?.error?.message || 'Bölüm oluşturulurken bir hata oluştu'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

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
            <h2 className="text-3xl font-bold tracking-tight">Yeni Bölüm Ekle</h2>
            <p className="text-muted-foreground">
              Kursunuza yeni bir bölüm ekleyin
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
                        Oluşturuluyor...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Bölümü Oluştur
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