import React from 'react';
import { Content } from '../../../../types';
import Button from '../../../../components/common/Button';

const PlayIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg role="img" height="24" width="24" aria-hidden="true" viewBox="0 0 24 24" {...props} fill="currentColor"><path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path></svg>);

interface HeroSectionProps {
    item: Content;
    onPlay: (c: Content) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({item, onPlay}) => (
    <div className="relative rounded-2xl overflow-hidden h-72 sm:h-80 lg:h-96 text-white shadow-lg">
        <img src={item.thumbnail_url || `https://picsum.photos/seed/${item.id}/1200/600`} alt={item.title} className="absolute inset-0 w-full h-full object-cover"/>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
        <div className="relative z-10 p-4 sm:p-6 lg:p-8 h-full flex flex-col justify-end">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold drop-shadow-lg">{item.title}</h2>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm max-w-lg text-gray-300 drop-shadow-md">{item.description}</p>
            <div className="mt-4 sm:mt-6">
                <Button variant="secondary" size="md" onClick={() => onPlay(item)}>
                    <PlayIcon className="w-5 h-5 mr-2" />
                    Watch Now
                </Button>
            </div>
        </div>
    </div>
);

export default HeroSection;
