"use client";

import { useState, useEffect, useCallback } from "react";
import { useErrorHandler } from "@/hooks";
import { courseService, userService } from "@/lib/services";
import { Course, User, Section } from "@/types";
import { CourseHeader } from "./components/CourseHeader";
import { CourseFilters } from "./components/CourseFilters";
import { CourseGrid } from "./components/CourseGrid";
import { CourseList } from "./components/CourseList";
import { CreateCourseDialog } from "./components/CreateCourseDialog";
import { EditCourseDialog } from "./components/EditCourseDialog";
import { AssignTeacherDialog } from "./components/AssignTeacherDialog";
import { CourseDetailsDialog } from "./components/CourseDetailsDialog";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { EmptyState } from "./components/EmptyState";

export interface Teacher {
  id: string;
  user: User;
}

export interface CourseWithDetails extends Course {
  sections?: Section[];
  teacher?: Teacher;
  enrollments?: any[];
  isPublished?: boolean;
  _count?: {
    enrollments: number;
    sections: number;
  };
}

export type ViewMode = "grid" | "list";
export type FilterStatus = "all" | "active" | "draft";
export type SortBy = "newest" | "oldest" | "name" | "students";

export function CourseManagement() {
  const { handleError } = useErrorHandler();

  // State management
  const [courses, setCourses] = useState<CourseWithDetails[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  // UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [sortBy, setSortBy] = useState<SortBy>("newest");

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseWithDetails | null>(
    null
  );
  const [assigningTeacher, setAssigningTeacher] =
    useState<CourseWithDetails | null>(null);
  const [viewingCourse, setViewingCourse] = useState<CourseWithDetails | null>(
    null
  );

  // Data fetching
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await courseService.getCourses({
        search: searchTerm,
        limit: 50,
      });

      let courseData = response?.items || response || [];
      if (!Array.isArray(courseData)) {
        courseData = [];
      }

      const coursesWithDetails = await Promise.all(
        courseData.map(async (course: any) => {
          try {
            const detailedCourse = await courseService.getCourse(course.id);
            return detailedCourse;
          } catch (error) {
            console.warn(
              `Failed to fetch details for course ${course.id}:`,
              error
            );
            return course;
          }
        })
      );

      setCourses(coursesWithDetails);
    } catch (error) {
      handleError(error, "Kurslar yüklenirken hata oluştu");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, handleError]);

  const fetchTeachers = useCallback(async () => {
    try {
      const response = await userService.getUsers({
        limit: 100,
        role: "TEACHER",
      });

      const userData = response?.items || response || [];
      const userArray = Array.isArray(userData) ? userData : [];
      const teacherUsers = userArray.filter(
        (user: User) => user?.role === "TEACHER"
      );
      const teachersWithProfile = teacherUsers.map((user: User) => ({
        id: user.id,
        user: user,
      }));

      setTeachers(teachersWithProfile);
    } catch (error) {
      handleError(error, "Öğretmenler yüklenirken hata oluştu");
      setTeachers([]);
    }
  }, [handleError]);

  useEffect(() => {
    fetchCourses();
    fetchTeachers();
  }, [fetchCourses, fetchTeachers]);

  // Event handlers
  const handleCreateCourse = async (courseData: {
    title: string;
    description: string;
  }) => {
    try {
      await courseService.createCourse(courseData);
      setShowCreateDialog(false);
      fetchCourses();
    } catch (error) {
      handleError(error, "Kurs oluşturulurken hata oluştu");
    }
  };

  const handleUpdateCourse = async (
    courseId: string,
    courseData: { title: string; description: string }
  ) => {
    try {
      await courseService.updateCourse(courseId, courseData);
      setEditingCourse(null);
      fetchCourses();
    } catch (error) {
      handleError(error, "Kurs güncellenirken hata oluştu");
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Bu kursu silmek istediğinizden emin misiniz?")) return;

    try {
      await courseService.deleteCourse(courseId);
      fetchCourses();
    } catch (error) {
      handleError(error, "Kurs silinirken hata oluştu");
    }
  };

  const handleAssignTeacher = async (courseId: string, teacherId: string) => {
    try {
      await courseService.assignTeacherToCourse(courseId, teacherId);
      setAssigningTeacher(null);
      fetchCourses();
    } catch (error) {
      handleError(error, "Öğretmen atanırken hata oluştu");
    }
  };

  // Filter and sort courses
  const filteredAndSortedCourses = courses
    .filter((course) => {
      const matchesSearch =
        course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterStatus === "all" ||
        (filterStatus === "active" && course.isPublished) ||
        (filterStatus === "draft" && !course.isPublished);

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt || 0).getTime() -
            new Date(b.createdAt || 0).getTime()
          );
        case "name":
          return (a.title || "").localeCompare(b.title || "");
        case "students":
          return (
            ((b as any)?._count?.enrollments || 0) -
            ((a as any)?._count?.enrollments || 0)
          );
        default:
          return 0;
      }
    });

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <CourseHeader
        totalCourses={courses.length}
        totalStudents={courses.reduce(
          (acc, course) => acc + ((course as any)?._count?.enrollments || 0),
          0
        )}
        totalTeachers={teachers.length}
        onCreateCourse={() => setShowCreateDialog(true)}
      />

      {/* Filters */}
      <CourseFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />

      {/* Course List */}
      {filteredAndSortedCourses.length === 0 ? (
        <EmptyState onCreateCourse={() => setShowCreateDialog(true)} />
      ) : viewMode === "grid" ? (
        <CourseGrid
          courses={filteredAndSortedCourses}
          onEdit={setEditingCourse}
          onDelete={handleDeleteCourse}
          onAssignTeacher={setAssigningTeacher}
          onViewDetails={setViewingCourse}
        />
      ) : (
        <CourseList
          courses={filteredAndSortedCourses}
          onEdit={setEditingCourse}
          onDelete={handleDeleteCourse}
          onAssignTeacher={setAssigningTeacher}
          onViewDetails={setViewingCourse}
        />
      )}

      {/* Dialogs */}
      <CreateCourseDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateCourse}
      />

      {/* Edit Course Dialog */}
      <EditCourseDialog
        open={!!editingCourse}
        onOpenChange={() => setEditingCourse(null)}
        course={editingCourse}
        onSubmit={handleUpdateCourse}
      />

      {/* Assign Teacher Dialog */}
      <AssignTeacherDialog
        open={!!assigningTeacher}
        onOpenChange={() => setAssigningTeacher(null)}
        course={assigningTeacher}
        teachers={teachers}
        onAssign={handleAssignTeacher}
      />

      {/* Course Details Dialog */}
      <CourseDetailsDialog
        open={!!viewingCourse}
        onOpenChange={() => setViewingCourse(null)}
        course={viewingCourse}
        onRefresh={fetchCourses}
      />
    </div>
  );
}
