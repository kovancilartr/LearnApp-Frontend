import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  HelpCircle,
  Edit,
  Trash2,
  PlayCircle,
  BookMarked,
  Users,
  TrendingUp,
  UserPlus,
  Search,
  Mail,
  Calendar,
} from "lucide-react";
import { CourseWithDetails } from "../CourseManagement";
import { CreateSectionDialog } from "./CreateSectionDialog";
import { CreateLessonDialog } from "./CreateLessonDialog";
import { EditSectionDialog } from "./EditSectionDialog";
import { EditLessonDialog } from "./EditLessonDialog";
import { courseService, userService } from "@/lib/services";
import { useErrorHandler } from "@/hooks";
import toast from "react-hot-toast";
import { Course, Enrollment, Student } from "@/types";

interface CourseDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: CourseWithDetails | null;
  onRefresh: () => void;
}

export function CourseDetailsDialog({
  open,
  onOpenChange,
  course,
  onRefresh,
}: CourseDetailsDialogProps) {
  const { handleError } = useErrorHandler();
  const [showCreateSection, setShowCreateSection] = useState(false);
  const [showCreateLesson, setShowCreateLesson] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<any>(null);
  const [editingLesson, setEditingLesson] = useState<any>(null);

  // Student management states
  const [enrolledStudents, setEnrolledStudents] = useState<unknown[]>([]);
  const [availableStudents, setAvailableStudents] = useState<unknown[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

  // Fetch students when dialog opens
  useEffect(() => {
    if (open && course) {
      fetchEnrolledStudents();
      fetchAvailableStudents();
    }
  }, [open, course]); // eslint-disable-line react-hooks/exhaustive-deps

  // Student management functions
  const fetchEnrolledStudents = async () => {
    if (!course) return;

    setLoadingStudents(true);
    try {
      const response = await courseService.getCourseEnrollments(course.id);
      setEnrolledStudents(response || []);
    } catch (error) {
      handleError(error, "Kayıtlı öğrenciler yüklenirken hata oluştu");
      setEnrolledStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchAvailableStudents = async () => {
    try {
      const response = await userService.getUsers({
        role: "STUDENT",
        limit: 100,
      });
      const students = response?.items || response || [];
      setAvailableStudents(Array.isArray(students) ? students : []);
    } catch (error) {
      handleError(error, "Öğrenciler yüklenirken hata oluştu");
      setAvailableStudents([]);
    }
  };

  const handleAddStudent = async () => {
    if (!selectedStudentId || !course) return;

    try {
      await courseService.enrollStudent(course.id, selectedStudentId);
      toast.success("Öğrenci başarıyla kursa eklendi!");
      setSelectedStudentId("");
      setShowAddStudent(false);
      fetchEnrolledStudents();
      onRefresh();
    } catch (error) {
      handleError(error, "Öğrenci eklenirken hata oluştu");
    }
  };

  const handleRemoveStudent = async (
    studentId: string,
    studentName: string
  ) => {
    // Confirm dialog ile uyarı göster
    const confirmMessage = `${studentName} adlı öğrenciyi kurstan çıkarmak istediğinizden emin misiniz?\n\nBu işlem öğrencinin tüm ders ilerlemesini, quiz sonuçlarını ve kurs verilerini kalıcı olarak silecektir!`;

    if (confirm(confirmMessage)) {
      try {
        await courseService.unenrollStudent(course!.id, studentId);
        toast.success("Öğrenci başarıyla kurstan çıkarıldı");
        fetchEnrolledStudents();
        onRefresh();
      } catch (error) {
        console.log(error);
        handleError(error, "Öğrenci çıkarılırken hata oluştu");
        toast.error("Öğrenci çıkarılırken bir hata oluştu!");
      }
    }
  };

  // Handler functions
  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm("Bu bölümü silmek istediğinizden emin misiniz?")) return;

    try {
      // API call to delete section
      // await courseService.deleteSection(sectionId);
      onRefresh();
    } catch (error) {
      console.error("Bölüm silinirken hata oluştu:", error);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Bu dersi silmek istediğinizden emin misiniz?")) return;

    try {
      // API call to delete lesson
      // await courseService.deleteLesson(lessonId);
      onRefresh();
    } catch (error) {
      console.error("Ders silinirken hata oluştu:", error);
    }
  };

  // Filter available students (exclude already enrolled)
  const filteredAvailableStudents = availableStudents.filter(
    (student: Student) =>
      !enrolledStudents.some(
        (enrolled: Enrollment) => enrolled.studentId === student.id
      ) &&
      student.user?.name
        ?.toLowerCase()
        .includes(studentSearchTerm.toLowerCase())
  );

  // Filter enrolled students
  const filteredEnrolledStudents = enrolledStudents.filter(
    (enrollment: Enrollment) =>
      enrollment.student?.user?.name
        ?.toLowerCase()
        .includes(studentSearchTerm.toLowerCase())
  );

  if (!course) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="modal-container-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Kurs Detayları: {course.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Course Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">{course.title}</h2>
            <p className="text-blue-100 mb-4">{course.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-sm opacity-90">Öğrenci Sayısı</div>
                <div className="text-xl font-bold">
                  {(course as Course)?._count?.enrollments || 0}
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-sm opacity-90">Bölüm Sayısı</div>
                <div className="text-xl font-bold">
                  {(course as Course)?._count?.sections || 0}
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-sm opacity-90">Öğretmen</div>
                <div className="text-sm font-medium">
                  {(course as Course)?.teacher?.user?.name || "Atanmamış"}
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-sm opacity-90">Oluşturulma</div>
                <div className="text-sm font-medium">
                  {course.createdAt
                    ? new Date(course.createdAt).toLocaleDateString("tr-TR")
                    : "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Content Management */}
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">İçerik</TabsTrigger>
              <TabsTrigger value="students">Öğrenciler</TabsTrigger>
              <TabsTrigger value="analytics">Analitik</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Kurs İçeriği</h3>
                <div className="flex space-x-2">
                  <Button size="sm" onClick={() => setShowCreateSection(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Bölüm Ekle
                  </Button>
                  <Button size="sm" variant="outline">
                    <HelpCircle className="h-4 w-4 mr-1" />
                    Quiz Ekle
                  </Button>
                </div>
              </div>

              {course.sections && course.sections.length > 0 ? (
                <div className="space-y-4">
                  {course.sections.map((section, sectionIndex) => (
                    <Card key={section.id} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline">{sectionIndex + 1}</Badge>
                          <h4 className="font-medium text-gray-900">
                            {section.title}
                          </h4>
                          <span className="text-sm text-gray-500">
                            ({section.lessons?.length || 0} ders)
                          </span>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowCreateLesson(section.id)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Ders
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingSection(section)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteSection(section.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {section.lessons && section.lessons.length > 0 && (
                        <div className="ml-6 space-y-2">
                          {section.lessons.map((lesson, lessonIndex) => (
                            <div
                              key={lesson.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <Badge variant="secondary" className="text-xs">
                                  {lessonIndex + 1}
                                </Badge>
                                <PlayCircle className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium">
                                  {lesson.title}
                                </span>
                                <div className="flex space-x-1">
                                  {lesson.videoUrl && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      Video
                                    </Badge>
                                  )}
                                  {lesson.pdfUrl && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      PDF
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex space-x-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingLesson(lesson)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => handleDeleteLesson(lesson.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <BookMarked className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Henüz içerik yok
                  </h4>
                  <p className="text-gray-500 mb-4">
                    İlk bölümünüzü oluşturarak başlayın
                  </p>
                  <Button onClick={() => setShowCreateSection(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    İlk Bölümü Oluştur
                  </Button>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="students" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Kayıtlı Öğrenciler</h3>
                <Button
                  size="sm"
                  onClick={() => setShowAddStudent(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  Öğrenci Ekle
                </Button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Öğrenci ara..."
                  value={studentSearchTerm}
                  onChange={(e) => setStudentSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Add Student Form */}
              {showAddStudent && (
                <Card className="p-4 border-green-200 bg-green-50">
                  <h4 className="font-medium text-green-800 mb-3">
                    Yeni Öğrenci Ekle
                  </h4>
                  <div className="flex gap-3">
                    <Select
                      value={selectedStudentId}
                      onValueChange={setSelectedStudentId}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Öğrenci seçin..." />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredAvailableStudents.map((student: Student) => (
                          <SelectItem key={student.id} value={student.id}>
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {student.user?.name?.charAt(0) || "?"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {student.user?.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {student.user?.email}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={handleAddStudent}
                      disabled={!selectedStudentId}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Ekle
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAddStudent(false);
                        setSelectedStudentId("");
                      }}
                    >
                      İptal
                    </Button>
                  </div>
                </Card>
              )}

              {/* Students List */}
              {loadingStudents ? (
                <Card className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Öğrenciler yükleniyor...</p>
                </Card>
              ) : filteredEnrolledStudents.length > 0 ? (
                <div className="space-y-3">
                  {filteredEnrolledStudents.map((enrollment: Enrollment) => (
                    <Card key={enrollment.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {enrollment.student?.user?.name?.charAt(0) || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {enrollment.student?.user?.name ||
                                "İsimsiz Öğrenci"}
                            </h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Mail className="h-3 w-3" />
                                <span>{enrollment.student?.user?.email}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  Kayıt:{" "}
                                  {enrollment.createdAt
                                    ? new Date(
                                        enrollment.createdAt
                                      ).toLocaleDateString("tr-TR")
                                    : "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              enrollment.status === "ACTIVE"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {enrollment.status === "ACTIVE" ? "Aktif" : "Pasif"}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleRemoveStudent(
                                enrollment.studentId,
                                enrollment.student?.user?.name || "Öğrenci"
                              )
                            }
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Çıkar
                          </Button>
                        </div>
                      </div>

                      {/* Progress Info */}
                      {enrollment.progress && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">
                                Tamamlanan Dersler:
                              </span>
                              <div className="font-medium">
                                {enrollment.progress.completedLessons || 0} /{" "}
                                {enrollment.progress.totalLessons || 0}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500">İlerleme:</span>
                              <div className="font-medium">
                                %
                                {Math.round(
                                  enrollment.progress.completionPercentage || 0
                                )}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500">
                                Son Aktivite:
                              </span>
                              <div className="font-medium">
                                {enrollment.progress.lastAccessedAt
                                  ? new Date(
                                      enrollment.progress.lastAccessedAt
                                    ).toLocaleDateString("tr-TR")
                                  : "Henüz giriş yapmamış"}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Henüz kayıtlı öğrenci yok
                  </h4>
                  <p className="text-gray-500 mb-4">
                    Bu kursa henüz hiç öğrenci kaydolmamış
                  </p>
                  <Button
                    onClick={() => setShowAddStudent(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    İlk Öğrenciyi Ekle
                  </Button>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="analytics">
              <Card className="p-6 text-center">
                <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Kurs Analitikleri
                </h4>
                <p className="text-gray-500">Bu özellik yakında eklenecek</p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Dialogs */}
        <CreateSectionDialog
          open={showCreateSection}
          onOpenChange={setShowCreateSection}
          courseId={course.id}
          onSuccess={() => {
            setShowCreateSection(false);
            onRefresh();
          }}
        />

        <CreateLessonDialog
          open={!!showCreateLesson}
          onOpenChange={() => setShowCreateLesson(null)}
          sectionId={showCreateLesson || ""}
          onSuccess={() => {
            setShowCreateLesson(null);
            onRefresh();
          }}
        />

        <EditSectionDialog
          open={!!editingSection}
          onOpenChange={() => setEditingSection(null)}
          section={editingSection}
          onSuccess={() => {
            setEditingSection(null);
            onRefresh();
          }}
        />

        <EditLessonDialog
          open={!!editingLesson}
          onOpenChange={() => setEditingLesson(null)}
          lesson={editingLesson}
          onSuccess={() => {
            setEditingLesson(null);
            onRefresh();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
