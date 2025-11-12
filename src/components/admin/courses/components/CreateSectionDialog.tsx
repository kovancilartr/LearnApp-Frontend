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
import { Plus, BookOpen } from "lucide-react";
import { courseService } from "@/lib/services";
import { useErrorHandler } from "@/hooks";

interface CreateSectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  onSuccess: () => void;
}

export function CreateSectionDialog({
  open,
  onOpenChange,
  courseId,
  onSuccess,
}: CreateSectionDialogProps) {
  const { handleError } = useErrorHandler();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    order: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await courseService.createSection(courseId, {
        title: formData.title,
        order: formData.order || 0,
      });

      setFormData({ title: "", description: "", order: 0 });
      onSuccess();
    } catch (error) {
      handleError(error, "Bölüm oluşturulurken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ title: "", description: "", order: 0 });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <span>Yeni Bölüm Oluştur</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="section-title" className="text-sm font-medium">
                Bölüm Başlığı *
              </Label>
              <Input
                id="section-title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Örn: Giriş ve Temel Kavramlar"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label
                htmlFor="section-description"
                className="text-sm font-medium"
              >
                Bölüm Açıklaması
              </Label>
              <Textarea
                id="section-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Bu bölümde neler öğrenileceğini açıklayın..."
                className="mt-1 min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="section-order" className="text-sm font-medium">
                Sıra Numarası
              </Label>
              <Input
                id="section-order"
                type="number"
                value={formData.order}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    order: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="0 (otomatik sıralama için boş bırakın)"
                min="0"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                0 veya boş bırakırsanız otomatik olarak en sona eklenecektir
              </p>
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
              className="bg-blue-600 hover:bg-blue-700"
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
                  Bölüm Oluştur
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
