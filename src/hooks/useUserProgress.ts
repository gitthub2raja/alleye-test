import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

interface UserProgress {
  id: string;
  user_id: string;
  video_id: string;
  completed: boolean;
  quiz_score: number | null;
  watched_at: string;
}

export const useUserProgress = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's progress
  const { data: progress = [], isLoading } = useQuery({
    queryKey: ['user-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching progress:', error);
        return [];
      }

      return data as UserProgress[];
    },
    enabled: !!user?.id,
  });

  // Mark video as completed
  const markCompleted = useMutation({
    mutationFn: async ({ videoId, quizScore }: { videoId: string; quizScore?: number }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          video_id: videoId,
          completed: true,
          quiz_score: quizScore || null,
          watched_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,video_id'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-progress', user?.id] });
    },
  });

  // Get completion status for a specific video
  const isVideoCompleted = (videoId: string) => {
    return progress.some(p => p.video_id === videoId && p.completed);
  };

  // Get completion percentage
  const getCompletionPercentage = (totalVideos: number) => {
    if (totalVideos === 0) return 0;
    const completedCount = progress.filter(p => p.completed).length;
    return Math.round((completedCount / totalVideos) * 100);
  };

  return {
    progress,
    isLoading,
    markCompleted,
    isVideoCompleted,
    getCompletionPercentage,
    completedCount: progress.filter(p => p.completed).length,
  };
};
