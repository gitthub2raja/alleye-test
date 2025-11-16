

import React, { useMemo } from 'react';
import { Content, ContentType, Playlist, Profile as User } from '../../../types';
import Modal from '../../../components/common/Modal';
import DataTable from '../../../components/common/DataTable';

interface UserActivityModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    allContent: Content[];
    allPlaylists: Playlist[];
    userAssignments: any[];
}

const UserActivityModal: React.FC<UserActivityModalProps> = ({ isOpen, onClose, user, allContent, allPlaylists, userAssignments }) => {
    if (!user) return null;

    const assignedContent = useMemo(() => {
        const assignments = userAssignments.filter(a => a.user_id === user.id);
        const directContentIds = new Set(assignments.filter(a => a.content_id).map(a => a.content_id));
        const playlistIds = new Set(assignments.filter(a => a.playlist_id).map(a => a.playlist_id));
        
        allPlaylists.forEach(p => {
            if (playlistIds.has(p.id)) {
                p.contentIds.forEach(cid => directContentIds.add(cid));
            }
        });

        return Array.from(directContentIds).map(id => {
            const content = allContent.find(c => c.id === id);
            if (!content) return null;
            const progress = user.progress?.[id];
            return {
                id: content.id,
                title: content.title,
                type: content.type,
                status: progress?.status || 'not-started',
                score: progress?.score
            };
        // FIX: The type predicate for `filter` was incorrect, asserting `score` was always a `number`.
        // It is now correctly typed as optional (`score?: number`) to align with the data structure where a score may not be present.
        }).filter((c): c is { id: number; title: string; type: ContentType; status: "not-started" | "in-progress" | "completed"; score?: number; } => !!c);
    }, [user, userAssignments, allContent, allPlaylists]);

    const columns = [
        { key: 'title', header: 'Content Title' },
        { key: 'type', header: 'Type' },
        { 
            key: 'status', 
            header: 'Status', 
            render: (item: any) => (
                <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                    item.status === 'completed' ? 'bg-green-500/20 text-green-300' : 
                    item.status === 'in-progress' ? 'bg-yellow-500/20 text-yellow-300' : 
                    'bg-gray-500/20 text-gray-300'
                }`}>{item.status.replace('-', ' ')}</span>
            )
        },
        { key: 'score', header: 'Score', render: (item: any) => (item.score !== undefined && item.score !== null) ? `${item.score}%` : 'N/A' },
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Progress for ${user.name}`} size="xl">
            <DataTable columns={columns} data={assignedContent} />
        </Modal>
    );
};

export default UserActivityModal;