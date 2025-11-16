import React, { useState, useMemo } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Organization, Profile as User, Role } from '../../../types';
import ViewHeader from '../components/ViewHeader';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import DataTable from '../../../components/common/DataTable';
import UserFormModal from '../components/UserFormModal';

interface UserManagementViewProps {
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    organizations: Organization[];
    currentUser: User;
}

const UserManagementView: React.FC<UserManagementViewProps> = ({ users, setUsers, organizations, currentUser }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ role: 'All', organizationId: 'All' });
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' }>({ key: 'created_at', direction: 'descending' });

    const filteredAndSortedUsers = useMemo(() => {
        let filtered = [...users];

        if (searchTerm) {
            filtered = filtered.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (filters.role !== 'All') {
            filtered = filtered.filter(u => u.role === filters.role);
        }
        if (filters.organizationId !== 'All') {
            if (filters.organizationId === 'none') {
                filtered = filtered.filter(u => !u.organization_id);
            } else {
                filtered = filtered.filter(u => u.organization_id === filters.organizationId);
            }
        }

        const orgMap = new Map(organizations.map(o => [o.id, o.name]));
        
        filtered.sort((a, b) => {
            const { key, direction } = sortConfig;
            let aValue, bValue;

            if (key === 'organization') {
                aValue = orgMap.get(a.organization_id || '') || '';
                bValue = orgMap.get(b.organization_id || '') || '';
            } else {
                aValue = a[key as keyof User];
                bValue = b[key as keyof User];
            }
            
            if (aValue === null || aValue === undefined) return 1;
            if (bValue === null || bValue === undefined) return -1;
            
            let comparison = 0;
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                if (key === 'created_at') {
                    comparison = new Date(aValue).getTime() - new Date(bValue).getTime();
                } else {
                    comparison = aValue.localeCompare(bValue);
                }
            }
            
            return direction === 'ascending' ? comparison : -comparison;
        });

        return filtered;
    }, [users, searchTerm, filters, sortConfig, organizations]);

    const openModal = (user: User | null = null) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setEditingUser(null);
        setIsModalOpen(false);
    };

    const handleDelete = async (id: string) => {
        if (id === currentUser.id) { alert("You cannot delete your own account."); return; }
        if (window.confirm('Are you sure you want to delete this user?')) {
            const { error } = await supabase.auth.admin.deleteUser(id);
            if (error) { alert(`Error: ${error.message}`); }
        }
    };
    
    const columns = [
        { key: 'name', header: 'Name' },
        { key: 'email', header: 'Email' },
        { key: 'role', header: 'Role' },
        { 
            key: 'organization_id', 
            header: 'Organization',
            render: (user: User) => organizations.find(o => o.id === user.organization_id)?.name || <span className="text-text-secondary italic">None</span>
        },
        {
            key: 'created_at',
            header: 'Date Added',
            render: (user: User) => user.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'
        }
    ];

    return (
        <div className="animate-fade-in">
            <ViewHeader title="Global User Management" subtitle="Manage all users across all organizations.">
                <Button onClick={() => openModal()}>Create User</Button>
            </ViewHeader>
            <Card className="mb-6 !p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <input 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)} 
                        className="form-input" 
                        placeholder="Search by name..." 
                    />
                    <select 
                        value={filters.role} 
                        onChange={e => setFilters(prev => ({...prev, role: e.target.value}))} 
                        className="form-select"
                    >
                        <option value="All">All Roles</option>
                        {Object.values(Role).map(role => <option key={role} value={role}>{role}</option>)}
                    </select>
                    <select 
                        value={filters.organizationId} 
                        onChange={e => setFilters(prev => ({...prev, organizationId: e.target.value}))} 
                        className="form-select"
                    >
                        <option value="All">All Organizations</option>
                        <option value="none">No Organization</option>
                        {organizations.map(org => <option key={org.id} value={org.id}>{org.name}</option>)}
                    </select>
                    <select
                        value={`${sortConfig.key}-${sortConfig.direction}`}
                        onChange={e => {
                            const [key, direction] = e.target.value.split('-');
                            setSortConfig({ key, direction: direction as 'ascending' | 'descending' });
                        }}
                        className="form-select"
                    >
                        <option value="created_at-descending">Recently Added</option>
                        <option value="created_at-ascending">Oldest First</option>
                        <option value="name-ascending">Name (A-Z)</option>
                        <option value="name-descending">Name (Z-A)</option>
                        <option value="role-ascending">Role (A-Z)</option>
                        <option value="role-descending">Role (Z-A)</option>
                        <option value="organization-ascending">Organization (A-Z)</option>
                        <option value="organization-descending">Organization (Z-A)</option>
                    </select>
                </div>
            </Card>
            <DataTable<User> 
                columns={columns} 
                data={filteredAndSortedUsers}
                renderActions={(item) => (
                    <div className="space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => openModal(item)}>Edit</Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>Delete</Button>
                    </div>
                )}
            />
            {isModalOpen && <UserFormModal isOpen={isModalOpen} onClose={closeModal} user={editingUser} organizations={organizations} />}
        </div>
    );
};

export default UserManagementView;
