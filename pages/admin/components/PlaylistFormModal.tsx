import React, { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Content, Organization, Playlist, Profile as User } from '../../../types';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';

interface PlaylistFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    playlist: Playlist | null;
    allContent: Content[];
    currentUser: User;
    allOrganizations: Organization[];
}

const PlaylistFormModal: React.FC<PlaylistFormModalProps> = ({ isOpen, onClose, playlist, allContent, currentUser, allOrganizations }) => {
    const [formData, setFormData] = useState({
        name: playlist?.name || '',
        description: playlist?.description || '',
        contentIds: playlist?.contentIds || [],
        assigned_org_ids: playlist?.assigned_org_ids || [],
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const playlistData = { name: formData.name, description: formData.description, curator_id: currentUser.id, assigned_org_ids: formData.assigned_org_ids };

        if (playlist?.id) { // Editing
            const { error } = await supabase.from('playlists').update(playlistData).eq('id', playlist.id);
            if (error) { alert(`Error: ${error.message}`); return; }

            await supabase.from('playlist_content').delete().eq('playlist_id', playlist.id);
            if (formData.contentIds.length > 0) {
                await supabase.from('playlist_content').insert(formData.contentIds.map(content_id => ({ playlist_id: playlist.id, content_id })));
            }
        } else { // Creating
            const { data, error } = await supabase.from('playlists').insert(playlistData).select().single();
            if (error) { alert(`Error: ${error.message}`); return; }
            
            if (data && formData.contentIds.length > 0) {
                 await supabase.from('playlist_content').insert(formData.contentIds.map(content_id => ({ playlist_id: data.id, content_id })));
            }
        }
        onClose();
    };

    const handleContentSelection = (contentId: number, isSelected: boolean) => {
        setFormData(prev => ({
            ...prev,
            contentIds: isSelected ? [...prev.contentIds, contentId] : prev.contentIds.filter(id => id !== contentId)
        }));
    };
    
    const handleOrgAssignmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prev => ({ ...prev, assigned_org_ids: selectedOptions.includes('all') ? [] : selectedOptions }));
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={playlist ? 'Edit Playlist' : 'Create Playlist'} size="xl">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label htmlFor="playlistName" className="block text-sm font-medium text-text-main">Playlist Name</label>
                    <input 
                        id="playlistName"
                        value={formData.name} 
                        onChange={e => setFormData(p => ({...p, name: e.target.value}))} 
                        className="form-input" 
                        required 
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="playlistDescription" className="block text-sm font-medium text-text-main">Description</label>
                    <textarea 
                        id="playlistDescription"
                        value={formData.description} 
                        onChange={e => setFormData(p => ({...p, description: e.target.value}))} 
                        className="form-input" 
                    />
                </div>
                
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-text-main">Select Content</label>
                    <div className="h-48 overflow-y-auto border border-border p-2 rounded-md bg-background">
                        {allContent.length > 0 ? allContent.map(item => (
                            <label key={item.id} className="flex items-center p-2 rounded-md hover:bg-sidebar-accent cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={formData.contentIds.includes(item.id)}
                                    onChange={e => handleContentSelection(item.id, e.target.checked)}
                                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                                    style={{ backgroundColor: 'var(--form-bg-color)' }}
                                />
                                <span className="ml-3 text-sm text-text-main">{item.title}</span>
                            </label>
                        )) : <p className="text-sm text-text-secondary p-2">No content available to add.</p>}
                    </div>
                </div>
                
                <div className="space-y-2">
                    <label htmlFor="assignOrgs" className="block text-sm font-medium text-text-main">Assign to Organizations</label>
                    <select
                        id="assignOrgs"
                        multiple
                        name="assigned_org_ids"
                        value={formData.assigned_org_ids.length === 0 ? ['all'] : formData.assigned_org_ids}
                        onChange={handleOrgAssignmentChange}
                        className="form-select h-48"
                    >
                        <option value="all">All Organizations</option>
                        {allOrganizations.map(org => (
                            <option key={org.id} value={org.id}>{org.name}</option>
                        ))}
                    </select>
                    <p className="text-xs text-text-secondary mt-1">Hold Ctrl/Cmd to select multiple. 'All Organizations' overrides other selections.</p>
                </div>
                
                <div className="flex justify-end pt-4 border-t border-border">
                    <Button type="button" variant="ghost" onClick={onClose} className="mr-2">Cancel</Button>
                    <Button type="submit">Save Playlist</Button>
                </div>
            </form>
        </Modal>
    );
};

export default PlaylistFormModal;
