import React from 'react';
import { NewsItem } from '../../../../types';

interface RightSidebarProps {
    updates: NewsItem[];
}

const RightSidebar: React.FC<RightSidebarProps> = ({ updates }) => (
    <div className="bg-sidebar-accent rounded-2xl p-6 h-full">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Latest Updates</h3>
            <button className="text-sm font-semibold text-text-secondary hover:text-text-main">See more</button>
        </div>
        <div className="space-y-5">
            {updates.map(item => (
                 <div key={item.id} className="flex gap-4 group cursor-pointer">
                    <img src={item.thumbnail_url || `https://picsum.photos/seed/${item.id}/200/120`} alt={item.title} className="w-28 h-20 object-cover rounded-lg flex-shrink-0"/>
                    <div>
                        <h4 className="font-semibold text-sm text-text-main group-hover:text-secondary transition-colors">{item.title}</h4>
                        <p className="text-xs text-text-secondary mt-1">By {item.author?.name || 'Alleye'}</p>
                    </div>
                 </div>
            ))}
        </div>
    </div>
);

export default RightSidebar;
