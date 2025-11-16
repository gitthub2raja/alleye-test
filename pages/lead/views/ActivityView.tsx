import React, { useState, useMemo } from 'react';
import { Content, Playlist, Profile as User } from '../../../types';
import ViewHeader from '../components/ViewHeader';
import Card from '../../../components/common/Card';
import DataTable from '../../../components/common/DataTable';
import Button from '../../../components/common/Button';
import UserActivityModal from '../components/UserActivityModal';

interface ActivityViewProps {
    users: User[];
    content: Content[];
    playlists: Playlist[];
    userAssignments: any[];
}

const ActivityView: React.FC<ActivityViewProps> = ({ users, content, playlists, userAssignments }) => {
    const [viewingUser, setViewingUser] = useState<User | null>(null);

    const userPerformance = useMemo(() => {
        return users.map(user => {
            const progress = user.progress || {};
            const completedCourses = Object.values(progress).filter(p => p.status === 'completed').length;
            const scores = Object.values(progress).map(p => p.score).filter((s): s is number => s !== undefined && s !== null);
            const averageScore = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
            
            return {
                ...user,
                id: user.id,
                completedCourses,
                averageScore: Math.round(averageScore),
            };
        });
    }, [users]);
    
    const columns = [
        { key: 'name', header: 'User' },
        { key: 'points', header: 'Points', render: (item: any) => item.points || 0 },
        { key: 'completedCourses', header: 'Courses Completed' },
        { key: 'averageScore', header: 'Average Score', render: (item: any) => item.averageScore ? `${item.averageScore}%` : 'N/A' },
    ];
    
    return (
        <div className="animate-fade-in">
            <ViewHeader title="Team Activity" subtitle="View performance metrics for your team members." />
            <Card>
                <DataTable
                    columns={columns}
                    data={userPerformance}
                    renderActions={(user) => (
                        <Button variant="ghost" size="sm" onClick={() => setViewingUser(user as User)}>View Progress</Button>
                    )}
                />
            </Card>
            <UserActivityModal 
                isOpen={!!viewingUser} 
                onClose={() => setViewingUser(null)} 
                user={viewingUser}
                allContent={content}
                allPlaylists={playlists}
                userAssignments={userAssignments}
            />
        </div>
    );
};

export default ActivityView;
