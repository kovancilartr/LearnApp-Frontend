import { Button } from "@/components/ui/button";
import { GraduationCap, Plus, BookOpen, Users, TrendingUp } from "lucide-react";

interface CourseHeaderProps {
  totalCourses: number;
  totalStudents: number;
  totalTeachers: number;
  onCreateCourse: () => void;
}

export function CourseHeader({ 
  totalCourses, 
  totalStudents, 
  totalTeachers, 
  onCreateCourse 
}: CourseHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <GraduationCap className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Kurs Yönetimi</h1>
          </div>
          <p className="text-blue-100">Kurslarınızı oluşturun, düzenleyin ve yönetin</p>
        </div>
        <Button 
          onClick={onCreateCourse}
          className="bg-white text-blue-600 hover:bg-blue-50 font-semibold"
        >
          <Plus className="h-4 w-4 mr-2" />
          Yeni Kurs Oluştur
        </Button>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/10 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span className="text-sm font-medium">Toplam Kurs</span>
          </div>
          <div className="text-2xl font-bold mt-1">{totalCourses}</div>
        </div>
        <div className="bg-white/10 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span className="text-sm font-medium">Toplam Öğrenci</span>
          </div>
          <div className="text-2xl font-bold mt-1">{totalStudents}</div>
        </div>
        <div className="bg-white/10 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-5 w-5" />
            <span className="text-sm font-medium">Aktif Öğretmen</span>
          </div>
          <div className="text-2xl font-bold mt-1">{totalTeachers}</div>
        </div>
        <div className="bg-white/10 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span className="text-sm font-medium">Bu Ay</span>
          </div>
          <div className="text-2xl font-bold mt-1">+{Math.floor(Math.random() * 20) + 5}</div>
        </div>
      </div>
    </div>
  );
}