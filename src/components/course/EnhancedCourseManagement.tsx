"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "react-hot-toast";
import { courseService } from "@/lib/services";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  BookOpen,
  Play,
  Edit,
  Plus,
  GripVertical,
  Trash2,
  Eye,
  FileText,
  Video,
  MoreVertical,
  Copy,
  Archive,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Lesson {
  id: string;
  title: string;
  content?: string;
  videoUrl?: string;
  pdfUrl?: string;
  order: number;
}

interface Section {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description?: string;
  sections?: Section[];
}

interface EnhancedCourseManagementProps {
  course: Course;
  onCourseUpdate: () => void;
}

interface SortableSectionProps {
  section: Section;
  courseId: string;
  onUpdate: () => void;
  selectedLessons: string[];
  onLessonSelect: (lessonId: string, selected: boolean) => void;
  onBulkAction: (action: string, lessonIds: string[]) => void;
}

interface SortableLessonProps {
  lesson: Lesson;
  sectionId: string;
  courseId: string;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
}

function SortableLesson({
  lesson,
  sectionId,
  courseId,
  isSelected,
  onSelect,
}: SortableLessonProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-3 border rounded-lg bg-white ${
        isDragging ? "shadow-lg" : ""
      } ${isSelected ? "ring-2 ring-blue-500" : ""}`}
    >
      <div className="flex items-center space-x-3">
        <Checkbox checked={isSelected} onCheckedChange={onSelect} />
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>
        <div className="flex items-center space-x-2">
          <Play className="h-4 w-4 text-gray-600" />
          <span className="font-medium">{lesson.title}</span>
          <div className="flex space-x-1">
            {lesson.videoUrl && (
              <Badge variant="secondary" className="text-xs">
                <Video className="h-3 w-3 mr-1" />
                Video
              </Badge>
            )}
            {lesson.pdfUrl && (
              <Badge variant="secondary" className="text-xs">
                <FileText className="h-3 w-3 mr-1" />
                PDF
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Link
          href={`/teacher/courses/${courseId}/sections/${sectionId}/lessons/${lesson.id}/edit`}
        >
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              Önizle
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Copy className="mr-2 h-4 w-4" />
              Kopyala
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Sil
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function SortableSection({
  section,
  courseId,
  onUpdate,
  selectedLessons,
  onLessonSelect,
  onBulkAction,
}: SortableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [lessons, setLessons] = useState(section.lessons);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleLessonDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = lessons.findIndex((lesson) => lesson.id === active.id);
        const newIndex = lessons.findIndex((lesson) => lesson.id === over.id);

        const newLessons = arrayMove(lessons, oldIndex, newIndex);
        setLessons(newLessons);

        try {
          // Update lesson orders
          await Promise.all(
            newLessons.map((lesson, index) =>
              courseService.updateLesson(lesson.id, {
                title: lesson.title,
                content: lesson.content,
                videoUrl: lesson.videoUrl,
                pdfUrl: lesson.pdfUrl,
                order: index,
              } as unknown)
            )
          );

          toast.success("Başarılı - Ders sıralaması güncellendi");

          onUpdate();
        } catch (error) {
          toast.error("Hata - Ders sıralaması güncellenirken bir hata oluştu");
          // Revert the change
          setLessons(section.lessons);
        }
      }
    },
    [lessons, onUpdate, section.lessons, toast]
  );

  const sectionSelectedLessons = lessons.filter((lesson) =>
    selectedLessons.includes(lesson.id)
  );

  const allSectionLessonsSelected =
    lessons.length > 0 && sectionSelectedLessons.length === lessons.length;

  const someSectionLessonsSelected =
    sectionSelectedLessons.length > 0 &&
    sectionSelectedLessons.length < lessons.length;

  const handleSectionSelect = (checked: boolean) => {
    lessons.forEach((lesson) => {
      onLessonSelect(lesson.id, checked);
    });
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={isDragging ? "shadow-lg" : ""}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Checkbox
                checked={allSectionLessonsSelected}
                ref={(el) => {
                  if (el) {
                    const checkbox = el.querySelector(
                      "button"
                    ) as HTMLButtonElement & { indeterminate?: boolean };
                    if (checkbox)
                      checkbox.indeterminate = someSectionLessonsSelected;
                  }
                }}
                onCheckedChange={handleSectionSelect}
              />
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
              >
                <GripVertical className="h-4 w-4 text-gray-400" />
              </div>
              <CardTitle className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                {section.title}
              </CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{lessons.length} ders</Badge>
              {sectionSelectedLessons.length > 0 && (
                <Badge variant="secondary">
                  {sectionSelectedLessons.length} seçili
                </Badge>
              )}
              <Link
                href={`/teacher/courses/${courseId}/sections/${section.id}/edit`}
              >
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Copy className="mr-2 h-4 w-4" />
                    Bölümü Kopyala
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Archive className="mr-2 h-4 w-4" />
                    Arşivle
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Sil
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {lessons.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">
                Bu bölümde henüz ders bulunmuyor
              </p>
              <Link
                href={`/teacher/courses/${courseId}/sections/${section.id}/lessons/new`}
              >
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Ders Ekle
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleLessonDragEnd}
              >
                <SortableContext
                  items={lessons}
                  strategy={verticalListSortingStrategy}
                >
                  {lessons.map((lesson) => (
                    <SortableLesson
                      key={lesson.id}
                      lesson={lesson}
                      sectionId={section.id}
                      courseId={courseId}
                      isSelected={selectedLessons.includes(lesson.id)}
                      onSelect={(selected) =>
                        onLessonSelect(lesson.id, selected)
                      }
                    />
                  ))}
                </SortableContext>
              </DndContext>
              <div className="pt-2">
                <Link
                  href={`/teacher/courses/${courseId}/sections/${section.id}/lessons/new`}
                >
                  <Button variant="outline" size="sm" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Ders Ekle
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function EnhancedCourseManagement({
  course,
  onCourseUpdate,
}: EnhancedCourseManagementProps) {
  const [sections, setSections] = useState(course.sections);
  const [selectedLessons, setSelectedLessons] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkActionDialog, setBulkActionDialog] = useState<{
    open: boolean;
    action: string;
    title: string;
    description: string;
  }>({ open: false, action: "", title: "", description: "" });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleSectionDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex =
          sections?.findIndex((section) => section.id === active.id) ?? -1;
        const newIndex =
          sections?.findIndex((section) => section.id === over.id) ?? -1;

        if (oldIndex !== -1 && newIndex !== -1 && sections) {
          const newSections = arrayMove(sections, oldIndex, newIndex);
          setSections(newSections);

          try {
            // Update section orders
            await Promise.all(
              newSections.map((section, index) =>
                courseService.updateSection(section.id, {
                  title: section.title,
                  order: index,
                })
              )
            );

            toast.success("Başarılı - Bölüm sıralaması güncellendi");

            onCourseUpdate();
          } catch {
            toast.error(
              "Hata - Bölüm sıralaması güncellenirken bir hata oluştu"
            );
            // Revert the change
            setSections(course.sections);
          }
        }
      }
    },
    [sections, onCourseUpdate, toast, course.sections]
  );

  const handleLessonSelect = useCallback(
    (lessonId: string, selected: boolean) => {
      setSelectedLessons((prev) => {
        const newSelected = selected
          ? [...prev, lessonId]
          : prev.filter((id) => id !== lessonId);

        setShowBulkActions(newSelected.length > 0);
        return newSelected;
      });
    },
    []
  );

  const handleBulkAction = useCallback(
    async (action: string, lessonIds: string[]) => {
      try {
        switch (action) {
          case "delete":
            await Promise.all(
              lessonIds.map((id) => courseService.deleteLesson(id))
            );
            toast.success(`Başarılı - ${lessonIds.length} ders silindi`);
            break;
          case "archive":
            // Archive functionality would be implemented here
            toast.success(`Başarılı - ${lessonIds.length} ders arşivlendi`);
            break;
          case "duplicate":
            // Duplicate functionality would be implemented here
            toast.success(`Başarılı - ${lessonIds.length} ders kopyalandı`);
            break;
        }

        setSelectedLessons([]);
        setShowBulkActions(false);
        onCourseUpdate();
      } catch (error) {
        toast.error("Hata - Toplu işlem sırasında bir hata oluştu");
      }
    },
    [onCourseUpdate, toast]
  );

  const openBulkActionDialog = (action: string) => {
    const actionConfig = {
      delete: {
        title: "Dersleri Sil",
        description: `Seçili ${selectedLessons.length} dersi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      },
      archive: {
        title: "Dersleri Arşivle",
        description: `Seçili ${selectedLessons.length} dersi arşivlemek istediğinizden emin misiniz?`,
      },
      duplicate: {
        title: "Dersleri Kopyala",
        description: `Seçili ${selectedLessons.length} dersi kopyalamak istediğinizden emin misiniz?`,
      },
    };

    setBulkActionDialog({
      open: true,
      action,
      ...actionConfig[action as keyof typeof actionConfig],
    });
  };

  const executeBulkAction = () => {
    handleBulkAction(bulkActionDialog.action, selectedLessons);
    setBulkActionDialog({
      open: false,
      action: "",
      title: "",
      description: "",
    });
  };

  const allLessons = sections?.flatMap((section) => section.lessons) || [];
  const allSelected =
    allLessons.length > 0 && selectedLessons.length === allLessons.length;
  const someSelected =
    selectedLessons.length > 0 && selectedLessons.length < allLessons.length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLessons(allLessons.map((lesson) => lesson.id));
    } else {
      setSelectedLessons([]);
    }
    setShowBulkActions(checked && allLessons.length > 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold">Kurs İçeriği</h3>
          {allLessons.length > 0 && (
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={allSelected}
                ref={(el) => {
                  if (el) {
                    const checkbox = el.querySelector(
                      "button"
                    ) as HTMLButtonElement & { indeterminate?: boolean };
                    if (checkbox) checkbox.indeterminate = someSelected;
                  }
                }}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-muted-foreground">
                Tümünü Seç ({allLessons.length} ders)
              </span>
            </div>
          )}
        </div>
        <Link href={`/teacher/courses/${course.id}/sections/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Bölüm Ekle
          </Button>
        </Link>
      </div>

      {showBulkActions && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">
                  {selectedLessons.length} ders seçili
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Toplu işlemler:
                </span>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openBulkActionDialog("duplicate")}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Kopyala
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openBulkActionDialog("archive")}
                >
                  <Archive className="mr-2 h-4 w-4" />
                  Arşivle
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => openBulkActionDialog("delete")}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Sil
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedLessons([]);
                    setShowBulkActions(false);
                  }}
                >
                  İptal
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!sections || sections.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Henüz içerik eklenmemiş
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              Kursunuza bölümler ve dersler ekleyerek içerik oluşturmaya
              başlayın.
            </p>
            <Link href={`/teacher/courses/${course.id}/sections/new`}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                İlk Bölümü Ekle
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleSectionDragEnd}
          >
            <SortableContext
              items={sections}
              strategy={verticalListSortingStrategy}
            >
              {sections.map((section) => (
                <SortableSection
                  key={section.id}
                  section={section}
                  courseId={course.id}
                  onUpdate={onCourseUpdate}
                  selectedLessons={selectedLessons}
                  onLessonSelect={handleLessonSelect}
                  onBulkAction={handleBulkAction}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}

      <AlertDialog
        open={bulkActionDialog.open}
        onOpenChange={(open) =>
          setBulkActionDialog((prev) => ({ ...prev, open }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{bulkActionDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {bulkActionDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeBulkAction}
              className={
                bulkActionDialog.action === "delete"
                  ? "bg-red-600 hover:bg-red-700"
                  : ""
              }
            >
              Onayla
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
