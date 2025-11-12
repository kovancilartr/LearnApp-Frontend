import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { courseService } from "@/lib/services";
import { useProgressStore } from "@/store/progressStore";
import { useAuth } from "@/hooks/useAuth";
import { useProgressSync } from "@/hooks/useProgressSync";
import { Course, Lesson } from "@/types";

export interface LessonData {
  course: Course | null;
  lesson: Lesson | null;
  isLoading: boolean;
  allLessons: Lesson[];
  currentLessonIndex: number;
  previousLesson: Lesson | null;
  nextLesson: Lesson | null;
  currentSection: any;
  isCompleted: boolean;
  isMarkingComplete: boolean;
  handleMarkComplete: (lessonId: string) => Promise<void>;
}

export function useLessonData(courseId: string, lessonId: string): LessonData {
  const router = useRouter();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Progress store
  const {
    initializeCourseProgress,
    getLessonCompletionStatus,
    updateLessonCompletion,
    isUpdatingLesson,
  } = useProgressStore();

  // Sync progress with React Query
  useProgressSync();

  // Fetch course data and initialize progress
  useEffect(() => {
    const fetchCourseAndProgress = async () => {
      try {
        setIsLoading(true);

        // Fetch course data
        const courseData = await courseService.getCourse(courseId);
        setCourse(courseData as Course);

        // Initialize progress store with current student's progress
        if (user?.studentProfile?.id) {
          await initializeCourseProgress(courseId, user.studentProfile.id);
        }

        // Find the specific lesson
        let foundLesson: Lesson | null = null;
        for (const section of courseData.sections || []) {
          const lessonInSection = section.lessons?.find(l => l.id === lessonId);
          if (lessonInSection) {
            foundLesson = lessonInSection;
            break;
          }
        }

        if (!foundLesson) {
          toast.error("Ders bulunamadı.");
          router.push(`/student/courses/${courseId}`);
          return;
        }

        setLesson(foundLesson);
      } catch (error) {
        console.error("Error fetching course:", error);
        toast.error("Kurs bilgileri yüklenirken bir hata oluştu.");
        router.push(`/student/courses/${courseId}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId && user?.studentProfile?.id) {
      fetchCourseAndProgress();
    }
  }, [courseId, lessonId, user?.studentProfile?.id, initializeCourseProgress, router]);

  // Computed values
  const {
    allLessons,
    currentLessonIndex,
    currentLesson,
    previousLesson,
    nextLesson,
    currentSection,
  } = useMemo(() => {
    if (!course) {
      return {
        allLessons: [],
        currentLessonIndex: -1,
        currentLesson: null,
        previousLesson: null,
        nextLesson: null,
        currentSection: null,
      };
    }

    const allLessons = course.sections?.flatMap((section) => section.lessons || []) || [];
    const currentLessonIndex = allLessons.findIndex((lesson) => lesson.id === lessonId);
    const currentLesson = allLessons[currentLessonIndex] || null;
    const previousLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;
    const nextLesson = currentLessonIndex < allLessons.length - 1 ? allLessons[currentLessonIndex + 1] : null;
    const currentSection = course.sections?.find((section) =>
      section.lessons?.some((lesson) => lesson.id === lessonId)
    ) || null;

    return {
      allLessons,
      currentLessonIndex,
      currentLesson,
      previousLesson,
      nextLesson,
      currentSection,
    };
  }, [course, lessonId]);

  const handleMarkComplete = async (lessonId: string) => {
    try {
      console.log("🍞 LessonPage handleMarkComplete called for:", lessonId);
      const currentStatus = getLessonCompletionStatus(courseId, lessonId);
      const result = await updateLessonCompletion(lessonId, !currentStatus);

      console.log("🍞 LessonPage result:", result);

      // Show success toast with better messaging
      if (result.completed) {
        console.log("🍞 LessonPage showing completion toast");
        toast.success(`🎉 "${lesson?.title || "Ders"}" başarıyla tamamlandı!`);
      } else {
        console.log("🍞 LessonPage showing uncomplete toast");
        toast(`📝 "${lesson?.title || "Ders"}" tamamlanmadı olarak işaretlendi.`);
      }
    } catch (error) {
      console.error("Error toggling lesson completion:", error);
      console.log("🍞 LessonPage showing error toast");
      toast.error("❌ Ders durumu güncellenirken bir sorun yaşandı. Lütfen tekrar deneyin.");
    }
  };

  const isCompleted = getLessonCompletionStatus(courseId, lessonId);
  const isMarkingComplete = isUpdatingLesson === lessonId;

  return {
    course,
    lesson: lesson || currentLesson,
    isLoading,
    allLessons,
    currentLessonIndex,
    previousLesson,
    nextLesson,
    currentSection,
    isCompleted,
    isMarkingComplete,
    handleMarkComplete,
  };
}