import React, { useState } from 'react';
import { Playlist, Content, UserProgress } from '../../../types';
import ContentCard from '../components/ContentCard';
import Card from '../../../components/common/Card';

const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>);

const PlaylistsView: React.FC<{
    playlists: Playlist[];
    allContent: Content[];
    onPlay: (content: Content) => void;
    progress?: UserProgress;
}> = ({ playlists, allContent, onPlay, progress }) => {
    const [expandedPlaylistId, setExpandedPlaylistId] = useState<number | null>(null);

    const togglePlaylist = (id: number) => {
        setExpandedPlaylistId(prev => (prev === id ? null : id));
    };

    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-6">My Playlists</h1>
            <div className="space-y-4">
                {playlists.map(playlist => {
                    const playlistContent = playlist.contentIds.map(id => allContent.find(c => c.id === id)).filter((c): c is Content => !!c);
                    const completedCount = playlistContent.filter(c => progress?.[c.id]?.status === 'completed').length;
                    const totalCount = playlistContent.length;
                    const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                    const isExpanded = expandedPlaylistId === playlist.id;

                    return (
                        <Card key={playlist.id} className="!p-0 overflow-hidden">
                            <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-sidebar-accent" onClick={() => togglePlaylist(playlist.id)}>
                                <div>
                                    <h2 className="text-xl font-bold">{playlist.name}</h2>
                                    <p className="text-sm text-text-secondary">{playlist.description}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                     <div className="w-48">
                                        <div className="flex justify-between text-xs mb-1"><span>Progress</span><span>{completionPercent}%</span></div>
                                        <div className="w-full bg-sidebar rounded-full h-2"><div className="bg-primary h-2 rounded-full" style={{ width: `${completionPercent}%` }}></div></div>
                                    </div>
                                    <ChevronDownIcon className={`w-6 h-6 text-text-secondary transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                </div>
                            </div>
                            {isExpanded && (
                                <div className="p-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {playlistContent.map(item => (
                                        <ContentCard 
                                            key={item.id} 
                                            item={item} 
                                            onPlay={onPlay}
                                            status={progress?.[item.id]?.status || 'not-started'}
                                        />
                                    ))}
                                </div>
                            )}
                        </Card>
                    );
                })}
                 {playlists.length === 0 && (
                    <Card><p className="text-text-secondary">You are not assigned to any playlists yet.</p></Card>
                )}
            </div>
        </div>
    );
};

export default PlaylistsView;
