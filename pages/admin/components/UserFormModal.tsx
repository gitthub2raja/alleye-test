import React, { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Organization, Profile as User, Role } from '../../../types';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';

interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    organizations: Organization[];
}

const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, user, organizations }) => {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        role: user?.role || Role.USER,
        organization_id: user?.organization_id || '',
        team: user?.team || '',
    });
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (user) { // Update user
            const { error } = await supabase.from('profiles').update({ 
                name: formData.name, 
                role: formData.role, 
                organization_id: formData.organization_id || null, 
                team: formData.team 
            }).eq('id', user.id);
            if (error) { alert(`Error: ${error.message}`); return; }
            if (formData.password) {
                 const { error: authError } = await supabase.auth.admin.updateUserById(user.id, { password: formData.password });
                 if (authError) { alert(`Error updating password: ${authError.message}`); return; }
            }
        } else { // Create user
             const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        name: formData.name,
                        role: formData.role,
                        organization_id: formData.organization_id || null,
                        team: formData.team,
                        points: 0,
                        badges: [],
                        progress: {},
                        avatar_url: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(formData.name)}`,
                    }
                }
            });
            if (error) { alert(`Error creating user: ${error.message}`); return; }
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={user ? 'Edit User' : 'Create User'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} placeholder="Full Name" className="form-input" required />
                <input type="email" value={formData.email} onChange={e => setFormData(p => ({...p, email: e.target.value}))} placeholder="Email" className="form-input" required disabled={!!user} />
                <input type="password" value={formData.password} onChange={e => setFormData(p => ({...p, password: e.target.value}))} placeholder={user ? "New Password (optional)" : "Password"} className="form-input" required={!user} />
                <select value={formData.role} onChange={e => setFormData(p => ({...p, role: e.target.value as Role}))} className="form-select">
                    {Object.values(Role).map(role => <option key={role} value={role}>{role}</option>)}
                </select>
                <select value={formData.organization_id} onChange={e => setFormData(p => ({...p, organization_id: e.target.value}))} className="form-select">
                    <option value="">No Organization</option>
                    {organizations.map(org => <option key={org.id} value={org.id}>{org.name}</option>)}
                </select>
                <input value={formData.team} onChange={e => setFormData(p => ({...p, team: e.target.value}))} placeholder="Team Name" className="form-input" />
                <div className="flex justify-end pt-4"><Button type="submit">Save User</Button></div>
            </form>
        </Modal>
    );
};

export default UserFormModal;
