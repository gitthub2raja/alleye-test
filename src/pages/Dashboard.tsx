import { useState, useMemo } from "react";
import { Video } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Play, Clock, Award, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useUserProgress } from "@/hooks/useUserProgress";
import kyureusLogo from "@/assets/kyureeus-logo.jpeg";

const fetchVideos = async (): Promise<Video[]> => {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .order('title', { ascending: true });

  if (error) {
    console.error("Supabase fetch error:", error);
    throw new Error("Failed to fetch videos from the database.");
  }

  return data as Video[];
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { completedCount, getCompletionPercentage, isVideoCompleted, progress } = useUserProgress();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  
  const { data: videos = [], isLoading, isError } = useQuery({
    queryKey: ['videos'],
    queryFn: fetchVideos,
    initialData: [],
  });

  // Memoize computed values to prevent unnecessary re-renders
  const allCategories = useMemo(() => {
    return videos.length > 0
      ? ["All", ...new Set(videos.map(v => v.category))]
      : ["All"];
  }, [videos]);
  
  const filteredVideos = useMemo(() => {
    return selectedCategory === "All" 
      ? videos 
      : videos.filter(v => v.category === selectedCategory);
  }, [selectedCategory, videos]);
  
  const progressPercentage = useMemo(() => {
    return getCompletionPercentage(videos.length);
  }, [videos.length, getCompletionPercentage]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-primary text-xl">
        Loading video library...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen text-center p-8 text-destructive">
        Error: Failed to load videos. Please check Supabase connection.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <img src={kyureusLogo} alt="Kyureeus Logo" className="h-8" />
            <h1 className="text-lg font-orbitron font-bold text-primary tracking-wide">All Eye</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.email?.split('@')[0] || 'User'}</p>
              <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Overview */}
        <Card className="mb-8 border-primary/20">
          <CardContent className="pt-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Your Progress</h2>
                <p className="text-muted-foreground">
                  {completedCount} of {videos.length} videos completed
                </p>
              </div>
              <Award className="h-12 w-12 text-accent" />
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </CardContent>
        </Card>

        {/* Category Filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          {allCategories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              size="sm"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Video Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredVideos.map((video) => {
            const isCompleted = isVideoCompleted(video.id);
            const videoProgress = progress.find(p => p.video_id === video.id);
            
            return (
              <Link key={video.id} to={`/video/${video.id}`}>
                <Card className="video-card group overflow-hidden border-border hover:shadow-xl">
                  <div className="relative aspect-video overflow-hidden">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      <Play className="h-16 w-16 text-primary" />
                    </div>
                    <Badge className="absolute right-2 top-2" variant={isCompleted ? "default" : "secondary"}>
                      {isCompleted ? "Completed" : "Watch"}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <Badge variant="outline">{video.difficulty}</Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-1 h-4 w-4" />
                        {video.duration}
                      </div>
                    </div>
                    <h3 className="mb-2 font-semibold group-hover:text-primary">{video.title}</h3>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{video.description}</p>
                    {isCompleted && videoProgress?.quiz_score && (
                      <div className="mt-3 flex items-center gap-2 text-sm">
                        <Award className="h-4 w-4 text-accent" />
                        <span className="text-accent">Quiz Score: {videoProgress.quiz_score}%</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
