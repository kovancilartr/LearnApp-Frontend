import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit } from "lucide-react";
import { CourseWithDetails } from "../CourseManagement";

interface EditCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: CourseWithDetails | null;
  onSubmit: (courseId: string, courseData: { title: string; description: string }) => void;
}

export function EditCourseDialog({ open, onOpenChange, course, onSubmit }: EditCourseDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || "",
        description: course.description || "",
      });
    }
  }, [course]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (course) {
      onSubmit(course.id, formData);
    }
  };

  if (!course) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Kurs Düzenle</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title" className="text-sm font-medium">
                Kurs Başlığı *
              </Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-description" className="text-sm font-medium">
                Kurs Açıklaması
              </Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 min-h-[120px]"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              İptal
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Edit className="h-4 w-4 mr-2" />
              Güncelle
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}