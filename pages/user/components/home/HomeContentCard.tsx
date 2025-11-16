import React from 'react';
import { Content } from '../../../../types';

const PlayIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg role="img" height="24" width="24" aria-hidden="true" viewBox="0 0 24 24" {...props} fill="currentColor"><path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path></svg>);

interface HomeContentCardProps {
    item: Content;
    onPlay: (c: Content) => void;
    status: 'not-started' | 'in-progress' | 'completed';
}

const HomeContentCard: React.FC<HomeContentCardProps> = ({ item, onPlay, status }) => {
    const progressPercentage = status === 'completed' ? 100 : status === 'in-progress' ? 50 : 0;
    
    return (
        <div onClick={() => onPlay(item)} className="w-64 flex-shrink-0 group cursor-pointer">
            <div className="relative rounded-xl overflow-hidden shadow-md">
                <img src={item.thumbnail_url || `https://picsum.photos/seed/${item.id}/400/225`} alt={item.title} className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"/>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <PlayIcon className="w-10 h-10 text-white/80 drop-shadow-lg" />
                </div>
                 {progressPercentage > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-sidebar-accent/50">
                        <div 
                            className={`h-full transition-all duration-500 ${status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}`}
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                )}
            </div>
            <h4 className="mt-2 font-semibold text-text-main text-sm truncate">{item.title}</h4>
            <p className="text-xs text-text-secondary">{item.category}</p>
        </div>
    );
};

export default HomeContentCard;
