import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { mockQuizzes } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Play, Pause } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserProgress } from "@/hooks/useUserProgress";
import VideoPlayerComponent, { type VideoPlayerHandle } from "@/components/VideoPlayerComponent";
import { useVideoUrl } from "@/hooks/useVideoUrl";

const VideoPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { markCompleted } = useUserProgress();

  const playerRef = useRef<VideoPlayerHandle | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [watchProgress, setWatchProgress] = useState(0);

  const { data: video, isLoading } = useVideoUrl(id);

  const quiz = mockQuizzes.find(q => q.videoId === id);

  useEffect(() => {
    if (!isLoading && !video) {
      navigate("/dashboard");
    }
  }, [video, isLoading, navigate]);

  const handleProgress = useCallback((progress: number) => {
    setWatchProgress(progress);
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    
    // Mark video as completed in database
    if (id) {
      markCompleted.mutate({ videoId: id });
    }
    
    if (quiz) {
      setShowCountdown(true);
      toast({
        title: "Video completed!",
        description: "Get ready for the quiz...",
      });
    } else {
      toast({
        title: "Video completed!",
        description: "Great job watching this video!",
      });
    }
  }, [quiz, toast, id, markCompleted]);

  const playerUrl = useMemo(() => {
    // Prefer signed HLS URL if available, then HLS, then original/video_url (normalized YouTube)
    if ((video as any)?.signedUrl) return (video as any).signedUrl as string;
    if ((video as any)?.hls_url) return (video as any).hls_url as string;
    const raw = (video as any)?.video_url;
    if (!raw) return '';
    try {
      const url = new URL(raw);
      if (url.hostname.includes('youtu.be')) {
        const id = url.pathname.replace('/', '');
        return `https://www.youtube.com/watch?v=${id}`;
      }
      const id = url.searchParams.get('v');
      return id ? `https://www.youtube.com/watch?v=${id}` : raw;
    } catch {
      return raw;
    }
  }, [video]);

  useEffect(() => {
    if (showCountdown && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (showCountdown && countdown === 0) {
      navigate(`/quiz/${id}`);
    }
  }, [showCountdown, countdown, id, navigate]);

  const togglePlay = useCallback((e?: any) => {
    if (e?.preventDefault) e.preventDefault();
    if (e?.stopPropagation) e.stopPropagation();
    if (isPlaying) {
      playerRef.current?.pause();
      setIsPlaying(false);
    } else {
      playerRef.current?.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-primary text-xl">
        Loading video...
      </div>
    );
  }

  if (!video) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-5xl">
          {/* Video Player */}
          <Card className="mb-6 overflow-hidden border-primary/20">
            <div className="relative aspect-video bg-black">
              <VideoPlayerComponent
                ref={playerRef}
                url={playerUrl}
                isPlaying={isPlaying}
                onProgress={handleProgress}
                onEnded={handleEnded}
              />

              {showCountdown && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
                  <h2 className="mb-4 text-4xl font-bold text-primary">Quiz Starting In</h2>
                  <div className="text-8xl font-bold text-accent animate-glow-pulse">
                    {countdown}
                  </div>
                  <p className="mt-4 text-xl text-muted-foreground">Prepare yourself...</p>
                </div>
              )}
            </div>
          </Card>

          {/* Video Info */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{video.title}</CardTitle>
                  <CardDescription className="mt-2">{video.description}</CardDescription>
                </div>
                <Button variant="outline" onClick={togglePlay}>
                  {isPlaying ? (
                    <>
                      <Pause className="mr-2 h-4 w-4" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Play
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Category:</span>{" "}
                  <span className="font-medium text-primary">{video.category}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Difficulty:</span>{" "}
                  <span className="font-medium">{video.difficulty}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Duration:</span>{" "}
                  <span className="font-medium">{video.duration}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
