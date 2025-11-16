import React, { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { NewsItem, Profile as User } from '../../../types';
import ViewHeader from '../components/ViewHeader';
import Button from '../../../components/common/Button';
import DataTable from '../../../components/common/DataTable';
import ThreatIntelFormModal from '../components/ThreatIntelFormModal';

interface ThreatIntelViewProps {
    updates: NewsItem[];
    setUpdates: React.Dispatch<React.SetStateAction<NewsItem[]>>;
    currentUser: User;
}

const ThreatIntelView: React.FC<ThreatIntelViewProps> = ({ updates, setUpdates, currentUser }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUpdate, setEditingUpdate] = useState<NewsItem | null>(null);

    const openModal = (update: NewsItem | null = null) => {
        setEditingUpdate(update);
        setIsModalOpen(true);
    };
    
    const closeModal = () => {
        setEditingUpdate(null);
        setIsModalOpen(false);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this news post?')) {
            const { error } = await supabase.from('news').delete().eq('id', id);
            if (error) { alert(`Error: ${error.message}`); }
        }
    };

    const columns = [
        { key: 'title', header: 'Title' },
        { key: 'type', header: 'Type' },
        { key: 'created_at', header: 'Published On', render: (item: NewsItem) => new Date(item.created_at).toLocaleDateString() },
        { key: 'author', header: 'Author', render: (item: NewsItem) => item.author?.name || 'Unknown' },
    ];

    return (
        <div className="animate-fade-in">
            <ViewHeader title="Threat Intel Feed" subtitle="Manage and publish security news and articles.">
                <Button onClick={() => openModal()}>New Post</Button>
            </ViewHeader>
            <DataTable<NewsItem>
                columns={columns}
                data={updates}
                renderActions={(item) => (
                    <div className="space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => openModal(item)}>Edit</Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>Delete</Button>
                    </div>
                )}
            />
            {isModalOpen && <ThreatIntelFormModal isOpen={isModalOpen} onClose={closeModal} update={editingUpdate} currentUser={currentUser} />}
        </div>
    );
};

export default ThreatIntelView;
