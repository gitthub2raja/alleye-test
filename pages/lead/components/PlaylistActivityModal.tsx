import React, { useMemo } from 'react';
import { Playlist, Profile as User } from '../../../types';
import Modal from '../../../components/common/Modal';
import DataTable from '../../../components/common/DataTable';

const ProgressBar: React.FC<{ value: number }> = ({ value }) => (
    <div className="w-full bg-sidebar-accent rounded-full h-2.5">
        <div className="bg-primary h-2.5 rounded-full" style={{ width: `${value}%` }}></div>
    </div>
);

interface PlaylistActivityModalProps {
    isOpen: boolean;
    onClose: () => void;
    playlist: Playlist | null;
    users: User[];
    userAssignments: any[];
}

const PlaylistActivityModal: React.FC<PlaylistActivityModalProps> = ({ isOpen, onClose, playlist, users, userAssignments }) => {
    if (!playlist) return null;

    type ActivityData = { id: string; name: string; progress: number };

    const activityData: ActivityData[] = useMemo(() => {
        const assignedUserIds = new Set(userAssignments.filter(a => a.playlist_id === playlist.id).map(a => a.user_id));
        const assignedUsers = users.filter(u => assignedUserIds.has(u.id));

        return assignedUsers.map(user => {
            const completedCount = playlist.contentIds.filter(cid => user.progress?.[cid]?.status === 'completed').length;
            const progress = playlist.contentIds.length > 0 ? Math.round((completedCount / playlist.contentIds.length) * 100) : 0;
            return {
                id: user.id,
                name: user.name,
                progress: progress
            };
        });
    }, [playlist, users, userAssignments]);
    
    const columns: { key: keyof ActivityData | string; header: string; render?: (item: ActivityData) => React.ReactNode }[] = [
        { key: 'name', header: 'User' },
        { 
            key: 'progress', 
            header: 'Completion Progress', 
            render: (item) => (
                <div className="flex items-center gap-4">
                    <ProgressBar value={item.progress} />
                    <span className="text-sm font-semibold w-12 text-right">{item.progress}%</span>
                </div>
            )
        }
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Activity for "${playlist.name}"`} size="lg">
            <DataTable<ActivityData> columns={columns} data={activityData} />
        </Modal>
    );
};

export default PlaylistActivityModal;
