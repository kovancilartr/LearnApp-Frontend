import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  BookOpen, 
  Eye, 
  Edit, 
  UserCheck, 
  Trash2, 
  Calendar, 
  Clock,
  MoreVertical 
} from "lucide-react";
import { CourseWithDetails } from "../CourseManagement";

interface CourseCardProps {
  course: CourseWithDetails;
  onEdit: (course: CourseWithDetails) => void;
  onDelete: (courseId: string) => void;
  onAssignTeacher: (course: CourseWithDetails) => void;
  onViewDetails: (course: CourseWithDetails) => void;
}

export function CourseCard({
  course,
  onEdit,
  onDelete,
  onAssignTeacher,
  onViewDetails,
}: CourseCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-200 overflow-hidden">
      <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 relative">
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <BookOpen className="h-12 w-12 text-white" />
        </div>
        <div className="absolute top-4 right-4">
          <Badge variant="secondary" className="bg-white/90 text-gray-700">
            {(course as any)?._count?.enrollments || 0} öğrenci
          </Badge>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
            {course.title}
          </h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {course.description || "Açıklama bulunmuyor"}
        </p>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {(course as any)?.teacher?.user?.name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
              <span className="text-gray-600">
                {(course as any)?.teacher?.user?.name || "Öğretmen atanmamış"}
              </span>
            </div>
            <Badge variant="outline" className="text-xs">
              {(course as any)?._count?.sections || 0} bölüm
            </Badge>
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>
                {course.createdAt 
                  ? new Date(course.createdAt).toLocaleDateString("tr-TR")
                  : "N/A"
                }
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>Son güncelleme</span>
            </div>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
            onClick={() => onViewDetails(course)}
          >
            <Eye className="h-3 w-3 mr-1" />
            Görüntüle
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onEdit(course)}
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onAssignTeacher(course)}
          >
            <UserCheck className="h-3 w-3" />
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onDelete(course.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
}