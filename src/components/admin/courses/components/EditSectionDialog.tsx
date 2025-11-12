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
import { Edit, BookOpen } from "lucide-react";
import { courseService } from "@/lib/services";
import { useErrorHandler } from "@/hooks";
import { Section } from "@/types";

interface EditSectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section: Section;
  onSuccess: () => void;
}

export function EditSectionDialog({
  open,
  onOpenChange,
  section,
  onSuccess,
}: EditSectionDialogProps) {
  const { handleError } = useErrorHandler();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    order: 0,
  });

  useEffect(() => {
    if (section) {
      setFormData({
        title: section.title || "",
        description: section.description || "",
        order: section.order || 0,
      });
    }
  }, [section]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!section) return;

    setLoading(true);

    try {
      await courseService.updateSection(section.id, {
        title: formData.title,
        order: formData.order,
      });

      onSuccess();
    } catch (error) {
      handleError(error, "Bölüm güncellenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  if (!section) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <span>Bölüm Düzenle</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="edit-section-title"
                className="text-sm font-medium"
              >
                Bölüm Başlığı *
              </Label>
              <Input
                id="edit-section-title"
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
                htmlFor="edit-section-description"
                className="text-sm font-medium"
              >
                Bölüm Açıklaması
              </Label>
              <Textarea
                id="edit-section-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="mt-1 min-h-[100px]"
              />
            </div>

            <div>
              <Label
                htmlFor="edit-section-order"
                className="text-sm font-medium"
              >
                Sıra Numarası
              </Label>
              <Input
                id="edit-section-order"
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
              className="bg-blue-600 hover:bg-blue-700"
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
