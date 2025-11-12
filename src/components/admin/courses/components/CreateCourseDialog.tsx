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
import { Plus } from "lucide-react";

interface CreateCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (courseData: { title: string; description: string }) => void;
}

export function CreateCourseDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateCourseDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ title: "", description: "" });
  };

  const handleCancel = () => {
    setFormData({ title: "", description: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Yeni Kurs Oluştur</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-sm font-medium">
                Kurs Başlığı *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Örn: React ile Modern Web Geliştirme"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium">
                Kurs Açıklaması
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Kursunuzun içeriği hakkında detaylı bilgi verin..."
                className="mt-1 min-h-[120px]"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleCancel}>
              İptal
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Kurs Oluştur
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
