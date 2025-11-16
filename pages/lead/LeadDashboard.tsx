import React, { useState, useMemo, useEffect, lazy, Suspense } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Profile as User, Content, Playlist, Organization, AnalyticsRecord, CyberTrainingAnalyticsRecord, NewsItem, QAndAItem } from '../../types';
import { AlleyeFullLogo, ContentIcon, AnalyticsIcon, ProfileIcon, MenuIcon, NewsIcon, ActivityIcon, QAIcon, PlaylistIcon, HomeIcon, UsersIcon } from '../../constants';

// Lazy load views
const PowerBiView = lazy(() => import('./views/PowerBiView'));
const ThreatIntelView = lazy(() => import('./views/ThreatIntelView'));
const TeamManagementView = lazy(() => import('./views/TeamManagementView'));
const ContentAssignmentView = lazy(() => import('./views/ContentAssignmentView'));
const ActivityView = lazy(() => import('./views/ActivityView'));
const AnalyticsView = lazy(() => import('./views/AnalyticsView'));
const QAView = lazy(() => import('./views/QAView'));
const ProfileView = lazy(() => import('./views/ProfileView'));

const SunIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
);

const MoonIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
);

interface ThemeToggleButtonProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeToggleButton: React.FC<ThemeToggleButtonProps> = ({ theme, toggleTheme }) => (
  <button
    onClick={toggleTheme}
    className="w-full flex items-center justify-center p-2 rounded-lg text-text-secondary hover:bg-sidebar-accent transition-colors"
    aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
  >
    {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
  </button>
);


interface LeadDashboardProps {
  currentUser: User;
  organization?: Organization;
  onLogout: () => Promise<void>;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}


const LeadDashboard: React.FC<LeadDashboardProps> = ({ currentUser, organization, onLogout, theme, toggleTheme }) => {
    const [activeView, setActiveView] = useState('Dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [viewLoading, setViewLoading] = useState(false);

    const [users, setUsers] = useState<User[]>([]);
    const [teams, setTeams] = useState<any[]>([]);
    const [content, setContent] = useState<Content[]>([]);
    const [updates, setUpdates] = useState<NewsItem[]>([]);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [analytics, setAnalytics] = useState<AnalyticsRecord[]>([]);
    const [cyberAnalytics, setCyberAnalytics] = useState<CyberTrainingAnalyticsRecord[]>([]);
    const [qandaItems, setQandaItems] = useState<QAndAItem[]>([]);
    const [userAssignments, setUserAssignments] = useState<any[]>([]);
    const [dataLoaded, setDataLoaded] = useState({
        content: false,
        playlists: false,
        analytics: false,
        qanda: false,
        teams: false,
    });


    useEffect(() => {
        const fetchInitialData = async () => {
            if (!currentUser.organization_id) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const { data: usersData } = await supabase.from('profiles').select('*').eq('organization_id', currentUser.organization_id);
                const fetchedUsers = usersData || [];
                setUsers(fetchedUsers);

                const userIds = fetchedUsers.map(u => u.id);
                
                const [updatesRes, teamsRes, assignmentsRes] = await Promise.all([
                    supabase.from('news').select('*, author:profiles(name)').order('created_at', { ascending: false }),
                    supabase.from('teams').select('*').eq('organization_id', currentUser.organization_id),
                    userIds.length > 0 ? supabase.from('user_assignments').select('*').in('user_id', userIds) : Promise.resolve({ data: [] }),
                ]);
        
                if (updatesRes.data) setUpdates(updatesRes.data.map((n:any) => ({...n, author: n.author || {name: 'Unknown'}})));
                if (teamsRes.data) setTeams(teamsRes.data);
                if (assignmentsRes.data) setUserAssignments(assignmentsRes.data);

            } catch (error) {
                console.error("Error fetching initial lead data:", error);
            } finally {
                setLoading(false);
            }
        };
    
        fetchInitialData();
    }, [currentUser.organization_id]);

    useEffect(() => {
        const loadViewData = async () => {
            if (!currentUser.organization_id) return;
            
            setViewLoading(true);
            const assignmentFilter = `or(assigned_org_ids.is.null,assigned_org_ids.eq.{},assigned_org_ids.cs.{${currentUser.organization_id}})`;
            
            try {
                switch(activeView) {
                    case 'Content Library':
                    case 'Playlists':
                        if (!dataLoaded.content) {
                            const { data } = await supabase.from('content').select('*').or(assignmentFilter);
                            if (data) setContent(data as Content[]);
                            setDataLoaded(p => ({...p, content: true}));
                        }
                         if (!dataLoaded.playlists) {
                            const { data } = await supabase.from('playlists').select('*, playlist_content(content_id)').or(assignmentFilter);
                            if (data) {
                                const playlistsData = data.map((p: any) => ({
                                    ...p,
                                    contentIds: p.playlist_content.map((pc: any) => pc.content_id)
                                }));
                                setPlaylists(playlistsData as Playlist[]);
                            }
                            setDataLoaded(p => ({...p, playlists: true}));
                        }
                        break;
                    case 'Analytics':
                        if (!dataLoaded.analytics) {
                            const userIds = users.map(u => u.id);
                            const [analyticsRes, cyberAnalyticsRes] = await Promise.all([
                                userIds.length > 0 ? supabase.from('analytics').select('*').in('user_id', userIds) : Promise.resolve({ data: [] }),
                                supabase.from('cyber_training_analytics').select('*').eq('user_company', currentUser.company)
                            ]);
                            if (analyticsRes.data) setAnalytics(analyticsRes.data);
                            if (cyberAnalyticsRes.data) setCyberAnalytics(cyberAnalyticsRes.data);
                            
                            if (!dataLoaded.content) {
                                const { data } = await supabase.from('content').select('*').or(assignmentFilter);
                                if (data) setContent(prev => [...prev, ...data.filter(newItem => !prev.some(existing => existing.id === newItem.id))]);
                                setDataLoaded(p => ({...p, content: true}));
                            }
                            setDataLoaded(p => ({...p, analytics: true}));
                        }
                        break;
                    case 'Q&A':
                        if (!dataLoaded.qanda) {
                             const { data } = await supabase.from('qanda').select('*, user:profiles(name, avatar_url), admin:profiles!answered_by(name)').or(`is_faq.eq.true,user:organization_id.eq.${currentUser.organization_id}`).order('created_at', { ascending: false });
                             if (data) setQandaItems(data as any[]);
                             setDataLoaded(p => ({...p, qanda: true}));
                        }
                        break;
                }
            } catch (error) {
                console.error(`Error loading data for ${activeView}:`, error);
            } finally {
                setViewLoading(false);
            }
        };

        loadViewData();
    }, [activeView, currentUser, users, dataLoaded]);

    useEffect(() => {
        if (!currentUser.organization_id) return;

        const userIds = users.map(u => u.id);
        const channel = supabase
            .channel(`lead-dashboard-realtime-${currentUser.id}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'analytics', filter: `user_id=in.(${userIds.join(',')})` }, (payload) => {
                const newRecord = payload.new as AnalyticsRecord;
                setAnalytics(prev => [newRecord, ...prev].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'cyber_training_analytics', filter: `user_company=eq.${currentUser.company}` }, (payload) => {
                const newRecord = payload.new as CyberTrainingAnalyticsRecord;
                setCyberAnalytics(prev => [newRecord, ...prev].sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()));
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `organization_id=eq.${currentUser.organization_id}`}, 
                async () => {
                    const { data } = await supabase.from('profiles').select('*').eq('organization_id', currentUser.organization_id);
                    if (data) setUsers(data);
                }
            )
            .on('postgres_changes', { event: '*', schema: 'public', table: 'teams', filter: `organization_id=eq.${currentUser.organization_id}`}, 
                async () => {
                    const { data } = await supabase.from('teams').select('*').eq('organization_id', currentUser.organization_id);
                    if (data) setTeams(data);
                }
            )
            .on('postgres_changes', { event: '*', schema: 'public', table: 'user_assignments', filter: `user_id=in.(${userIds.join(',')})` }, async (payload) => {
                if (userIds.length > 0) {
                    const { data: assignmentsData } = await supabase.from('user_assignments').select('*').in('user_id', userIds);
                    if (assignmentsData) setUserAssignments(assignmentsData);
                }
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'news' }, async (payload) => {
                const handleUpsert = async (record: any) => {
                    const { data: author } = await supabase.from('profiles').select('name').eq('id', record.author_id).single();
                    return { ...record, author: author || { name: 'Unknown' } } as NewsItem;
                };
                if (payload.eventType === 'INSERT') {
                    const newItem = await handleUpsert(payload.new);
                    setUpdates(prev => [newItem, ...prev].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
                } else if (payload.eventType === 'UPDATE') {
                    const updatedItem = await handleUpsert(payload.new);
                    setUpdates(prev => prev.map(item => item.id === payload.new.id ? updatedItem : item));
                } else if (payload.eventType === 'DELETE') {
                    setUpdates(prev => prev.filter(item => item.id !== (payload.old as any).id));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [users, currentUser.id, currentUser.company, currentUser.organization_id]);
    
    const myUsers = useMemo(() => users.filter(u => u.id !== currentUser.id), [users, currentUser.id]);
    const themeColor = organization?.theme_color || 'var(--secondary-color)';

    const renderView = () => {
        if (viewLoading && !loading) {
            return <div className="flex h-full w-full items-center justify-center"><p>Loading {activeView}...</p></div>;
        }

        let viewComponent = null;

        switch (activeView) {
            case 'Dashboard':
                viewComponent = <PowerBiView organization={organization} />;
                break;
            case 'Threat Intel':
                viewComponent = <ThreatIntelView updates={updates} />;
                break;
            case 'Team Management':
                viewComponent = <TeamManagementView users={users} teams={teams} setTeams={setTeams} currentUser={currentUser} />;
                break;
            case 'Content Library':
                viewComponent = <ContentAssignmentView users={myUsers} content={content} playlists={playlists} currentUser={currentUser} teams={teams} initialView="content" userAssignments={userAssignments} />;
                break;
            case 'Playlists':
                viewComponent = <ContentAssignmentView users={myUsers} content={content} playlists={playlists} currentUser={currentUser} teams={teams} initialView="playlists" userAssignments={userAssignments} />;
                break;
            case 'Activity':
                viewComponent = <ActivityView users={myUsers} content={content} playlists={playlists} userAssignments={userAssignments} />;
                break;
            case 'Analytics':
                viewComponent = <AnalyticsView teamUsers={myUsers} teamAnalytics={analytics} teamCyberAnalytics={cyberAnalytics} allContent={content} allUsers={users} organization={organization} />;
                break;
            case 'Q&A':
                viewComponent = <QAView qandaItems={qandaItems} />;
                break;
            case 'Profile':
                viewComponent = <ProfileView user={currentUser} onLogout={onLogout} />;
                break;
            default:
                viewComponent = <PowerBiView organization={organization} />;
        }
        
        return <Suspense fallback={<div className="flex h-full w-full items-center justify-center">Loading {activeView}...</div>}>{viewComponent}</Suspense>;
    };
    
    const navItems = [
        { name: 'Dashboard', icon: HomeIcon },
        { name: 'Threat Intel', icon: NewsIcon },
        { name: 'Team Management', icon: UsersIcon },
        { name: 'Content Library', icon: ContentIcon },
        { name: 'Playlists', icon: PlaylistIcon },
        { name: 'Activity', icon: ActivityIcon },
        { name: 'Analytics', icon: AnalyticsIcon },
        { name: 'Q&A', icon: QAIcon },
        { name: 'Profile', icon: ProfileIcon },
    ];

    const activeStyle = {
        backgroundColor: `${themeColor}33`, // 20% opacity
        color: themeColor,
    };
    
    return (
        <div className="flex h-screen bg-background text-text-main">
            <div className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`} onClick={() => setIsSidebarOpen(false)}></div>

            <aside className={`w-64 flex-shrink-0 bg-sidebar border-r border-border flex flex-col fixed inset-y-0 left-0 z-30 md:relative md:translate-x-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
                <div className="h-16 flex items-center justify-center px-4 border-b border-border">
                    {organization?.logo_url ? (
                        <img src={organization.logo_url} alt={organization.name} className="h-10 max-w-full object-contain" />
                    ) : (
                        <AlleyeFullLogo className="text-text-main h-8" />
                    )}
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map(item => (
                        <button 
                            key={item.name} 
                            onClick={() => { setActiveView(item.name); setIsSidebarOpen(false); }}
                            className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeView !== item.name ? 'text-text-secondary hover:bg-sidebar-accent' : ''}`}
                            style={activeView === item.name ? activeStyle : {}}
                        >
                            <item.icon className="mr-3 h-5 w-5" />
                            <span>{item.name}</span>
                        </button>
                    ))}
                </nav>
                 <div className="p-4 border-t border-border">
                    <ThemeToggleButton theme={theme} toggleTheme={toggleTheme} />
                </div>
            </aside>
            <div className="flex-1 flex flex-col overflow-hidden">
                 <header className="h-16 bg-sidebar/50 backdrop-blur-md border-b border-border flex items-center px-4 md:hidden sticky top-0 z-10 flex-shrink-0">
                    <button onClick={() => setIsSidebarOpen(true)} className="text-gray-400">
                        <MenuIcon className="h-6 w-6" />
                    </button>
                    <h2 className="ml-4 font-semibold text-lg">{activeView}</h2>
                </header>
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    {loading ? (
                        <div className="flex h-full w-full items-center justify-center">
                            <p>Loading your dashboard...</p>
                        </div>
                    ) : (
                        <div className="max-w-7xl mx-auto">
                            {renderView()}
                        </div>
                    )}
                </main>
            </div>
             <style>{`
                .btn-primary-themed {
                    background-color: ${themeColor};
                    color: black;
                }
                .btn-primary-themed:hover {
                    opacity: 0.9;
                }
            `}</style>
        </div>
    );
};

export default LeadDashboard;