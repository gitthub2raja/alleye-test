import React, { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Organization, Profile as User } from '../../../types';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';

interface OrganizationFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    organization: Organization | null;
    allUsers: User[];
}

const OrganizationFormModal: React.FC<OrganizationFormModalProps> = ({ isOpen, onClose, organization, allUsers }) => {
    const [formData, setFormData] = useState({
        name: organization?.name || '',
        theme_color: organization?.theme_color || '#cbdd59',
        logo_url: organization?.logo_url || '',
        powerbi_embed_url: organization?.powerbi_embed_url || '',
    });
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>(allUsers.filter(u => u.organization_id === organization?.id).map(u => u.id));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const orgData = { ...formData };
        
        if (organization?.id) { // Update
            const { data, error } = await supabase.from('organizations').update(orgData).eq('id', organization.id).select().single();
            if (error) { alert(`Error: ${error.message}`); return; }
            if (data) {
                // Update users - remove from old org, add to new
                await supabase.from('profiles').update({ organization_id: null }).eq('organization_id', data.id);
                if(selectedUserIds.length > 0) {
                    await supabase.from('profiles').update({ organization_id: data.id }).in('id', selectedUserIds);
                }
            }
        } else { // Insert
            const { data, error } = await supabase.from('organizations').insert(orgData).select().single();
            if (error) { alert(`Error: ${error.message}`); return; }
            if (data && selectedUserIds.length > 0) {
                 await supabase.from('profiles').update({ organization_id: data.id }).in('id', selectedUserIds);
            }
        }
        onClose();
    };
    
    const handleUserSelection = (userId: string, isSelected: boolean) => {
        setSelectedUserIds(prev => isSelected ? [...prev, userId] : prev.filter(id => id !== userId));
    };

    const unassignedUsers = allUsers.filter(u => !u.organization_id || u.organization_id === organization?.id);
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={organization ? 'Edit Organization' : 'Add Organization'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} placeholder="Organization Name" className="form-input" required />
                <input value={formData.logo_url} onChange={e => setFormData(p => ({...p, logo_url: e.target.value}))} placeholder="Logo URL" className="form-input" />
                <input value={formData.powerbi_embed_url} onChange={e => setFormData(p => ({...p, powerbi_embed_url: e.target.value}))} placeholder="Power BI Embed URL" className="form-input" />
                <div className="flex items-center gap-2">
                    <label>Theme Color:</label>
                    <input type="color" value={formData.theme_color} onChange={e => setFormData(p => ({...p, theme_color: e.target.value}))} className="h-8 w-8 rounded-md" />
                </div>
                <div>
                    <h3 className="font-semibold mb-2">Assign Users</h3>
                    <div className="max-h-60 overflow-y-auto border border-border p-2 rounded-md">
                        {unassignedUsers.map(user => (
                            <label key={user.id} className="flex items-center p-2 rounded-md hover:bg-sidebar-accent">
                                <input 
                                    type="checkbox" 
                                    checked={selectedUserIds.includes(user.id)}
                                    onChange={e => handleUserSelection(user.id, e.target.checked)}
                                    className="h-4 w-4 rounded"
                                />
                                <span className="ml-3 text-text-secondary">{user.name} ({user.email})</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div className="flex justify-end pt-4"><Button type="submit">Save Organization</Button></div>
            </form>
        </Modal>
    );
};

export default OrganizationFormModal;
