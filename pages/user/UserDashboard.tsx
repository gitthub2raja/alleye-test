import React, { useState, useMemo, useEffect, useCallback, lazy, Suspense } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Profile as User, Content, Organization, UserProgress, NewsItem, Playlist, QAndAItem } from '../../types';
import { sendReadStatement } from '../../lib/xapi';
import { HomeIcon, NewsIcon, ContentIcon, PlaylistIcon, ActivityIcon, AnalyticsIcon, QAIcon, ProfileIcon, AlleyeFullLogo } from '../../constants';
import ContentPlayerModal from './player/ContentPlayerModal';
import AskQuestionModal from './components/AskQuestionModal';
import { GoogleGenAI, Type } from "@google/genai";


// --- ICONS ---
const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>);
const SunIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>);
const MoonIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>);
const MenuIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>);

// LAZY LOAD VIEWS
const HomeView = lazy(() => import('./views/HomeView'));
const ThreatIntelView = lazy(() => import('./views/ThreatIntelView'));
const LibraryView = lazy(() => import('./views/LibraryView'));
const PlaylistsView = lazy(() => import('./views/PlaylistsView'));
const ActivityView = lazy(() => import('./views/ActivityView'));
const AnalyticsView = lazy(() => import('./views/AnalyticsView'));
const QAView = lazy(() => import('./views/QAView'));
const ProfileView = lazy(() => import('./views/ProfileView'));


interface UserDashboardProps {
  currentUser: User;
  organization?: Organization;
  onLogout: () => Promise<void>;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeToggleButton: React.FC<{ theme: 'light' | 'dark'; toggleTheme: () => void; }> = ({ theme, toggleTheme }) => (
  <button
    onClick={toggleTheme}
    className="w-full flex items-center justify-center p-2 rounded-lg text-text-secondary hover:bg-sidebar-accent transition-colors"
    aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
  >
    {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
  </button>
);

const UserDashboard: React.FC<UserDashboardProps> = ({ currentUser: initialUser, organization, onLogout, theme, toggleTheme }) => {
    const [currentUser, setCurrentUser] = useState(initialUser);
    const [activeView, setActiveView] = useState('Home');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const [allContent, setAllContent] = useState<Content[]>([]);
    const [allPlaylists, setAllPlaylists] = useState<Playlist[]>([]);
    const [assignedContent, setAssignedContent] = useState<Content[]>([]);
    const [assignedPlaylists, setAssignedPlaylists] = useState<Playlist[]>([]);
    const [updates, setUpdates] = useState<NewsItem[]>([]);
    const [qandaItems, setQandaItems] = useState<QAndAItem[]>([]);
    const [recommendations, setRecommendations] = useState<{content: Content; reason: string}[] | null>(null);
    const [recLoading, setRecLoading] = useState(true);
    const [recError, setRecError] = useState<string | null>(null);
    
    const [playingContent, setPlayingContent] = useState<Content | null>(null);
    const [isAskModalOpen, setIsAskModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const orgId = currentUser.organization_id;
                const assignmentFilter = orgId ? `or(assigned_org_ids.is.null,assigned_org_ids.eq.{},assigned_org_ids.cs.{${orgId}})` : `or(assigned_org_ids.is.null,assigned_org_ids.eq.{})`;

                const [contentRes, playlistsRes, updatesRes, qandaRes, assignmentsRes] = await Promise.all([
                    supabase.from('content').select('*').or(assignmentFilter),
                    supabase.from('playlists').select('*, playlist_content(content_id)').or(assignmentFilter),
                    supabase.from('news').select('*, author:profiles(name)').order('created_at', { ascending: false }).limit(5),
                    supabase.from('qanda').select('*, user:profiles(name, avatar_url), admin:profiles!answered_by(name)').order('created_at', { ascending: false }),
                    supabase.from('user_assignments').select('*').eq('user_id', currentUser.id),
                ]);

                if (contentRes.data) setAllContent(contentRes.data);
                if (updatesRes.data) setUpdates(updatesRes.data.map((n:any) => ({...n, author: n.author || {name: 'Unknown'}})));
                if (qandaRes.data) setQandaItems(qandaRes.data as any[]);
                
                if (playlistsRes.data) {
                    const playlistsData = playlistsRes.data.map((p: any) => ({ ...p, contentIds: p.playlist_content.map((pc: any) => pc.content_id)}));
                    setAllPlaylists(playlistsData);
                }

                if (contentRes.data && playlistsRes.data && assignmentsRes.data) {
                    const assignedContentIds = new Set(assignmentsRes.data.filter(a => a.content_id).map(a => a.content_id));
                    const assignedPlaylistIds = new Set(assignmentsRes.data.filter(a => a.playlist_id).map(a => a.playlist_id));
                    
                    const pPlaylists = (playlistsRes.data || []).filter(p => assignedPlaylistIds.has(p.id));
                    setAssignedPlaylists(pPlaylists.map((p: any) => ({ ...p, contentIds: p.playlist_content.map((pc: any) => pc.content_id)})));

                    pPlaylists.forEach((p: any) => p.playlist_content.forEach((pc: any) => assignedContentIds.add(pc.content_id)));

                    setAssignedContent(contentRes.data.filter(c => assignedContentIds.has(c.id)));
                }

            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        
        const profileSubscription = supabase.channel(`public:profiles:id=eq.${currentUser.id}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${currentUser.id}` }, (payload) => {
                setCurrentUser(prev => ({...prev, ...payload.new as User}));
            }).subscribe();
            
        return () => {
             supabase.removeChannel(profileSubscription);
        }
    }, [currentUser.id, currentUser.organization_id]);
    
    const getRecommendations = useCallback(async () => {
        setRecLoading(true);
        setRecError(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const history = Object.entries(currentUser.progress || {})
                .filter(([_, p]) => p.status === 'completed')
                .map(([id, _]) => allContent.find(c => c.id === parseInt(id))?.title)
                .filter(Boolean);

            const availableContent = allContent
                .filter(c => currentUser.progress?.[c.id]?.status !== 'completed')
                .map(c => ({ id: c.id, title: c.title, category: c.category, difficulty: c.difficulty }));

            if (availableContent.length === 0) {
                setRecommendations([]);
                return;
            }

            const prompt = `Based on the user's completed content history and the available content, recommend up to 4 items. For each recommendation, provide a brief, engaging, one-sentence reason why the user would like it. User history: [${history.join(', ')}]. Available content: ${JSON.stringify(availableContent)}.`;

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.NUMBER },
                                reason: { type: Type.STRING }
                            },
                        },
                    },
                },
            });

            const result = JSON.parse(response.text);
            const recs = result.map((rec: {id: number, reason: string}) => {
                const contentItem = allContent.find(c => c.id === rec.id);
                return contentItem ? { content: contentItem, reason: rec.reason } : null;
            }).filter(Boolean);

            setRecommendations(recs);

        } catch (error: any) {
            console.error("Error fetching recommendations:", error);
            setRecError("Could not fetch recommendations at this time.");
        } finally {
            setRecLoading(false);
        }
    }, [currentUser.progress, allContent]);

    useEffect(() => {
        if (!loading && allContent.length > 0) {
            getRecommendations();
        }
    }, [loading, allContent, getRecommendations]);
    
    const handleProgressUpdate = useCallback(async (contentId: number, score?: number) => {
        const newProgressData = { status: 'completed' as const, ...(score !== undefined && { score }) };
        const updatedProgress = { ...currentUser.progress, [contentId]: newProgressData };
        const { error } = await supabase.from('profiles').update({ progress: updatedProgress }).eq('id', currentUser.id);
        if (error) console.error("Error updating progress:", error);
    }, [currentUser.id, currentUser.progress]);

    const handleNewsRead = (item: NewsItem) => {
        sendReadStatement(currentUser, item);
        setActiveView('Threat Intel');
    };

    const handlePlayContent = (content: Content) => setPlayingContent(content);

    const featuredContent = useMemo(() => assignedContent[0], [assignedContent]);
    const continueLearning = useMemo(() => assignedContent.filter(c => currentUser.progress?.[c.id]?.status === 'in-progress'), [assignedContent, currentUser.progress]);
    const newContent = useMemo(() => assignedContent.filter(c => !currentUser.progress?.[c.id]), [assignedContent, currentUser.progress]);
    const themeColor = organization?.theme_color || 'var(--primary-color)';

    const navItems = [
        { name: 'Home', icon: HomeIcon },
        { name: 'Threat Intel', icon: NewsIcon },
        { name: 'Library', icon: ContentIcon },
        { name: 'Playlists', icon: PlaylistIcon },
        { name: 'My Activity', icon: ActivityIcon },
        { name: 'My Analytics', icon: AnalyticsIcon },
        { name: 'Q&A', icon: QAIcon },
        { name: 'Profile', icon: ProfileIcon },
    ];
    
    const renderView = () => {
        let viewComponent;
        switch(activeView) {
            case 'Home':
                viewComponent = <HomeView featuredContent={featuredContent} continueLearning={continueLearning} newContent={newContent} recommendations={recommendations} updates={updates} onPlay={handlePlayContent} onNewsRead={handleNewsRead} loading={loading} recLoading={recLoading} recError={recError} userProgress={currentUser.progress} />;
                break;
            case 'Threat Intel':
                viewComponent = <ThreatIntelView updates={updates} onRead={handleNewsRead} />;
                break;
            case 'Library':
                viewComponent = <LibraryView content={assignedContent} onPlay={handlePlayContent} progress={currentUser.progress} />;
                break;
            case 'Playlists':
                viewComponent = <PlaylistsView playlists={assignedPlaylists} allContent={allContent} onPlay={handlePlayContent} progress={currentUser.progress} />;
                break;
            case 'My Activity':
                viewComponent = <ActivityView user={currentUser} allContent={allContent} />;
                break;
            case 'My Analytics':
                viewComponent = <AnalyticsView user={currentUser} allContent={allContent} />;
                break;
            case 'Q&A':
                viewComponent = <QAView userQanda={qandaItems.filter(i => i.user_id === currentUser.id)} faqItems={qandaItems.filter(i => i.is_faq)} onAsk={() => setIsAskModalOpen(true)} />;
                break;
            case 'Profile':
                viewComponent = <ProfileView user={currentUser} onLogout={onLogout} />;
                break;
            default:
                viewComponent = <HomeView featuredContent={featuredContent} continueLearning={continueLearning} newContent={newContent} recommendations={recommendations} updates={updates} onPlay={handlePlayContent} onNewsRead={handleNewsRead} loading={loading} recLoading={recLoading} recError={recError} userProgress={currentUser.progress} />;
        }
        return <Suspense fallback={<div className="flex h-full w-full items-center justify-center">Loading {activeView}...</div>}>{viewComponent}</Suspense>;
    }
    
    return (
        <div className="flex h-screen bg-background text-text-main">
            {/* Mobile overlay */}
            <div className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`} onClick={() => setIsSidebarOpen(false)}></div>
            
            {/* Sidebar */}
            <aside className={`w-64 flex-shrink-0 bg-sidebar border-r border-border flex flex-col fixed inset-y-0 left-0 z-30 md:relative md:translate-x-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
                <div className="h-20 flex items-center justify-center px-4 border-b border-border">
                    {organization?.logo_url ? (
                        <img src={organization.logo_url} alt={organization.name} className="h-10 max-w-full object-contain" />
                    ) : (
                        <AlleyeFullLogo className="text-text-main h-8" />
                    )}
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map(item => (
                        <button key={item.name} onClick={() => { setActiveView(item.name); setIsSidebarOpen(false); }} className={`w-full flex items-center px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors duration-200 ${activeView === item.name ? 'text-highlight' : 'text-text-secondary hover:bg-sidebar-accent hover:text-text-main'}`} style={activeView === item.name ? { color: themeColor } : {}}>
                            <item.icon className="mr-4 h-5 w-5" />
                            <span>{item.name}</span>
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t border-border">
                    <ThemeToggleButton theme={theme} toggleTheme={toggleTheme} />
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-20 flex-shrink-0 bg-sidebar/80 backdrop-blur-md border-b border-border flex items-center justify-between md:justify-end px-6">
                    <button onClick={() => setIsSidebarOpen(true)} className="text-text-secondary md:hidden"><MenuIcon className="h-6 w-6" /></button>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="font-semibold text-text-main">{currentUser.name}</p>
                            <p className="text-xs text-text-secondary">{currentUser.role}</p>
                        </div>
                        <div className="relative group">
                            <img src={currentUser.avatar_url || `https://i.pravatar.cc/150?u=${currentUser.id}`} alt="avatar" className="w-10 h-10 rounded-full cursor-pointer" />
                            <div className="absolute top-full right-0 mt-2 w-48 bg-sidebar border border-border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity invisible group-hover:visible z-20">
                                <button onClick={() => setActiveView('Profile')} className="block w-full text-left px-4 py-2 text-sm text-text-main hover:bg-sidebar-accent">Profile</button>
                                <button onClick={onLogout} className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-sidebar-accent">Logout</button>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    {renderView()}
                </main>
            </div>
            {playingContent && <ContentPlayerModal isOpen={!!playingContent} onClose={() => setPlayingContent(null)} content={playingContent} user={currentUser} onProgressUpdate={handleProgressUpdate} />}
            <AskQuestionModal isOpen={isAskModalOpen} onClose={() => setIsAskModalOpen(false)} currentUser={currentUser} />
        </div>
    );
};

export default UserDashboard;