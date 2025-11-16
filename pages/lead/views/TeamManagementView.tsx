import React, { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Profile as User } from '../../../types';
import Button from '../../../components/common/Button';
import DataTable from '../../../components/common/DataTable';
import Modal from '../../../components/common/Modal';

interface TeamManagementViewProps {
    users: User[];
    teams: any[];
    setTeams: React.Dispatch<React.SetStateAction<any[]>>;
    currentUser: User;
}

const TeamManagementView: React.FC<TeamManagementViewProps> = ({ users, teams, setTeams, currentUser }) => {
    const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
    const [editingTeam, setEditingTeam] = useState<any | null>(null);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    
    const teamColumns = [
        { key: 'name', header: 'Team Name' },
        { key: 'members', header: 'Member Count', render: (team: any) => users.filter(u => u.team === team.id).length },
    ];
    
    const userColumns = [
        { key: 'name', header: 'User Name' },
        { key: 'email', header: 'Email' },
        { key: 'team', header: 'Team', render: (user: User) => teams.find(t => t.id === user.team)?.name || 'N/A' },
    ];
    
    const handleSaveTeam = async (teamData: any) => {
        let error;
        if (editingTeam) {
            ({ error } = await supabase.from('teams').update(teamData).eq('id', editingTeam.id));
        } else {
            ({ error } = await supabase.from('teams').insert({...teamData, organization_id: currentUser.organization_id}));
        }
        if (error) alert(error.message);
        setIsTeamModalOpen(false);
        setEditingTeam(null);
    };

    const handleDeleteTeam = async (teamId: string) => {
        if (window.confirm('Are you sure you want to delete this team? All users will be unassigned from it.')) {
            const { error: unassignError } = await supabase.from('profiles').update({ team: null }).eq('team', teamId);
            if (unassignError) {
                alert(`Error unassigning users: ${unassignError.message}`);
                return;
            }
            const { error: deleteError } = await supabase.from('teams').delete().eq('id', teamId);
            if (deleteError) {
                alert(`Error deleting team: ${deleteError.message}`);
            }
        }
    };

    const handleSaveUser = async (userData: Partial<User>) => {
        if (!editingUser) return;
        const { error } = await supabase.from('profiles').update(userData).eq('id', editingUser.id);
        if (error) alert(error.message);
        setIsUserModalOpen(false);
        setEditingUser(null);
    };
    
    return (
        <div className="animate-fade-in">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">Teams</h2>
                        <Button onClick={() => { setEditingTeam(null); setIsTeamModalOpen(true); }}>New Team</Button>
                    </div>
                    <DataTable<any>
                        columns={teamColumns}
                        data={teams}
                        renderActions={team => (
                            <div className="space-x-2">
                                <Button variant="ghost" size="sm" onClick={() => { setEditingTeam(team); setIsTeamModalOpen(true); }}>Edit</Button>
                                <Button variant="danger" size="sm" onClick={() => handleDeleteTeam(team.id)}>Delete</Button>
                            </div>
                        )}
                    />
                </div>
                 <div>
                    <h2 className="text-2xl font-bold mb-4">Users</h2>
                     <DataTable<User>
                        columns={userColumns}
                        data={users}
                        renderActions={user => (
                            <Button variant="ghost" size="sm" onClick={() => { setEditingUser(user); setIsUserModalOpen(true); }}>Edit Team</Button>
                        )}
                    />
                </div>
            </div>
            
            {isTeamModalOpen && (
                <Modal isOpen={isTeamModalOpen} onClose={() => setIsTeamModalOpen(false)} title={editingTeam ? 'Edit Team' : 'Create Team'}>
                     <form onSubmit={e => {
                         e.preventDefault();
                         handleSaveTeam({ name: (e.currentTarget.elements.namedItem('name') as HTMLInputElement).value });
                     }}>
                        <input name="name" defaultValue={editingTeam?.name} placeholder="Team Name" className="form-input" required/>
                        <div className="flex justify-end pt-4 mt-4"><Button type="submit">Save Team</Button></div>
                     </form>
                </Modal>
            )}
            
            {isUserModalOpen && editingUser && (
                <Modal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} title={`Assign Team for ${editingUser.name}`}>
                    <form onSubmit={e => {
                        e.preventDefault();
                        handleSaveUser({ team: (e.currentTarget.elements.namedItem('team') as HTMLSelectElement).value });
                    }}>
                        <select name="team" defaultValue={editingUser.team} className="form-select">
                            <option value="">No Team</option>
                            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                        <div className="flex justify-end pt-4 mt-4"><Button type="submit">Assign Team</Button></div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default TeamManagementView;
