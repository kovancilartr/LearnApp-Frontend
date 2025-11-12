import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, PlayCircle, FileText, Video, Upload } from "lucide-react";
import { courseService } from "@/lib/services";
import { useErrorHandler } from "@/hooks";

interface CreateLessonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionId: string;
  onSuccess: () => void;
}

export function CreateLessonDialog({
  open,
  onOpenChange,
  sectionId,
  onSuccess,
}: CreateLessonDialogProps) {
  const { handleError } = useErrorHandler();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    videoUrl: "",
    pdfUrl: "",
    order: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await courseService.createLesson(sectionId, {
        title: formData.title,
        content: formData.content,
        videoUrl: formData.videoUrl || undefined,
        pdfUrl: formData.pdfUrl || undefined,
        order: formData.order || 0,
      });

      setFormData({
        title: "",
        content: "",
        videoUrl: "",
        pdfUrl: "",
        order: 0,
      });
      onSuccess();
    } catch (error) {
      handleError(error, "Ders oluşturulurken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ title: "", content: "", videoUrl: "", pdfUrl: "", order: 0 });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <PlayCircle className="h-5 w-5 text-green-600" />
            <span>Yeni Ders Oluştur</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Temel Bilgiler */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Temel Bilgiler
              </h3>

              <div>
                <Label htmlFor="lesson-title" className="text-sm font-medium">
                  Ders Başlığı *
                </Label>
                <Input
                  id="lesson-title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Örn: React Hooks'a Giriş"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="lesson-order" className="text-sm font-medium">
                  Sıra Numarası
                </Label>
                <Input
                  id="lesson-order"
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      order: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="0 (otomatik sıralama)"
                  min="0"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="lesson-content" className="text-sm font-medium">
                  Ders İçeriği
                </Label>
                <Textarea
                  id="lesson-content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="Ders açıklaması ve detayları..."
                  className="mt-1 min-h-[150px]"
                />
              </div>
            </div>

            {/* Medya İçerikleri */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Medya İçerikleri
              </h3>

              <Tabs defaultValue="video" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger
                    value="video"
                    className="flex items-center space-x-2"
                  >
                    <Video className="h-4 w-4" />
                    <span>Video</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="document"
                    className="flex items-center space-x-2"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Döküman</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="video" className="space-y-4">
                  <div>
                    <Label htmlFor="video-url" className="text-sm font-medium">
                      Video URL (YouTube, Vimeo vb.)
                    </Label>
                    <Input
                      id="video-url"
                      value={formData.videoUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, videoUrl: e.target.value })
                      }
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      YouTube, Vimeo veya diğer video platformlarından URL
                      ekleyebilirsiniz
                    </p>
                  </div>

                  {formData.videoUrl && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Video className="h-4 w-4" />
                        <span>Video önizlemesi:</span>
                      </div>
                      <div className="mt-2 text-sm text-blue-600 break-all">
                        {formData.videoUrl}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="document" className="space-y-4">
                  <div>
                    <Label htmlFor="pdf-url" className="text-sm font-medium">
                      PDF/Döküman URL
                    </Label>
                    <Input
                      id="pdf-url"
                      value={formData.pdfUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, pdfUrl: e.target.value })
                      }
                      placeholder="https://example.com/document.pdf"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, Word veya diğer döküman dosyalarının URL'sini
                      ekleyebilirsiniz
                    </p>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-sm text-blue-800">
                      <Upload className="h-4 w-4" />
                      <span>Dosya Yükleme İpucu</span>
                    </div>
                    <p className="text-sm text-blue-700 mt-1">
                      Dosyalarınızı Google Drive, Dropbox veya benzeri bir
                      servise yükleyip paylaşım linkini buraya ekleyebilirsiniz.
                    </p>
                  </div>

                  {formData.pdfUrl && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <FileText className="h-4 w-4" />
                        <span>Döküman önizlemesi:</span>
                      </div>
                      <div className="mt-2 text-sm text-blue-600 break-all">
                        {formData.pdfUrl}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              İptal
            </Button>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Ders Oluştur
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
