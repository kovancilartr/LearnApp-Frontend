"use client";

import { useState, useEffect } from "react";
import { Lesson } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProgressStore } from "@/store/progressStore";
import { cn } from "@/lib/utils";
import { LessonVideoPlayer } from "./LessonVideoPlayer";
import {
  CheckCircle,
  FileText,
  Download,
  Clock,
  Eye,
  Circle,
  Loader2,
} from "lucide-react";

interface LessonVideoContentProps {
  lesson: Lesson;
  isCompleted?: boolean;
  onMarkComplete?: (lessonId: string) => void;
  isMarkingComplete?: boolean;
  courseId: string;
}

export function LessonVideoContent({
  lesson,
  isCompleted = false,
  onMarkComplete,
  isMarkingComplete = false,
  courseId,
}: LessonVideoContentProps) {
  const { getLessonCompletionStatus } = useProgressStore();

  // Get real-time completion status from store
  const actualIsCompleted = getLessonCompletionStatus(courseId, lesson.id);
  const [showCompletionPrompt, setShowCompletionPrompt] = useState(false);
  const [watchTime, setWatchTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Auto-show completion prompt after 5 minutes of watching
  useEffect(() => {
    if (watchTime >= 300 && !actualIsCompleted && !showCompletionPrompt) {
      setShowCompletionPrompt(true);
    }
  }, [watchTime, actualIsCompleted, showCompletionPrompt]);

  const handleMarkComplete = () => {
    if (onMarkComplete) {
      onMarkComplete(lesson.id);
      setShowCompletionPrompt(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    if (!actualIsCompleted && !showCompletionPrompt) {
      setShowCompletionPrompt(true);
    }
  };

  const handleTimeUpdate = (currentTime: number) => {
    setWatchTime(currentTime);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Completion Prompt */}
      {showCompletionPrompt && !actualIsCompleted && (
        <div className="p-6">
          <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 dark:border-green-800 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-2xl flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-green-900 dark:text-green-100 text-lg">
                      Harika! Dersi tamamladınız mı?
                    </h3>
                    <p className="text-green-700 dark:text-green-300">
                      Bu dersi tamamlandı olarak işaretleyerek ilerlemenizi
                      kaydedin.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowCompletionPrompt(false)}
                    className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900/20"
                  >
                    Daha Sonra
                  </Button>
                  <Button
                    onClick={handleMarkComplete}
                    disabled={isMarkingComplete}
                    className="bg-green-600 hover:bg-green-700 shadow-lg"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Tamamlandı
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="p-6">
        <div className="space-y-8">
          {/* Video Player */}
          {(lesson as any).videoUrl && (
            <div className="space-y-4">
              {/* Lesson Title Header */}
              <div className="bg-card px-6 py-4 rounded-t-lg border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-xl">{lesson.title}</h2>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Clock className="h-4 w-4" />
                        <span>İzleme süresi: {formatTime(watchTime)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Eye className="h-4 w-4" />
                        <span>1.2K görüntülenme</span>
                      </div>
                      {isPlaying && (
                        <div className="flex items-center gap-2 text-green-500 text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <span>Oynatılıyor</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() =>
                        onMarkComplete && onMarkComplete(lesson.id)
                      }
                      disabled={isMarkingComplete}
                      variant={actualIsCompleted ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "transition-all duration-200",
                        actualIsCompleted
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "hover:bg-blue-50 hover:border-blue-300"
                      )}
                    >
                      {isMarkingComplete ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : actualIsCompleted ? (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      ) : (
                        <Circle className="h-4 w-4 mr-2" />
                      )}
                      <span>
                        {isMarkingComplete
                          ? "Güncelleniyor..."
                          : actualIsCompleted
                          ? "Tamamlanmadı Olarak İşaretle"
                          : "Tamamla"}
                      </span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Video Player */}
              <div className="rounded-b-lg overflow-hidden">
                <div className="px-4 md:px-8 lg:px-16 xl:px-24 py-4 bg-background">
                  <div className="w-full max-w-6xl mx-auto">
                    <LessonVideoPlayer videoUrl={(lesson as any).videoUrl} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content and Materials Grid */}
          {((lesson as any).content || (lesson as any).pdfUrl) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Text Content */}
              {(lesson as any).content && (
                <Card className="h-fit">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold">Ders İçeriği</h2>
                    </div>
                    <div
                      className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground prose-code:bg-muted prose-code:text-primary prose-code:px-2 prose-code:py-1 prose-code:rounded"
                      dangerouslySetInnerHTML={{
                        __html: (lesson as any).content,
                      }}
                    />
                  </CardContent>
                </Card>
              )}

              {/* PDF Download */}
              {(lesson as any).pdfUrl && (
                <Card className="h-fit">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold">Ders Materyali</h2>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-muted/50 to-muted rounded-2xl border border-border">
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center">
                            <FileText className="h-8 w-8 text-red-500" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg">PDF Dosyası</h3>
                            <p className="text-muted-foreground mt-1">
                              Ders materyalini indirin ve çevrimdışı okuyun
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            📄 PDF Format
                          </span>
                          <span className="flex items-center gap-1">
                            📱 Mobil Uyumlu
                          </span>
                          <span className="flex items-center gap-1">
                            🔄 Güncel İçerik
                          </span>
                        </div>

                        <Button
                          asChild
                          className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <a
                            href={(lesson as any).pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                          >
                            <Download className="h-4 w-4 mr-2" />
                            İndir
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* No Content Message */}
          {!(lesson as any).videoUrl &&
            !(lesson as any).content &&
            !(lesson as any).pdfUrl && (
              <Card>
                <CardContent className="text-center py-20">
                  <div className="w-24 h-24 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <FileText className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">
                    İçerik Henüz Eklenmemiş
                  </h3>
                  <p className="text-muted-foreground text-lg max-w-md mx-auto">
                    Bu ders için henüz içerik eklenmemiş. Eğitmeniniz yakında
                    içerik ekleyecektir.
                  </p>
                </CardContent>
              </Card>
            )}
        </div>
      </div>
    </div>
  );
}
