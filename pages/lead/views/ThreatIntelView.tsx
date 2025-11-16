import React, { useState } from 'react';
import { NewsItem, NewsItemType } from '../../../types';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';

interface ThreatIntelViewProps {
    updates: NewsItem[];
}

const ThreatIntelView: React.FC<ThreatIntelViewProps> = ({ updates }) => {
    const [viewingUpdate, setViewingUpdate] = useState<NewsItem | null>(null);

    if (viewingUpdate) {
         return (
            <div className="animate-fade-in">
                <Button variant="ghost" onClick={() => setViewingUpdate(null)} className="mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                    Back to Feed
                </Button>
                <Card className="!p-8">
                    {viewingUpdate.thumbnail_url && <img src={viewingUpdate.thumbnail_url} alt={viewingUpdate.title} className="w-full h-auto object-cover rounded-md mb-6 max-h-96" />}
                    <h1 className="text-3xl font-bold text-text-main">{viewingUpdate.title}</h1>
                    <p className="text-sm text-text-secondary mt-1 mb-6">
                        By {viewingUpdate.author?.name} on {new Date(viewingUpdate.created_at).toLocaleDateString()}
                    </p>
                    
                    {viewingUpdate.type === NewsItemType.REACT_SANDBOX && viewingUpdate.embed_url ? (
                        <div className="aspect-video">
                            <iframe src={viewingUpdate.embed_url} title={viewingUpdate.title} className="w-full h-full border rounded-md" sandbox="allow-scripts allow-same-origin" />
                        </div>
                    ) : viewingUpdate.content ? (
                        <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: viewingUpdate.content }} />
                    ) : (
                        <p className="text-text-secondary">No content to display.</p>
                    )}
                </Card>
            </div>
        )
    }

    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-6">Threat Intel Feed</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {updates.map(item => (
                    <Card key={item.id} className="!p-0 flex flex-col group cursor-pointer overflow-hidden transform hover:-translate-y-1 transition-transform duration-300" onClick={() => setViewingUpdate(item)}>
                        <div className="relative">
                            <img src={item.thumbnail_url || `https://picsum.photos/seed/${item.id}/400/225`} alt={item.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                            <div className="absolute bottom-4 left-4">
                                 <h3 className="font-bold text-white text-lg drop-shadow-md">{item.title}</h3>
                            </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                            <p className="text-sm text-text-secondary">By {item.author?.name || 'LMS Admin'}</p>
                            <div className="mt-auto pt-2">
                                <span className="text-sm font-semibold text-secondary">Read More &rarr;</span>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
            {updates.length === 0 && <Card><p className="text-text-secondary">No threat intelligence posts available.</p></Card>}
        </div>
    );
};

export default ThreatIntelView;
