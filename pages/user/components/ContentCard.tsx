import React from 'react';
import { Content } from '../../../types';
import Card from '../../../components/common/Card';

const PlayIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg role="img" height="24" width="24" aria-hidden="true" viewBox="0 0 24 24" {...props} fill="currentColor"><path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path></svg>);
const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

interface ContentCardProps {
    item: Content;
    onPlay: (content: Content) => void;
    status: string;
}

const ContentCard: React.FC<ContentCardProps> = ({ item, onPlay, status }) => {
    const progressPercentage = status === 'completed' ? 100 : status === 'in-progress' ? 50 : 0;
    return (
        <Card className="!p-0 flex flex-col group cursor-pointer overflow-hidden transform hover:-translate-y-1 transition-transform duration-300" onClick={() => onPlay(item)}>
            <div className="relative">
                <img src={item.thumbnail_url || `https://picsum.photos/seed/${item.id}/400/225`} alt={item.title} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayIcon className="w-12 h-12 text-white drop-shadow-lg" />
                </div>
                {status === 'completed' && <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1"><CheckCircleIcon className="w-4 h-4" /> Completed</div>}
                {status === 'in-progress' && <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1"><ClockIcon className="w-4 h-4" /> In Progress</div>}
                {progressPercentage > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-sidebar-accent/50">
                        <div 
                            className={`h-full transition-all duration-500 ${status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}`}
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                )}
            </div>
            <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-text-main text-base leading-tight flex-1">{item.title}</h3>
                <p className="text-xs text-text-secondary mt-2">{item.category} &bull; {item.difficulty}</p>
            </div>
        </Card>
    );
};

export default ContentCard;
