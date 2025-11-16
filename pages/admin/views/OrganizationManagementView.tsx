import React, { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Organization, Profile as User } from '../../../types';
import ViewHeader from '../components/ViewHeader';
import Button from '../../../components/common/Button';
import DataTable from '../../../components/common/DataTable';
import OrganizationFormModal from '../components/OrganizationFormModal';

interface OrganizationManagementViewProps {
    organizations: Organization[];
    setOrganizations: React.Dispatch<React.SetStateAction<Organization[]>>;
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

const OrganizationManagementView: React.FC<OrganizationManagementViewProps> = ({ organizations, setOrganizations, users, setUsers }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOrg, setEditingOrg] = useState<Organization | null>(null);

    const openModal = (org: Organization | null = null) => {
        setEditingOrg(org);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setEditingOrg(null);
        setIsModalOpen(false);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure? Deleting an organization will also delete its users.')) {
            const { error } = await supabase.from('organizations').delete().eq('id', id);
            if (error) { alert(`Error: ${error.message}`); }
        }
    };

    const columns = [
        { key: 'name', header: 'Name' },
        { key: 'theme_color', header: 'Theme Color', render: (org: Organization) => (
            <div className="flex items-center">
                <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: org.theme_color }}></div>
                {org.theme_color}
            </div>
        )},
        { key: 'user_count', header: 'User Count', render: (org: Organization) => users.filter(u => u.organization_id === org.id).length },
    ];

    return (
        <div className="animate-fade-in">
            <ViewHeader title="Organization Management" subtitle="Manage client organizations and their settings.">
                <Button onClick={() => openModal()}>Add Organization</Button>
            </ViewHeader>
            <DataTable<Organization> 
                columns={columns} 
                data={organizations}
                renderActions={(item) => (
                    <div className="space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => openModal(item)}>Edit</Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>Delete</Button>
                    </div>
                )}
            />
            {isModalOpen && <OrganizationFormModal isOpen={isModalOpen} onClose={closeModal} organization={editingOrg} allUsers={users} />}
        </div>
    );
};

export default OrganizationManagementView;
