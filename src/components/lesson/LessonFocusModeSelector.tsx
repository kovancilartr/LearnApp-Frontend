"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLessonFocusStore, LessonFocusMode } from "@/store/lessonFocusStore";
import { Monitor, Palette, Zap, Settings, Check } from "lucide-react";
import { toast } from "react-hot-toast";

interface LessonFocusModeSelectorProps {
  className?: string;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg";
}

export function LessonFocusModeSelector({
  className,
  variant = "ghost",
  size = "sm",
}: LessonFocusModeSelectorProps) {
  const { getCurrentMode, canUserChoose, setUserPreference } =
    useLessonFocusStore();

  const [isChanging, setIsChanging] = useState(false);

  const currentMode = getCurrentMode();
  const canChoose = canUserChoose();

  const modeOptions = [
    {
      value: "modern" as LessonFocusMode,
      label: "Modern Tasarım",
      description: "Tam ekran deneyim",
      icon: Monitor,
    },
    {
      value: "classic" as LessonFocusMode,
      label: "Klasik Tasarım",
      description: "Sidebar ile",
      icon: Palette,
    },
    {
      value: "auto" as LessonFocusMode,
      label: "Otomatik",
      description: "Sistem varsayılanı",
      icon: Zap,
    },
  ];

  const handleModeChange = async (mode: LessonFocusMode | null) => {
    try {
      setIsChanging(true);
      setUserPreference(mode);

      const modeLabel = mode
        ? modeOptions.find((opt) => opt.value === mode)?.label
        : "Sistem Varsayılanı";

      toast.success(`Ders görünümü "${modeLabel}" olarak ayarlandı!`);
    } catch (error) {
      console.error("Error changing lesson focus mode:", error);
      toast.error("Görünüm değiştirilirken bir hata oluştu.");
    } finally {
      setIsChanging(false);
    }
  };

  if (!canChoose) {
    return null; // Don't show if user can't choose
  }

  const currentModeOption = modeOptions.find(
    (opt) => opt.value === currentMode
  );
  const CurrentIcon = currentModeOption?.icon || Settings;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          disabled={isChanging}
          title="Ders Görünümünü Değiştir"
        >
          <CurrentIcon className="h-4 w-4" />
          <span className="hidden sm:inline ml-2">
            {isChanging ? "Değiştiriliyor..." : currentModeOption?.label}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Ders Görünümü</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {modeOptions.map((option) => {
          const Icon = option.icon;
          const isCurrent = currentMode === option.value;

          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleModeChange(option.value)}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <Icon className="h-4 w-4" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{option.label}</span>
                  {isCurrent && <Check className="h-3 w-3 text-green-600" />}
                </div>
                <p className="text-xs text-muted-foreground">
                  {option.description}
                </p>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
