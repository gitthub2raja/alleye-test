import React, { useState, useMemo } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Content, ContentType, Organization, Profile as User } from '../../../types';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import DataTable from '../../../components/common/DataTable';
import ViewHeader from '../components/ViewHeader';
import ContentFormModal from '../components/ContentFormModal';

interface ContentManagementViewProps {
    content: Content[];
    setContent: React.Dispatch<React.SetStateAction<Content[]>>;
    currentUser: User;
    allOrganizations: Organization[];
}

const ContentManagementView: React.FC<ContentManagementViewProps> = ({ content, setContent, currentUser, allOrganizations }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingContent, setEditingContent] = useState<Content | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ category: 'All', difficulty: 'All', type: 'All' });
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>({ key: 'created_at', direction: 'descending' });

    const categories = useMemo(() => ['All', ...Array.from(new Set(content.map(c => c.category).filter(Boolean)))], [content]);
    const difficulties = ['All', 'Intro', 'Intermediate', 'Advanced'];
    const types = ['All', ...Object.values(ContentType)];
    const difficultyOrder = { 'Intro': 1, 'Intermediate': 2, 'Advanced': 3 };

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

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const [key, direction] = e.target.value.split('-');
        setSortConfig({ key, direction: direction as 'ascending' | 'descending' });
    };

    const filteredAndSortedContent = useMemo(() => {
        let filtered = [...content];

        if (filters.category !== 'All') filtered = filtered.filter(c => c.category === filters.category);
        if (filters.difficulty !== 'All') filtered = filtered.filter(c => c.difficulty === filters.difficulty);
        if (filters.type !== 'All') filtered = filtered.filter(c => c.type === filters.type);
        if (searchTerm) {
            const lowercasedTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(c => 
                c.title.toLowerCase().includes(lowercasedTerm) || 
                c.description.toLowerCase().includes(lowercasedTerm)
            );
        }

        if (sortConfig) {
            filtered.sort((a, b) => {
                if (sortConfig.key === 'difficulty') {
                    const aValue = difficultyOrder[a.difficulty];
                    const bValue = difficultyOrder[b.difficulty];
                    if (aValue === undefined) return 1;
                    if (bValue === undefined) return -1;
                    return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
                }
                
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

    const openModal = (contentItem: Content | null = null) => {
        setEditingContent(contentItem);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setEditingContent(null);
        setIsModalOpen(false);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this content? This action cannot be undone.')) {
            const { error } = await supabase.from('content').delete().eq('id', id);
            if (error) {
                alert(`Error: ${error.message}`);
            }
        }
    };

    const columns: { key: keyof Content | string; header: string; sortable?: boolean, render?: (item: Content) => React.ReactNode }[] = [
        { key: 'title', header: 'Title', sortable: true },
        { key: 'type', header: 'Type', sortable: true },
        { key: 'category', header: 'Category', sortable: true },
        { key: 'difficulty', header: 'Difficulty', sortable: true },
        { key: 'created_at', header: 'Date Added', sortable: true, render: (item) => new Date(item.created_at).toLocaleDateString() },
        { key: 'duration_sec', header: 'Duration (sec)', sortable: true },
        { 
            key: 'assigned_org_ids', 
            header: 'Assigned Orgs',
            render: (item) => (
                <div className="flex flex-wrap gap-1">
                    {item.assigned_org_ids?.map(id => {
                        const org = allOrganizations.find(o => o.id === id);
                        return <span key={id} className="bg-sidebar-accent px-2 py-0.5 text-xs rounded-full">{org?.name || 'Unknown Org'}</span>
                    }) || <span className="text-xs text-text-secondary">All</span>}
                </div>
            )
        },
    ];

    return (
        <div className="animate-fade-in">
            <ViewHeader title="Content Management" subtitle="Create, edit, and manage all learning materials.">
                <Button onClick={() => openModal()}>Add New Content</Button>
            </ViewHeader>
            <Card className="mb-6 !p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <input name="searchTerm" value={searchTerm} onChange={handleFilterChange} className="form-input" placeholder="Search title or description..." />
                    <select name="category" value={filters.category} onChange={handleFilterChange} className="form-select">
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select name="difficulty" value={filters.difficulty} onChange={handleFilterChange} className="form-select">
                        {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <select name="type" value={filters.type} onChange={handleFilterChange} className="form-select">
                        {types.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <select
                        name="sortBy"
                        value={sortConfig ? `${sortConfig.key}-${sortConfig.direction}` : 'created_at-descending'}
                        onChange={handleSortChange}
                        className="form-select"
                    >
                        <option value="created_at-descending">Recently Added</option>
                        <option value="created_at-ascending">Oldest First</option>
                        <option value="title-ascending">Title (A-Z)</option>
                        <option value="title-descending">Title (Z-A)</option>
                        <option value="difficulty-ascending">Difficulty (Easy to Hard)</option>
                        <option value="difficulty-descending">Difficulty (Hard to Easy)</option>
                    </select>
                </div>
            </Card>
            <DataTable<Content> 
                columns={columns} 
                data={filteredAndSortedContent}
                sortConfig={sortConfig}
                onSort={handleSort}
                renderActions={(item) => (
                    <div className="space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => openModal(item)}>Edit</Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>Delete</Button>
                    </div>
                )}
            />
            {isModalOpen && <ContentFormModal isOpen={isModalOpen} onClose={closeModal} content={editingContent} currentUser={currentUser} allOrganizations={allOrganizations}/>}
        </div>
    );
};

export default ContentManagementView;
