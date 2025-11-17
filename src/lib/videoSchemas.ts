import { z } from 'zod';

export const videoSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
  category: z.string()
    .min(2, 'Category is required'),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  duration: z.string()
    .min(1, 'Duration is required (e.g., "15 min")'),
  thumbnail: z.string()
    .url('Must be a valid URL')
    .min(1, 'Thumbnail URL is required'),
  video_url: z.string()
    .min(1, 'YouTube URL is required')
    .refine((url) => {
      try {
        const urlObj = new URL(url);
        return (
          urlObj.hostname.includes('youtube.com') ||
          urlObj.hostname.includes('youtu.be')
        );
      } catch {
        return false;
      }
    }, 'Must be a valid YouTube URL'),
});

export type VideoFormData = z.infer<typeof videoSchema>;

export const normalizeYoutubeUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    
    // Handle youtu.be short links
    if (urlObj.hostname.includes('youtu.be')) {
      const videoId = urlObj.pathname.replace('/', '');
      return `https://www.youtube.com/watch?v=${videoId}`;
    }
    
    // Extract video ID from YouTube URL
    const videoId = urlObj.searchParams.get('v');
    if (!videoId) {
      throw new Error('Invalid YouTube URL: missing video ID');
    }
    
    // Return clean watch URL without playlist or other params
    return `https://www.youtube.com/watch?v=${videoId}`;
  } catch (error) {
    throw new Error('Failed to normalize YouTube URL');
  }
};
