import { forwardRef, useEffect, useImperativeHandle, useRef, memo } from "react";

export type VideoPlayerHandle = {
  play: () => Promise<void> | void;
  pause: () => void;
  element: HTMLVideoElement | null;
};

interface VideoPlayerComponentProps {
  url: string;
  isPlaying: boolean;
  onProgress: (progress: number) => void;
  onEnded: () => void;
}

const VideoPlayerComponent = forwardRef<VideoPlayerHandle, VideoPlayerComponentProps>(
  ({ url, isPlaying, onProgress, onEnded }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useImperativeHandle(ref, () => ({
      play: () => videoRef.current?.play(),
      pause: () => videoRef.current?.pause(),
      element: videoRef.current,
    }));

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      video.muted = false;

      if (isPlaying) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    }, [isPlaying]);

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const handleTimeUpdate = () => {
        if (!isFinite(video.duration) || video.duration === 0) return;
        onProgress((video.currentTime / video.duration) * 100);
      };

      const handleEnded = () => {
        onEnded();
      };

      video.addEventListener("timeupdate", handleTimeUpdate);
      video.addEventListener("ended", handleEnded);

      return () => {
        video.removeEventListener("timeupdate", handleTimeUpdate);
        video.removeEventListener("ended", handleEnded);
      };
    }, [onProgress, onEnded]);

    return (
      <video
        ref={videoRef}
        src={url}
        muted={false}
        playsInline={true}
        controls
        preload="metadata"
        className="h-full w-full"
      />
    );
  }
);

VideoPlayerComponent.displayName = "VideoPlayerComponent";

// Memoize component to prevent unnecessary re-renders
export default memo(VideoPlayerComponent);

