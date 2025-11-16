import React, { useState, useMemo } from 'react';
import { Content, UserProgress } from '../../../types';
import ContentCard from '../components/ContentCard';

const LibraryView: React.FC<{
    content: Content[];
    onPlay: (content: Content) => void;
    progress?: UserProgress;
}> = ({ content, onPlay, progress }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ category: 'All', difficulty: 'All' });
    
    const categories = useMemo(() => ['All', ...Array.from(new Set(content.map(c => c.category).filter(Boolean)))], [content]);
    const difficulties = ['All', 'Intro', 'Intermediate', 'Advanced'];
    
    const filteredContent = useMemo(() => {
        return content.filter(item => {
            const searchMatch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
            const categoryMatch = filters.category === 'All' || item.category === filters.category;
            const difficultyMatch = filters.difficulty === 'All' || item.difficulty === filters.difficulty;
            return searchMatch && categoryMatch && difficultyMatch;
        });
    }, [content, searchTerm, filters]);

    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-6">My Library</h1>
            <div className="mb-6 p-4 bg-sidebar-accent rounded-xl flex flex-col sm:flex-row gap-4">
                 <input
                    type="text"
                    placeholder="Search library..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input flex-grow"
                />
                 <select value={filters.category} onChange={(e) => setFilters(f => ({...f, category: e.target.value}))} className="form-select">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                 <select value={filters.difficulty} onChange={(e) => setFilters(f => ({...f, difficulty: e.target.value}))} className="form-select">
                    {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredContent.map(item => (
                    <ContentCard 
                        key={item.id} 
                        item={item} 
                        onPlay={onPlay}
                        status={progress?.[item.id]?.status || 'not-started'}
                    />
                ))}
            </div>
            {filteredContent.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-text-secondary">No content found matching your criteria.</p>
                </div>
            )}
        </div>
    );
};

export default LibraryView;
