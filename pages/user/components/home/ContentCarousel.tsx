import React from 'react';
import { Content, UserProgress } from '../../../../types';
import HomeContentCard from './HomeContentCard';

interface ContentCarouselProps {
    title: string;
    items: Content[];
    onPlay: (c: Content) => void;
    progress?: UserProgress;
}

const ContentCarousel: React.FC<ContentCarouselProps> = ({ title, items, onPlay, progress }) => (
    <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold">{title}</h3>
            <button className="text-sm font-semibold text-text-secondary hover:text-text-main">See all &gt;</button>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
            {items.map(item => (
                <HomeContentCard 
                    key={item.id} 
                    item={item} 
                    onPlay={onPlay}
                    status={progress?.[item.id]?.status || 'not-started'}
                />
            ))}
        </div>
    </div>
);

export default ContentCarousel;
