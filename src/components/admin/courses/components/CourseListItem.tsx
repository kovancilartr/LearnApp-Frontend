import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  ChevronDown, 
  ChevronRight, 
  Eye, 
  Edit, 
  UserCheck, 
  Trash2, 
  Calendar,
  PlayCircle,
  BookMarked
} from "lucide-react";
import { CourseWithDetails } from "../CourseManagement";

interface CourseListItemProps {
  course: CourseWithDetails;
  expanded: boolean;
  onToggleExpansion: () => void;
  onEdit: (course: CourseWithDetails) => void;
  onDelete: (courseId: string) => void;
  onAssignTeacher: (course: CourseWithDetails) => void;
  onViewDetails: (course: CourseWithDetails) => void;
}

export function CourseListItem({
  course,
  expanded,
  onToggleExpansion,
  onEdit,
  onDelete,
  onAssignTeacher,
  onViewDetails,
}: CourseListItemProps) {
  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleExpansion}
            >
              {expanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {course.title}
                </h3>
                <Badge variant="secondary">
                  {(course as any)?._count?.enrollments || 0} öğrenci
                </Badge>
                <Badge variant="outline">
                  {(course as any)?._count?.sections || 0} bölüm
                </Badge>
              </div>
              
              <p className="text-gray-600 text-sm mb-3">
                {course.description || "Açıklama bulunmuyor"}
              </p>
              
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-xs">
                      {(course as any)?.teacher?.user?.name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span>{(course as any)?.teacher?.user?.name || "Öğretmen atanmamış"}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {course.createdAt 
                      ? new Date(course.createdAt).toLocaleDateString("tr-TR")
                      : "N/A"
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="outline" onClick={() => onViewDetails(course)}>
              <Eye className="h-4 w-4 mr-1" />
              Detay
            </Button>
            <Button size="sm" variant="outline" onClick={() => onEdit(course)}>
              <Edit className="h-4 w-4 mr-1" />
              Düzenle
            </Button>
            <Button size="sm" variant="outline" onClick={() => onAssignTeacher(course)}>
              <UserCheck className="h-4 w-4 mr-1" />
              Öğretmen
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onDelete(course.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Sil
            </Button>
          </div>
        </div>
        
        {expanded && (
          <div className="mt-6 pt-6 border-t">
            <CourseContentPreview course={course} />
          </div>
        )}
      </div>
    </Card>
  );
}

function CourseContentPreview({ course }: { course: CourseWithDetails }) {
  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">Kurs İçeriği</h4>
      
      {course.sections && course.sections.length > 0 ? (
        <div className="space-y-3">
          {course.sections.map((section, index) => (
            <div key={section.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  {index + 1}
                </Badge>
                <h5 className="font-medium text-gray-900">{section.title}</h5>
                <span className="text-xs text-gray-500">
                  ({section.lessons?.length || 0} ders)
                </span>
              </div>
              
              {section.lessons && section.lessons.length > 0 && (
                <div className="ml-6 space-y-1">
                  {section.lessons.slice(0, 3).map((lesson) => (
                    <div key={lesson.id} className="flex items-center space-x-2 text-sm text-gray-600">
                      <PlayCircle className="h-3 w-3" />
                      <span>{lesson.title}</span>
                      {lesson.videoUrl && <Badge variant="secondary" className="text-xs">Video</Badge>}
                      {lesson.pdfUrl && <Badge variant="secondary" className="text-xs">PDF</Badge>}
                    </div>
                  ))}
                  {section.lessons.length > 3 && (
                    <div className="text-xs text-gray-500 ml-5">
                      +{section.lessons.length - 3} ders daha
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <BookMarked className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p>Henüz içerik eklenmemiş</p>
        </div>
      )}
    </div>
  );
}