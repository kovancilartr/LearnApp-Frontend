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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { courseService } from '@/lib/services';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Save, Upload, Video, FileText, Trash2, Eye } from 'lucide-react';
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

interface Lesson {
  id: string;
  title: string;
  content?: string;
  videoUrl?: string;
  pdfUrl?: string;
  order: number;
  sectionId: string;
}

export default function EditLessonPage() {
  const params = useParams();
  const router = useRouter();

  const courseId = params.id as string;
  const sectionId = params.sectionId as string;
  const lessonId = params.lessonId as string;
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    videoUrl: '',
    pdfUrl: '',
    order: 0
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const lessonData = await courseService.getLesson(lessonId);
        setLesson(lessonData as any);
        setFormData({
          title: lessonData.title,
          content: (lessonData as any).content || '',
          videoUrl: (lessonData as any).videoUrl || '',
          pdfUrl: (lessonData as any).pdfUrl || '',
          order: (lessonData as any).order
        });
      } catch (error: any) {
        toast.error('Hata - Ders bilgileri yüklenirken bir hata oluştu');
      } finally {
        setIsLoading(false);
      }
    };

    if (lessonId) {
      fetchLesson();
    }
  }, [lessonId, toast]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Ders başlığı gereklidir';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Ders başlığı en az 3 karakter olmalıdır';
    }
    
    if (formData.order < 0) {
      newErrors.order = 'Sıra numarası 0 veya pozitif olmalıdır';
    }

    // YouTube URL validation
    if (formData.videoUrl && !isValidYouTubeUrl(formData.videoUrl)) {
      newErrors.videoUrl = 'Geçerli bir YouTube URL\'si girin';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidYouTubeUrl = (url: string) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)[a-zA-Z0-9_-]{11}$/;
    return youtubeRegex.test(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await courseService.updateLesson(lessonId, {
        title: formData.title.trim(),
        content: formData.content.trim() || undefined,
        videoUrl: formData.videoUrl.trim() || undefined,
        pdfUrl: formData.pdfUrl.trim() || undefined,
        order: formData.order
      } as any);

      toast.success('Başarılı - Ders başarıyla güncellendi');
      
      router.push(`/teacher/courses/${courseId}`);
    } catch (error: any) {
      toast.error(`Hata - ${error.response?.data?.error?.message || 'Ders güncellenirken bir hata oluştu'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await courseService.deleteLesson(lessonId);
      
      toast.success('Başarılı - Ders başarıyla silindi');
      
      router.push(`/teacher/courses/${courseId}`);
    } catch (error: unknown) {
      toast.error(`Hata - ${(error as any).response?.data?.error?.message || 'Ders silinirken bir hata oluştu'}`);
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

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return '';
    
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (videoIdMatch) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
    }
    return url;
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
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </RoleGuard>
    );
  }

  if (!lesson) {
    return (
      <RoleGuard allowedRoles={['TEACHER']}>
        <div className="flex flex-col items-center justify-center py-12">
          <h3 className="text-lg font-semibold mb-2">Ders bulunamadı</h3>
          <p className="text-muted-foreground mb-4">
            Düzenlemek istediğiniz ders mevcut değil veya erişim yetkiniz bulunmuyor.
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
            <h2 className="text-3xl font-bold tracking-tight">Dersi Düzenle</h2>
            <p className="text-muted-foreground">
              {lesson.title} dersini düzenleyin
            </p>
          </div>
        </div>

        <div className="max-w-6xl">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Ders Bilgileri</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="basic">Temel Bilgiler</TabsTrigger>
                        <TabsTrigger value="content">İçerik</TabsTrigger>
                        <TabsTrigger value="media">Medya</TabsTrigger>
                      </TabsList>

                      <TabsContent value="basic" className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">
                            Ders Başlığı <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            placeholder="Örn: React Bileşenlerine Giriş"
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
                            Dersin bölümde görüneceği sırayı belirler (0 = en başta)
                          </p>
                        </div>
                      </TabsContent>

                      <TabsContent value="content" className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="content">Ders İçeriği</Label>
                          <Textarea
                            id="content"
                            value={formData.content}
                            onChange={(e) => handleInputChange('content', e.target.value)}
                            placeholder="Ders hakkında açıklama, notlar veya talimatlar yazın..."
                            rows={8}
                            className="min-h-[200px]"
                          />
                          <p className="text-sm text-muted-foreground">
                            Markdown formatını kullanabilirsiniz
                          </p>
                        </div>
                      </TabsContent>

                      <TabsContent value="media" className="space-y-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="videoUrl" className="flex items-center">
                              <Video className="mr-2 h-4 w-4" />
                              YouTube Video URL
                            </Label>
                            <Input
                              id="videoUrl"
                              value={formData.videoUrl}
                              onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                              placeholder="https://www.youtube.com/watch?v=..."
                              className={errors.videoUrl ? 'border-red-500' : ''}
                            />
                            {errors.videoUrl && (
                              <p className="text-sm text-red-500">{errors.videoUrl}</p>
                            )}
                            <p className="text-sm text-muted-foreground">
                              YouTube video linkini buraya yapıştırın
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="pdfUrl" className="flex items-center">
                              <FileText className="mr-2 h-4 w-4" />
                              PDF Dosya URL
                            </Label>
                            <Input
                              id="pdfUrl"
                              value={formData.pdfUrl}
                              onChange={(e) => handleInputChange('pdfUrl', e.target.value)}
                              placeholder="https://example.com/document.pdf"
                            />
                            <p className="text-sm text-muted-foreground">
                              PDF dosyasının URL'sini girin (opsiyonel)
                            </p>
                          </div>

                          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600 mb-2">
                              Dosya yükleme özelliği yakında eklenecek
                            </p>
                            <p className="text-xs text-gray-500">
                              Şimdilik harici URL'ler kullanabilirsiniz
                            </p>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div className="flex justify-between pt-6 border-t">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            type="button" 
                            variant="destructive"
                            disabled={isDeleting}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Dersi Sil
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Dersi silmek istediğinizden emin misiniz?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bu işlem geri alınamaz. Ders kalıcı olarak silinecektir.
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

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="mr-2 h-4 w-4" />
                    Önizleme
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.videoUrl && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Video Önizleme</Label>
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <iframe
                          src={getYouTubeEmbedUrl(formData.videoUrl)}
                          className="w-full h-full"
                          frameBorder="0"
                          allowFullScreen
                          title="Video Önizleme"
                        />
                      </div>
                    </div>
                  )}

                  {formData.content && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">İçerik Önizleme</Label>
                      <div className="p-3 bg-gray-50 rounded-lg text-sm">
                        <div className="whitespace-pre-wrap">
                          {formData.content}
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.pdfUrl && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">PDF Dosyası</Label>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <FileText className="mr-2 h-4 w-4 text-gray-600" />
                        <span className="text-sm text-gray-600 truncate">
                          {formData.pdfUrl}
                        </span>
                      </div>
                    </div>
                  )}

                  {!formData.videoUrl && !formData.content && !formData.pdfUrl && (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">Önizleme için içerik ekleyin</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}