import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { videoSchema, VideoFormData, normalizeYoutubeUrl } from "@/lib/videoSchemas";
import ReactPlayer from 'react-player';

interface VideoFormProps {
  onSubmit: (data: VideoFormData) => Promise<void>;
  initialData?: Partial<VideoFormData>;
  submitLabel?: string;
}

const Player = ReactPlayer as any;

export const VideoForm = ({ onSubmit, initialData, submitLabel = "Add Video" }: VideoFormProps) => {
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);
  const [embedCheck, setEmbedCheck] = useState<{ status: 'idle' | 'success' | 'error', message?: string }>({ status: 'idle' });
  const [normalizedUrl, setNormalizedUrl] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<VideoFormData>({
    resolver: zodResolver(videoSchema),
    defaultValues: initialData || {
      difficulty: 'Beginner',
    },
  });

  const videoUrl = watch('video_url');
  const difficulty = watch('difficulty');

  const checkEmbeddability = async () => {
    if (!videoUrl) {
      toast({
        title: 'Enter URL first',
        description: 'Please enter a YouTube URL before checking',
        variant: 'destructive',
      });
      return;
    }

    setIsChecking(true);
    setEmbedCheck({ status: 'idle' });

    try {
      const normalized = normalizeYoutubeUrl(videoUrl);
      setNormalizedUrl(normalized);
      setValue('video_url', normalized);

      // Wait for player to attempt load
      setTimeout(() => {
        setEmbedCheck({
          status: 'success',
          message: 'URL normalized. Test playback below.',
        });
        setIsChecking(false);
      }, 1000);
    } catch (error: any) {
      setEmbedCheck({
        status: 'error',
        message: error.message || 'Invalid YouTube URL',
      });
      setIsChecking(false);
    }
  };

  const handleFormSubmit = async (data: VideoFormData) => {
    try {
      // Normalize URL before submitting
      const normalizedData = {
        ...data,
        video_url: normalizeYoutubeUrl(data.video_url),
      };
      await onSubmit(normalizedData);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save video',
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Video Details</CardTitle>
          <CardDescription>Add or edit video information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Introduction to Cybersecurity"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Learn the basics of cybersecurity..."
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                {...register('category')}
                placeholder="Fundamentals"
              />
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty *</Label>
              <Select
                value={difficulty}
                onValueChange={(value) => setValue('difficulty', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
              {errors.difficulty && (
                <p className="text-sm text-destructive">{errors.difficulty.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration *</Label>
            <Input
              id="duration"
              {...register('duration')}
              placeholder="15 min"
            />
            {errors.duration && (
              <p className="text-sm text-destructive">{errors.duration.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnail">Thumbnail URL *</Label>
            <Input
              id="thumbnail"
              {...register('thumbnail')}
              placeholder="https://images.unsplash.com/..."
            />
            {errors.thumbnail && (
              <p className="text-sm text-destructive">{errors.thumbnail.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="video_url">YouTube URL *</Label>
            <div className="flex gap-2">
              <Input
                id="video_url"
                {...register('video_url')}
                placeholder="https://www.youtube.com/watch?v=..."
              />
              <Button
                type="button"
                variant="outline"
                onClick={checkEmbeddability}
                disabled={isChecking}
              >
                {isChecking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Check'
                )}
              </Button>
            </div>
            {errors.video_url && (
              <p className="text-sm text-destructive">{errors.video_url.message}</p>
            )}
            {embedCheck.status !== 'idle' && (
              <div className={`flex items-center gap-2 text-sm ${
                embedCheck.status === 'success' ? 'text-green-600' : 'text-destructive'
              }`}>
                {embedCheck.status === 'success' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <span>{embedCheck.message}</span>
              </div>
            )}
          </div>

          {normalizedUrl && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="aspect-video bg-black rounded-md overflow-hidden">
                <Player
                  url={normalizedUrl}
                  width="100%"
                  height="100%"
                  controls={true}
                  onError={(e: any) => {
                    setEmbedCheck({
                      status: 'error',
                      message: 'This video cannot be embedded. Try another video.',
                    });
                  }}
                  onReady={() => {
                    setEmbedCheck({
                      status: 'success',
                      message: '✓ Video is embeddable and ready',
                    });
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  );
};
