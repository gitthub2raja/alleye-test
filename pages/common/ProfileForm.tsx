import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Profile as User } from '../../types';
import Button from '../../components/common/Button';

interface ProfileFormProps {
    user: User;
    allowPasswordChange: boolean;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ user, allowPasswordChange }) => {
    const [name, setName] = useState(user.name);
    const [password, setPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        let updated = false;

        if (name !== user.name) {
            const { error } = await supabase.from('profiles').update({ name }).eq('id', user.id);
            if (error) {
                alert('Error updating name: ' + error.message);
                setIsSaving(false);
                return;
            }
            updated = true;
        }

        if (allowPasswordChange && password) {
            const { error } = await supabase.auth.updateUser({ password: password });
            if (error) {
                alert('Error updating password: ' + error.message);
                setIsSaving(false);
                return;
            }
            updated = true;
        }

        if (updated) {
            alert('Profile updated successfully!');
            setPassword('');
        }

        setIsSaving(false);
    };

    return (
        <form className="space-y-4" onSubmit={handleSave}>
            <div>
                <label className="block text-sm font-medium text-text-secondary">Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 form-input" disabled={isSaving}/>
            </div>
            <div>
                <label className="block text-sm font-medium text-text-secondary">Email</label>
                <input type="email" value={user.email} className="mt-1 form-input bg-sidebar-accent" readOnly />
            </div>
            {allowPasswordChange && (
                <div>
                    <label className="block text-sm font-medium text-text-secondary">New Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep current password" className="mt-1 form-input" disabled={isSaving}/>
                </div>
            )}
            <div className="pt-4 flex items-center">
                <Button type="submit" variant="primary" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Profile'}
                </Button>
            </div>
        </form>
    );
};

export default ProfileForm;
