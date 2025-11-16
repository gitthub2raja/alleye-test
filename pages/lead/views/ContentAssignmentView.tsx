import React, { useState, useMemo, useEffect } from 'react';
import { Content, ContentType, Playlist, Profile as User } from '../../../types';
import ViewHeader from '../components/ViewHeader';
import Card from '../../../components/common/Card';
import DataTable from '../../../components/common/DataTable';
import Button from '../../../components/common/Button';
import AssignmentModal from '../components/AssignmentModal';
import PlaylistActivityModal from '../components/PlaylistActivityModal';

interface ContentAssignmentViewProps {
    users: User[];
    content: Content[];
    playlists: Playlist[];
    currentUser: User;
    teams: any[];
    userAssignments: any[];
    initialView?: 'content' | 'playlists';
}

const ContentAssignmentView: React.FC<ContentAssignmentViewProps> = ({ users, content, playlists, currentUser, teams, userAssignments, initialView = 'content' }) => {
    const [viewMode, setViewMode] = useState<'content' | 'playlists'>(initialView);
    const [assigningItem, setAssigningItem] = useState<Content | Playlist | null>(null);
    const [viewingPlaylistActivity, setViewingPlaylistActivity] = useState<Playlist | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ category: 'All', difficulty: 'All', type: 'All' });
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>({ key: 'title', direction: 'ascending' });

    useEffect(() => {
        setViewMode(initialView);
        setSortConfig({ key: initialView === 'content' ? 'title' : 'name', direction: 'ascending' });
    }, [initialView]);

    const categories = useMemo(() => ['All', ...Array.from(new Set(content.map(c => c.category).filter(Boolean)))], [content]);
    const difficulties = ['All', 'Intro', 'Intermediate', 'Advanced'];
    const types = ['All', ...Object.values(ContentType)];

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'searchTerm') {
            setSearchTerm(value);
        } else {
            setFilters(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleSort = (key: string) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const filteredAndSortedContent = useMemo(() => {
        let filtered = [...content];
        if (filters.category !== 'All') filtered = filtered.filter(c => c.category === filters.category);
        if (filters.difficulty !== 'All') filtered = filtered.filter(c => c.difficulty === filters.difficulty);
        if (filters.type !== 'All') filtered = filtered.filter(c => c.type === filters.type);
        if (searchTerm) {
            const lowercasedTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(c => c.title.toLowerCase().includes(lowercasedTerm));
        }
        if (sortConfig) {
            filtered.sort((a, b) => {
                const aValue = a[sortConfig.key as keyof Content];
                const bValue = b[sortConfig.key as keyof Content];
                if (aValue === null || aValue === undefined) return 1;
                if (bValue === null || bValue === undefined) return -1;
                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
                }
                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return sortConfig.direction === 'ascending' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                }
                return 0;
            });
        }
        return filtered;
    }, [content, filters, searchTerm, sortConfig]);

    const filteredAndSortedPlaylists = useMemo(() => {
        let filtered = [...playlists];
        if (searchTerm) {
            const lowercasedTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(p => p.name.toLowerCase().includes(lowercasedTerm) || p.description.toLowerCase().includes(lowercasedTerm));
        }
        if (sortConfig) {
            filtered.sort((a, b) => {
                const aValue = a[sortConfig.key as keyof Playlist] as string;
                const bValue = b[sortConfig.key as keyof Playlist] as string;
                 if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return sortConfig.direction === 'ascending' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                }
                return 0;
            });
        }
        return filtered;
    }, [playlists, searchTerm, sortConfig]);

    const contentColumns: { key: keyof Content | string; header: string; sortable?: boolean, render?: (item: Content) => React.ReactNode }[] = [
        { key: 'title', header: 'Title', sortable: true },
        { key: 'type', header: 'Type', sortable: true },
        { key: 'passing_score', header: 'Passing Score', sortable: true, render: (item) => (item.passing_score ? `${item.passing_score}%` : 'N/A') },
        { key: 'category', header: 'Category', sortable: true },
        { key: 'difficulty', header: 'Difficulty', sortable: true },
        { 
            key: 'assignedCount', 
            header: 'Assigned To', 
            render: (item: Content) => {
                const count = userAssignments.filter(a => a.content_id === item.id).length;
                return `${count} user${count === 1 ? '' : 's'}`;
            }
        },
    ];

    const playlistColumns: { key: keyof Playlist | string; header: string; sortable?: boolean, render?: (item: Playlist) => React.ReactNode }[] = [
        { key: 'name', header: 'Playlist Name', sortable: true },
        { key: 'description', header: 'Description', sortable: true },
        { 
            key: 'assignedCount', 
            header: 'Assigned To', 
            render: (item: Playlist) => {
                const count = userAssignments.filter(a => a.playlist_id === item.id).length;
                return `${count} user${count === 1 ? '' : 's'}`;
            }
        },
    ];

    return (
        <div className="animate-fade-in">
            <ViewHeader title="Assign Training" subtitle="Assign content or playlists to your teams and users." />
            
            <Card className="mb-6 !p-4">
                <div className="flex border-b border-border mb-4">
                    <button onClick={() => setViewMode('content')} className={`px-4 py-2 text-sm font-medium ${viewMode === 'content' ? 'border-b-2 border-primary text-primary' : 'text-text-secondary hover:text-text-main'}`}>Content</button>
                    <button onClick={() => setViewMode('playlists')} className={`px-4 py-2 text-sm font-medium ${viewMode === 'playlists' ? 'border-b-2 border-primary text-primary' : 'text-text-secondary hover:text-text-main'}`}>Playlists</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <input name="searchTerm" value={searchTerm} onChange={handleFilterChange} className="form-input" placeholder="Search..." />
                    {viewMode === 'content' && (
                        <>
                            <select name="category" value={filters.category} onChange={handleFilterChange} className="form-select">
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <select name="difficulty" value={filters.difficulty} onChange={handleFilterChange} className="form-select">
                                {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            <select name="type" value={filters.type} onChange={handleFilterChange} className="form-select">
                                {types.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </>
                    )}
                </div>
            </Card>

            {viewMode === 'content' ? (
                 <DataTable<Content>
                    columns={contentColumns}
                    data={filteredAndSortedContent}
                    sortConfig={sortConfig as any}
                    onSort={handleSort}
                    renderActions={(item) => (
                        <Button variant="secondary" size="sm" onClick={() => setAssigningItem(item)}>Manage</Button>
                    )}
                />
            ) : (
                 <DataTable<Playlist>
                    columns={playlistColumns}
                    data={filteredAndSortedPlaylists}
                    sortConfig={sortConfig as any}
                    onSort={handleSort}
                    renderActions={(item) => (
                        <div className="space-x-2">
                             <Button variant="ghost" size="sm" onClick={() => setViewingPlaylistActivity(item)}>View Activity</Button>
                             <Button variant="secondary" size="sm" onClick={() => setAssigningItem(item)}>Manage</Button>
                        </div>
                    )}
                />
            )}

            {assigningItem && (
                <AssignmentModal
                    isOpen={!!assigningItem}
                    onClose={() => setAssigningItem(null)}
                    item={assigningItem}
                    users={users}
                    teams={teams}
                    assignments={userAssignments.filter(a => 
                        'contentIds' in assigningItem 
                        ? a.playlist_id === assigningItem.id 
                        : a.content_id === assigningItem.id
                    )}
                />
            )}

            <PlaylistActivityModal
                isOpen={!!viewingPlaylistActivity}
                onClose={() => setViewingPlaylistActivity(null)}
                playlist={viewingPlaylistActivity}
                users={users}
                userAssignments={userAssignments}
            />
        </div>
    );
};

export default ContentAssignmentView;
