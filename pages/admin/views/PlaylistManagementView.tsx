import React, { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Content, Organization, Playlist, Profile as User } from '../../../types';
import ViewHeader from '../components/ViewHeader';
import Button from '../../../components/common/Button';
import DataTable from '../../../components/common/DataTable';
import PlaylistFormModal from '../components/PlaylistFormModal';

interface PlaylistManagementViewProps {
    playlists: Playlist[];
    setPlaylists: React.Dispatch<React.SetStateAction<Playlist[]>>;
    allContent: Content[];
    currentUser: User;
    allOrganizations: Organization[];
}

const PlaylistManagementView: React.FC<PlaylistManagementViewProps> = ({ playlists, setPlaylists, allContent, currentUser, allOrganizations }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);

    const openModal = (playlist: Playlist | null = null) => {
        setEditingPlaylist(playlist);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setEditingPlaylist(null);
        setIsModalOpen(false);
    };
    
    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this playlist?')) {
            const { error: junctionError } = await supabase.from('playlist_content').delete().eq('playlist_id', id);
            if (junctionError) { alert(`Error clearing playlist content: ${junctionError.message}`); return; }

            const { error } = await supabase.from('playlists').delete().eq('id', id);
            if (error) { alert(`Error: ${error.message}`); }
        }
    };

    const columns = [
        { key: 'name', header: 'Name' },
        { key: 'description', header: 'Description' },
        { key: 'contentIds', header: 'Content Count', render: (item: Playlist) => item.contentIds.length },
    ];

    return (
        <div className="animate-fade-in">
            <ViewHeader title="Playlist Management" subtitle="Curate and organize learning paths.">
                <Button onClick={() => openModal()}>Create New Playlist</Button>
            </ViewHeader>
            <DataTable<Playlist> 
                columns={columns} 
                data={playlists}
                renderActions={(item) => (
                    <div className="space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => openModal(item)}>Edit</Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>Delete</Button>
                    </div>
                )}
            />
            {isModalOpen && <PlaylistFormModal isOpen={isModalOpen} onClose={closeModal} playlist={editingPlaylist} allContent={allContent} currentUser={currentUser} allOrganizations={allOrganizations} />}
        </div>
    );
};

export default PlaylistManagementView;
