"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, FileText, Loader2, Play } from "lucide-react";
import { useProgressStore } from "@/store/progressStore";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { Lesson } from "@/types";

interface LessonCompletionToggleProps {
  lesson: Lesson;
  lessonId: string;
  courseId: string;
  lessonTitle?: string;
  variant?: "button" | "badge" | "icon";
  size?: "sm" | "default" | "lg";
  showText?: boolean;
  disabled?: boolean;
  childId?: string;
  className?: string;
  onToggle?: (lessonId: string, completed: boolean) => void;
}

export function LessonCompletionToggle({
  lessonId,
  courseId,
  lessonTitle,
  variant = "button",
  size = "default",
  showText = true,
  disabled = false,
  childId,
  className,
  onToggle,
}: LessonCompletionToggleProps) {
  // Use selector to get specific lesson completion status - this will trigger re-render when it changes
  const isCompleted = useProgressStore(
    (state) =>
      state.courseProgresses[courseId]?.lessons[lessonId]?.completed || false
  );

  const updateLessonCompletion = useProgressStore(
    (state) => state.updateLessonCompletion
  );
  const isUpdatingLesson = useProgressStore((state) => state.isUpdatingLesson);

  const isToggling = isUpdatingLesson === lessonId;

  const handleToggle = async () => {
    if (disabled || isToggling) return;

    console.log("🍞 Toast hook available:", !!toast);
    console.log("🍞 Starting toggle for lesson:", lessonId);

    try {
      const currentStatus = isCompleted;
      const result = await updateLessonCompletion(
        lessonId,
        !currentStatus,
        childId
      );

      // No need to update local state since we're getting it directly from store

      // Show success toast with better messaging
      console.log("🍞 Toast will be shown:", {
        completed: result.completed,
        lessonTitle,
        result,
      });

      if (result.completed) {
        console.log("🍞 Showing completion toast");
        toast.success(`🎉 "${lessonTitle || "Ders"}" başarıyla tamamlandı!`);
      } else {
        console.log("🍞 Showing uncomplete toast");
        toast(`📝 "${lessonTitle || "Ders"}" tamamlanmadı olarak işaretlendi.`);
      }

      // Call optional callback
      if (onToggle) {
        onToggle(lessonId, result.completed);
      }
    } catch (error) {
      console.error("Toggle lesson completion error:", error);
      console.log("🍞 Showing error toast");
      toast.error(
        "❌ Ders durumu güncellenirken bir sorun yaşandı. Lütfen tekrar deneyin."
      );
    }
  };

  // Button variant
  if (variant === "button") {
    return (
      <Button
        onClick={handleToggle}
        disabled={disabled || isToggling}
        variant={isCompleted ? "default" : "outline"}
        size={size}
        className={cn(
          "transition-all duration-200",
          isCompleted
            ? "bg-green-600 hover:bg-green-700 text-white"
            : "hover:bg-blue-50 hover:border-blue-300",
          className
        )}
      >
        {isToggling ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : isCompleted ? (
          <CheckCircle className="h-4 w-4 mr-2" />
        ) : (
          <Circle className="h-4 w-4 mr-2" />
        )}

        {showText && (
          <span>
            {isToggling
              ? "Güncelleniyor..."
              : isCompleted
              ? "Tamamlanmadı Olarak İşaretle"
              : "Tamamla"}
          </span>
        )}
      </Button>
    );
  }

  // Badge variant
  if (variant === "badge") {
    return (
      <Badge
        onClick={handleToggle}
        variant={isCompleted ? "default" : "outline"}
        className={cn(
          "cursor-pointer transition-all duration-200 hover:scale-105",
          isCompleted
            ? "bg-green-100 text-green-800 hover:bg-green-200"
            : "hover:bg-blue-50 hover:border-blue-300",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        {isToggling ? (
          <Loader2 className="h-3 w-3 animate-spin mr-1" />
        ) : isCompleted ? (
          <CheckCircle className="h-3 w-3 mr-1" />
        ) : (
          <Circle className="h-3 w-3 mr-1" />
        )}

        {showText && (
          <span className="text-xs">
            {isToggling
              ? "Güncelleniyor..."
              : isCompleted
              ? "Tamamlandı"
              : "Tamamla"}
          </span>
        )}
      </Badge>
    );
  }

  // Icon variant
  return (
    <button
      onClick={handleToggle}
      disabled={disabled || isToggling}
      className={cn(
        "p-2 rounded-full transition-all duration-200 hover:scale-110",
        isCompleted
          ? "text-green-600 hover:bg-green-50"
          : "text-gray-400 hover:text-blue-600 hover:bg-blue-50",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
      title={
        isToggling
          ? "Güncelleniyor..."
          : isCompleted
          ? `"${lessonTitle || "Ders"}" tamamlandı olarak işaretli`
          : `"${lessonTitle || "Ders"}"i tamamla`
      }
    >
      {isToggling ? (
        <Loader2
          className={cn(
            "animate-spin",
            size === "sm" && "h-4 w-4",
            size === "default" && "h-5 w-5",
            size === "lg" && "h-6 w-6"
          )}
        />
      ) : isCompleted ? (
        <CheckCircle
          className={cn(
            "fill-current",
            size === "sm" && "h-4 w-4",
            size === "default" && "h-5 w-5",
            size === "lg" && "h-6 w-6"
          )}
        />
      ) : (
        <Circle
          className={cn(
            size === "sm" && "h-4 w-4",
            size === "default" && "h-5 w-5",
            size === "lg" && "h-6 w-6"
          )}
        />
      )}
    </button>
  );
}

// Lesson progress indicator component
interface LessonProgressIndicatorProps {
  lesson: Lesson;
  lessonId: string;
  courseId: string;
  lessonTitle: string;
  isActive?: boolean;
  onClick?: () => void;
  showToggle?: boolean;
  childId?: string;
}

export function LessonProgressIndicator({
  lesson,
  lessonId,
  courseId,
  lessonTitle,
  isActive = false,
  onClick,
  showToggle = true,
  childId,
}: LessonProgressIndicatorProps) {
  // Use selector to get specific lesson completion status - this will trigger re-render when it changes
  const isCompleted = useProgressStore(
    (state) =>
      state.courseProgresses[courseId]?.lessons[lessonId]?.completed || false
  );

  // Listen for updates from the toggle component
  const handleToggleUpdate = () => {
    // No need to do anything here since we're getting the value directly from store
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg transition-all duration-200",
        isActive ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50",
        onClick && "cursor-pointer"
      )}
    >
      {/* Completion Toggle */}
      {showToggle && (
        <LessonCompletionToggle
          lesson={lesson}
          lessonId={lessonId}
          courseId={courseId}
          lessonTitle={lessonTitle}
          variant="icon"
          size="sm"
          showText={false}
          childId={childId}
          onToggle={handleToggleUpdate}
        />
      )}

      {/* Lesson Info */}
      <div className="flex-1 min-w-0" onClick={onClick}>
        <div
          className={cn(
            "font-medium truncate",
            isCompleted && "text-green-700",
            isActive && "text-blue-700"
          )}
        >
          {lessonTitle}
        </div>
        <div>
          <div className="pb-2">
            <div className="flex items-center gap-2">
              {lesson.videoUrl && (
                <span className="flex items-center gap-1 text-xs text-red-600 bg-red-100 dark:bg-red-900/20 px-1.5 py-0.5 rounded">
                  <Play className="h-2 w-2" />
                  Video
                </span>
              )}
              {lesson.content && (
                <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-100 dark:bg-blue-900/20 px-1.5 py-0.5 rounded">
                  <FileText className="h-2 w-2" />
                  İçerik
                </span>
              )}
              {lesson.pdfUrl && (
                <span className="flex items-center gap-1 text-xs text-purple-600 bg-purple-100 dark:bg-purple-900/20 px-1.5 py-0.5 rounded">
                  <FileText className="h-2 w-2" />
                  PDF
                </span>
              )}
            </div>
          </div>
        </div>

        {isCompleted && (
          <div className="text-xs text-green-600 mt-1">✓ Tamamlandı</div>
        )}
      </div>

      {/* Play/Active Indicator */}
      {isActive && (
        <div className="text-blue-600">
          <Play className="h-4 w-4 fill-current" />
        </div>
      )}
    </div>
  );
}
