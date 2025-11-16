import React from 'react';
import { Content, NewsItem, UserProgress } from '../../../types';
import HeroSection from '../components/home/HeroSection';
import ContentCarousel from '../components/home/ContentCarousel';
import RecommendationCarousel from '../components/home/RecommendationCarousel';
import RightSidebar from '../components/home/RightSidebar';
import { SkeletonLoader } from '../components/Skeletons';

interface HomeViewProps {
    featuredContent: Content | undefined;
    continueLearning: Content[];
    newContent: Content[];
    recommendations: {content: Content; reason: string}[] | null;
    updates: NewsItem[];
    onPlay: (content: Content) => void;
    onNewsRead: (item: NewsItem) => void;
    loading: boolean;
    recLoading: boolean;
    recError: string | null;
    userProgress?: UserProgress;
}

const HomeView: React.FC<HomeViewProps> = ({
    featuredContent,
    continueLearning,
    newContent,
    recommendations,
    updates,
    onPlay,
    onNewsRead,
    loading,
    recLoading,
    recError,
    userProgress
}) => {
    if (loading) {
        return (
            <div className="space-y-6">
                <SkeletonLoader className="h-96 w-full rounded-2xl" />
                <SkeletonLoader className="h-8 w-1/4" />
                <div className="flex gap-6">
                    <SkeletonLoader className="w-64 h-48 flex-shrink-0" />
                    <SkeletonLoader className="w-64 h-48 flex-shrink-0" />
                    <SkeletonLoader className="w-64 h-48 flex-shrink-0" />
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    {featuredContent && <HeroSection item={featuredContent} onPlay={onPlay} />}

                    <RecommendationCarousel
                        title="Recommended For You"
                        items={recommendations}
                        isLoading={recLoading}
                        error={recError}
                        onPlay={onPlay}
                    />
                    
                    {continueLearning.length > 0 && (
                        <ContentCarousel 
                            title="Continue Learning" 
                            items={continueLearning} 
                            onPlay={onPlay} 
                            progress={userProgress}
                        />
                    )}

                    {newContent.length > 0 && (
                        <ContentCarousel 
                            title="New For You" 
                            items={newContent} 
                            onPlay={onPlay} 
                            progress={userProgress}
                        />
                    )}
                </div>
                <div className="lg:col-span-1">
                    <RightSidebar updates={updates} />
                </div>
            </div>
        </div>
    );
};

export default HomeView;
