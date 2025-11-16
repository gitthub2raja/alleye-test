import React from 'react';
import { Content } from '../../../../types';
import Card from '../../../../components/common/Card';
import Button from '../../../../components/common/Button';
import { LightBulbIcon } from '../../../../constants';
import { SkeletonLoader } from '../Skeletons';

const RecommendationCard: React.FC<{
    item: { content: Content; reason: string };
    onPlay: (c: Content) => void;
}> = ({ item, onPlay }) => {
    const { content, reason } = item;
    return (
        <Card className="!p-0 flex flex-col group overflow-hidden w-64 flex-shrink-0">
            <div className="relative">
                <img src={content.thumbnail_url || `https://picsum.photos/seed/${content.id}/400/225`} alt={content.title} className="w-full h-36 object-cover" />
            </div>
            <div className="p-4 flex-1 flex flex-col">
                <h4 className="font-semibold text-text-main text-sm truncate flex-1">{content.title}</h4>
                <p className="text-xs text-text-secondary mt-1">{content.category} &bull; {content.difficulty}</p>
                <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs font-semibold text-primary mb-1 flex items-center gap-1.5">
                        <LightBulbIcon className="w-4 h-4"/>
                        RECOMMENDED FOR YOU
                    </p>
                    <p className="text-xs text-text-secondary italic">"{reason}"</p>
                </div>
                <Button variant="secondary" size="sm" className="w-full mt-3" onClick={() => onPlay(content)}>
                    Start Learning
                </Button>
            </div>
        </Card>
    );
};

const RecommendationCarousel: React.FC<{
    title: string;
    items: {content: Content; reason: string}[] | null;
    isLoading: boolean;
    error: string | null;
    onPlay: (c: Content) => void;
}> = ({ title, items, isLoading, error, onPlay }) => {
    if (isLoading) {
        return (
            <div className="mt-8">
                <h3 className="text-2xl font-bold mb-4">{title}</h3>
                <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="w-64 flex-shrink-0">
                            <SkeletonLoader className="h-36 w-full rounded-xl" />
                            <SkeletonLoader className="h-4 w-3/4 mt-2" />
                            <SkeletonLoader className="h-3 w-1/2 mt-1" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error || !items || items.length === 0) {
        return null; 
    }

    return (
        <div className="mt-8">
            <h3 className="text-2xl font-bold mb-4">{title}</h3>
            <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
                {items.map(item => (
                    <RecommendationCard 
                        key={item.content.id} 
                        item={item} 
                        onPlay={onPlay}
                    />
                ))}
            </div>
        </div>
    );
};

export default RecommendationCarousel;
