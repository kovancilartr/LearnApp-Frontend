import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserCheck } from "lucide-react";
import { CourseWithDetails, Teacher } from "../CourseManagement";

interface AssignTeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: CourseWithDetails | null;
  teachers: Teacher[];
  onAssign: (courseId: string, teacherId: string) => void;
}

export function AssignTeacherDialog({ 
  open, 
  onOpenChange, 
  course, 
  teachers, 
  onAssign 
}: AssignTeacherDialogProps) {
  if (!course) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Öğretmen Ata: {course.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-gray-600 mb-4">
            <strong>{course.title}</strong> kursu için bir öğretmen seçin
          </div>
          
          {teachers.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {teachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback>
                        {teacher.user.name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900">{teacher.user.name}</p>
                      <p className="text-sm text-gray-600">{teacher.user.email}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onAssign(course.id, teacher.id)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <UserCheck className="h-4 w-4 mr-1" />
                    Ata
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <UserCheck className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>Atanabilecek öğretmen bulunamadı</p>
            </div>
          )}
          
          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              İptal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}