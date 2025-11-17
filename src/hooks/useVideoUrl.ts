import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface Video {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration: string;
  thumbnail_url: string;
  video_url: string;
  hls_url?: string;
  signedUrl?: string;
  processing_status: string;
}

export const useVideoUrl = (videoId: string | undefined) => {
  return useQuery({
    queryKey: ['video-url', videoId],
    queryFn: async () => {
      if (!videoId) throw new Error('Video ID is required');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Prefer server function for signed HLS; gracefully fallback to direct table read
      try {
        const { data, error } = await supabase.functions.invoke('get-video-url', {
          body: { videoId },
        });
        if (error) throw error;
        if (data?.video) return data.video as Video;
      } catch (_) {
        // swallow and fallback
      }

      const { data: row, error: rowError } = await supabase
        .from('videos')
        .select('*')
        .eq('id', videoId)
        .maybeSingle();
      if (rowError) throw rowError;
      if (!row) throw new Error('Video not found');
      return row as Video;
    },
    enabled: !!videoId,
    staleTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
  });
};
