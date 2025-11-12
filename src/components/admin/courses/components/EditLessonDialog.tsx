import { useState, useEffect } from "react";
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
import { Edit, PlayCircle, FileText, Video } from "lucide-react";
import { courseService } from "@/lib/services";
import { useErrorHandler } from "@/hooks";
import { Lesson } from "@/types";

interface EditLessonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lesson: Lesson;
  onSuccess: () => void;
}

export function EditLessonDialog({
  open,
  onOpenChange,
  lesson,
  onSuccess,
}: EditLessonDialogProps) {
  const { handleError } = useErrorHandler();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    videoUrl: "",
    pdfUrl: "",
    order: 0,
  });

  useEffect(() => {
    if (lesson) {
      setFormData({
        title: lesson.title || "",
        content: lesson.content || "",
        videoUrl: lesson.videoUrl || "",
        pdfUrl: lesson.pdfUrl || "",
        order: lesson.order || 0,
      });
    }
  }, [lesson]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lesson) return;

    setLoading(true);

    try {
      await courseService.updateLesson(lesson.id, {
        title: formData.title,
        content: formData.content,
        videoUrl: formData.videoUrl || undefined,
        pdfUrl: formData.pdfUrl || undefined,
        order: formData.order,
      });

      onSuccess();
    } catch (error) {
      handleError(error, "Ders güncellenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  if (!lesson) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <PlayCircle className="h-5 w-5 text-green-600" />
            <span>Ders Düzenle</span>
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
                <Label
                  htmlFor="edit-lesson-title"
                  className="text-sm font-medium"
                >
                  Ders Başlığı *
                </Label>
                <Input
                  id="edit-lesson-title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label
                  htmlFor="edit-lesson-order"
                  className="text-sm font-medium"
                >
                  Sıra Numarası
                </Label>
                <Input
                  id="edit-lesson-order"
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      order: parseInt(e.target.value) || 0,
                    })
                  }
                  min="0"
                  className="mt-1"
                />
              </div>

              <div>
                <Label
                  htmlFor="edit-lesson-content"
                  className="text-sm font-medium"
                >
                  Ders İçeriği
                </Label>
                <Textarea
                  id="edit-lesson-content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
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
                    <Label
                      htmlFor="edit-video-url"
                      className="text-sm font-medium"
                    >
                      Video URL (YouTube, Vimeo vb.)
                    </Label>
                    <Input
                      id="edit-video-url"
                      value={formData.videoUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, videoUrl: e.target.value })
                      }
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="mt-1"
                    />
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
                    <Label
                      htmlFor="edit-pdf-url"
                      className="text-sm font-medium"
                    >
                      PDF/Döküman URL
                    </Label>
                    <Input
                      id="edit-pdf-url"
                      value={formData.pdfUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, pdfUrl: e.target.value })
                      }
                      placeholder="https://example.com/document.pdf"
                      className="mt-1"
                    />
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
              onClick={() => onOpenChange(false)}
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
                  Güncelleniyor...
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Güncelle
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
