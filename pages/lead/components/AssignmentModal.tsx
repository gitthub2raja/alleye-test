import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Content, Playlist, Profile as User } from '../../../types';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';

interface AssignmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: Content | Playlist;
    users: User[];
    teams: any[];
    assignments: any[];
}

const AssignmentModal: React.FC<AssignmentModalProps> = ({ isOpen, onClose, item, users, teams, assignments }) => {
    const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
    
    useEffect(() => {
        if (isOpen) {
            setSelectedUserIds(new Set(assignments.map(a => a.user_id)));
        }
    }, [isOpen, assignments]);

    const handleUserToggle = (userId: string) => {
        setSelectedUserIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(userId)) {
                newSet.delete(userId);
            } else {
                newSet.add(userId);
            }
            return newSet;
        });
    };

    const handleTeamToggle = (teamId: string) => {
        const teamUserIds = users.filter(u => u.team === teamId).map(u => u.id);
        const isTeamCurrentlySelected = teamUserIds.length > 0 && teamUserIds.every(id => selectedUserIds.has(id));
        
        setSelectedUserIds(prev => {
            const newSet = new Set(prev);
            if (isTeamCurrentlySelected) {
                teamUserIds.forEach(id => newSet.delete(id));
            } else {
                teamUserIds.forEach(id => newSet.add(id));
            }
            return newSet;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const isPlaylist = 'contentIds' in item;
        const itemId = item.id;
        const idField = isPlaylist ? 'playlist_id' : 'content_id';

        const finalUserIds = selectedUserIds;
        const currentUserIds = new Set(assignments.map(a => a.user_id));

        const usersToAssign = [...finalUserIds].filter(id => !currentUserIds.has(id));
        const usersToUnassign = [...currentUserIds].filter(id => !finalUserIds.has(id));

        const promises = [];

        if (usersToAssign.length > 0) {
            const assignmentsToAdd = usersToAssign.map(user_id => ({ user_id, [idField]: itemId }));
            promises.push(supabase.from('user_assignments').insert(assignmentsToAdd));
        }

        if (usersToUnassign.length > 0) {
            promises.push(
                supabase.from('user_assignments').delete().eq(idField, itemId).in('user_id', usersToUnassign)
            );
        }
        
        if (promises.length === 0) {
            onClose();
            return;
        }

        const results = await Promise.all(promises);
        const errors = results.map(r => r.error).filter(Boolean);

        if (errors.length > 0) {
            alert(`An error occurred: ${errors.map(e => e.message).join(', ')}`);
        } else {
            alert('Assignments updated successfully!');
            onClose();
        }
    };
    
    const isPlaylist = 'contentIds' in item;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Manage Assignments for: ${isPlaylist ? item.name : item.title}`}>
            <form onSubmit={handleSubmit}>
                <h3 className="font-semibold mb-2">Assign to Teams</h3>
                 <div className="max-h-40 overflow-y-auto border border-border p-2 rounded-md mb-4">
                    {teams.map(team => {
                        const teamUserIds = users.filter(u => u.team === team.id).map(u => u.id);
                        const isTeamSelected = teamUserIds.length > 0 && teamUserIds.every(id => selectedUserIds.has(id));
                        return (
                            <label key={team.id} className="flex items-center p-2 rounded-md hover:bg-sidebar-accent cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={isTeamSelected}
                                    onChange={() => handleTeamToggle(team.id)} 
                                    className="h-4 w-4 rounded" 
                                />
                                <span className="ml-3 text-text-secondary">{team.name}</span>
                            </label>
                        )
                    })}
                 </div>
                <h3 className="font-semibold mb-2">Assign to Individual Users</h3>
                <div className="max-h-60 overflow-y-auto border border-border p-2 rounded-md">
                     {users.map(user => (
                         <label key={user.id} className="flex items-center p-2 rounded-md hover:bg-sidebar-accent cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={selectedUserIds.has(user.id)}
                                onChange={() => handleUserToggle(user.id)}
                                className="h-4 w-4 rounded" 
                            />
                            <span className="ml-3 text-text-secondary">{user.name}</span>
                        </label>
                    ))}
                </div>
                 <div className="flex justify-end pt-4 mt-4 border-t border-border">
                    <Button type="submit">Update Assignments</Button>
                </div>
            </form>
        </Modal>
    );
};

export default AssignmentModal;
