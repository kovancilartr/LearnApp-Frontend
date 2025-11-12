"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { cn } from "@/lib/utils";
import Plyr from "plyr";
import "plyr/dist/plyr.css";
import { Loader2 } from "lucide-react";

type AspectRatio = "16:9" | "4:3" | "1:1" | "21:9" | "9:16";

interface LessonVideoPlayerProps {
  videoUrl: string;
  onTimeUpdate?: (currentTime: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onReady?: () => void;
  plyrOptions?: Partial<Plyr.Options>;
  aspectRatio?: AspectRatio;
  className?: string;
}

export function LessonVideoPlayer({
  videoUrl,
  onTimeUpdate,
  onPlay,
  onPause,
  onEnded,
  onReady,
  plyrOptions = {},
  aspectRatio = "16:9",
  className,
}: LessonVideoPlayerProps) {
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Plyr | null>(null);

  // Aspect ratio class mapping
  const aspectRatioClasses = {
    "16:9": "aspect-video", // 16:9
    "4:3": "aspect-[4/3]", // 4:3
    "1:1": "aspect-square", // 1:1
    "21:9": "aspect-[21/9]", // 21:9 (ultrawide)
    "9:16": "aspect-[9/16]", // 9:16 (vertical/mobile)
  };

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Default Plyr options - memoized to prevent useEffect re-runs
  const defaultPlyrOptions = useMemo<Plyr.Options>(
    () => ({
      controls: [
        "play-large",
        "play",
        "progress",
        "current-time",
        "duration",
        "mute",
        "volume",
        "settings",
        "fullscreen",
      ],
      settings: ["quality", "speed"],
      quality: {
        default: 720,
        options: [4320, 2880, 2160, 1440, 1080, 720, 576, 480, 360, 240],
      },
      speed: {
        selected: 1,
        options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
      },
      youtube: {
        noCookie: true,
        rel: 0,
        showinfo: 0,
        iv_load_policy: 3,
        modestbranding: 1,
      },
    }),
    []
  );

  // Initialize video player
  useEffect(() => {
    if (videoRef.current && videoUrl) {
      const youtubeVideoId = getYouTubeVideoId(videoUrl);

      if (youtubeVideoId) {
        const container = videoRef.current;
        container.innerHTML = `<div data-plyr-provider="youtube" data-plyr-embed-id="${youtubeVideoId}"></div>`;

        const plyrElement = container.querySelector(
          "[data-plyr-provider]"
        ) as HTMLElement;

        if (plyrElement) {
          // Merge default options with custom options
          const mergedOptions = { ...defaultPlyrOptions, ...plyrOptions };

          playerRef.current = new Plyr(plyrElement, mergedOptions);

          // Event listeners
          playerRef.current.on("ready", () => {
            setIsVideoLoading(false);
            onReady?.();
          });

          playerRef.current.on("timeupdate", () => {
            if (playerRef.current) {
              const currentTime = Math.floor(playerRef.current.currentTime);
              onTimeUpdate?.(currentTime);
            }
          });

          playerRef.current.on("ended", () => {
            onEnded?.();
          });

          playerRef.current.on("play", () => {
            onPlay?.();
          });

          playerRef.current.on("pause", () => {
            onPause?.();
          });
        }
      }
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [
    videoUrl,
    plyrOptions,
    onTimeUpdate,
    onPlay,
    onPause,
    onEnded,
    onReady,
    defaultPlyrOptions,
  ]);

  return (
    <div className={cn("w-full relative", className)}>
      <div className={cn("w-full relative", aspectRatioClasses[aspectRatio])}>
        {/* Loading Overlay */}
        {isVideoLoading && (
          <div className="absolute inset-0 bg-muted rounded-lg flex items-center justify-center z-10">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm font-medium">Video yükleniyor...</p>
            </div>
          </div>
        )}

        {/* Plyr Video Player */}
        <div
          ref={videoRef}
          className="w-full h-full rounded-lg overflow-hidden"
        />
      </div>
    </div>
  );
}
