import React from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { NewsItem, Profile as User } from '../../../types';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { UsersIcon, ContentIcon, PlaylistIcon, OrganizationIcon, QAIcon, AnalyticsIcon } from '../../../constants';

interface DashboardViewProps {
    currentUser: User;
    stats: {
        userCount: number;
        contentCount: number;
        playlistCount: number;
        organizationCount: number;
    };
    updates: NewsItem[];
    setUpdates: React.Dispatch<React.SetStateAction<NewsItem[]>>;
    pendingQandaCount: number;
    setActiveView: (view: string) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ currentUser, stats, updates, setUpdates, pendingQandaCount, setActiveView }) => {

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this news post?')) {
            const { error } = await supabase.from('news').delete().eq('id', id);
            if (error) {
                alert(`Error: ${error.message}`);
            }
        }
    };

    return (
    <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="flex-1">
                <h1 className="text-3xl font-bold text-text-main">Welcome back, {currentUser.name}!</h1>
                <p className="mt-1 text-text-secondary">Here's what's happening with your LMS today.</p>
            </div>
            <Card className="!p-4 flex items-center gap-4">
                 <img src={currentUser.avatar_url || `https://i.pravatar.cc/150?u=${currentUser.id}`} alt={currentUser.name} className="w-16 h-16 rounded-full object-cover"/>
                 <div>
                    <p className="font-bold text-text-main">{currentUser.name}</p>
                    <p className="text-sm text-text-secondary">{currentUser.email}</p>
                 </div>
                 <Button variant="ghost" onClick={() => setActiveView('Profile')}>Edit Profile</Button>
            </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setActiveView('Users')}>
                <div className="flex items-center">
                    <UsersIcon className="w-8 h-8 text-primary" />
                    <div className="ml-4">
                        <p className="text-3xl font-bold">{stats.userCount}</p>
                        <p className="text-text-secondary">Total Users</p>
                    </div>
                </div>
             </Card>
             <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setActiveView('Content')}>
                <div className="flex items-center">
                    <ContentIcon className="w-8 h-8 text-primary" />
                    <div className="ml-4">
                        <p className="text-3xl font-bold">{stats.contentCount}</p>
                        <p className="text-text-secondary">Content Items</p>
                    </div>
                </div>
             </Card>
             <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setActiveView('Playlists')}>
                <div className="flex items-center">
                    <PlaylistIcon className="w-8 h-8 text-primary" />
                    <div className="ml-4">
                        <p className="text-3xl font-bold">{stats.playlistCount}</p>
                        <p className="text-text-secondary">Playlists</p>
                    </div>
                </div>
             </Card>
             <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setActiveView('Organizations')}>
                <div className="flex items-center">
                    <OrganizationIcon className="w-8 h-8 text-primary" />
                    <div className="ml-4">
                        <p className="text-3xl font-bold">{stats.organizationCount}</p>
                        <p className="text-text-secondary">Organizations</p>
                    </div>
                </div>
             </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Latest Threat Intel</h2>
                    <Button variant="ghost" size="sm" onClick={() => setActiveView('Threat Intel')}>View All</Button>
                </div>
                <div className="space-y-3">
                    {updates.slice(0, 3).map(update => (
                        <div key={update.id} className="p-3 rounded-lg hover:bg-sidebar-accent flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-text-main">{update.title}</p>
                                <p className="text-sm text-text-secondary">
                                    By {update.author?.name} on {new Date(update.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <Button variant="danger" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(update.id); }}>Delete</Button>
                        </div>
                    ))}
                    {updates.length === 0 && <p className="text-text-secondary">No recent updates.</p>}
                </div>
            </Card>

            <div className="space-y-6">
                <Card className="cursor-pointer hover:border-yellow-400 transition-colors !p-4 flex items-center justify-between" onClick={() => setActiveView('Q&A')}>
                    <div className="flex items-center gap-4">
                        <QAIcon className="w-8 h-8 text-yellow-400" />
                        <div>
                            <p className="font-bold text-text-main">Pending Q&A</p>
                            <p className="text-sm text-text-secondary">Questions awaiting your response</p>
                        </div>
                    </div>
                    <span className="text-2xl font-bold text-yellow-400">{pendingQandaCount}</span>
                </Card>

                <Card className="cursor-pointer hover:border-blue-500 transition-colors !p-4 flex items-center justify-between" onClick={() => setActiveView('Analytics')}>
                     <div className="flex items-center gap-4">
                        <AnalyticsIcon className="w-8 h-8 text-blue-500" />
                        <div>
                            <p className="font-bold text-text-main">View Analytics</p>
                            <p className="text-sm text-text-secondary">Track learner progress and engagement</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    </div>
    );
};

export default DashboardView;
