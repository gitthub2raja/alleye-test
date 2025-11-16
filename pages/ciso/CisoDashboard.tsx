import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { Profile, Content, AnalyticsRecord, CyberTrainingAnalyticsRecord, Organization } from '../../types';
import { supabase } from '../../lib/supabaseClient';
import { fetchStatements } from '../../lib/xapiLrsClient';
import Button from '../../components/common/Button';
import ThemeToggleButton from './components/ThemeToggleButton';
import InsightModal from './components/InsightModal';

// Lazy load view components
const ExecutiveSummaryView = lazy(() => import('./views/ExecutiveSummaryView'));
const EngagementView = lazy(() => import('./views/EngagementView'));
const EffectivenessView = lazy(() => import('./views/EffectivenessView'));
const BehavioralIntelView = lazy(() => import('./views/BehavioralIntelView'));
const ComplianceView = lazy(() => import('./views/ComplianceView'));
const RoiView = lazy(() => import('./views/RoiView'));
const DrillDownView = lazy(() => import('./views/DrillDownView'));
const PowerBiView = lazy(() => import('./views/PowerBiView'));


interface CisoDashboardProps {
  currentUser: Profile;
  organization?: Organization;
  onLogout: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const CisoDashboard: React.FC<CisoDashboardProps> = ({ currentUser, organization, onLogout, theme, toggleTheme }) => {
    const [loading, setLoading] = useState(true);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [content, setContent] = useState<Content[]>([]);
    const [analytics, setAnalytics] = useState<AnalyticsRecord[]>([]);
    const [cyberAnalytics, setCyberAnalytics] = useState<CyberTrainingAnalyticsRecord[]>([]);
    const [xapiStatements, setXapiStatements] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('Executive Summary');
    const [insightModalType, setInsightModalType] = useState<string | null>(null);

    useEffect(() => {
        const fetchAllData = async () => {
            if (!organization) {
                setLoading(false);
                return;
            }
            
            setLoading(true);
            try {
                const orgContentFilter = `or(assigned_org_ids.is.null,assigned_org_ids.eq.{},assigned_org_ids.cs.{${organization.id}})`;
                
                const [
                    profilesRes,
                    contentRes,
                    analyticsRes,
                    cyberAnalyticsRes,
                    xapiRes
                ] = await Promise.all([
                    supabase.from('profiles').select('*').eq('organization_id', organization.id),
                    supabase.from('content').select('*').or(orgContentFilter),
                    supabase.from('analytics').select('*').in('user_id', (await supabase.from('profiles').select('id').eq('organization_id', organization.id)).data?.map(p => p.id) || []),
                    supabase.from('cyber_training_analytics').select('*').in('user_id', (await supabase.from('profiles').select('id').eq('organization_id', organization.id)).data?.map(p => p.id) || []),
                    fetchStatements({}) // Fetch all initially, then filter
                ]);

                const orgProfiles = profilesRes.data || [];
                setProfiles(orgProfiles);
                setContent(contentRes.data || []);
                setAnalytics(analyticsRes.data || []);
                setCyberAnalytics(cyberAnalyticsRes.data || []);
                
                const orgUserEmails = new Set(orgProfiles.map(p => `mailto:${p.email}`));
                setXapiStatements(xapiRes.filter(s => orgUserEmails.has(s.actor.mbox)));

            } catch (error) {
                console.error("Error fetching CISO dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();

        const channels = [
            supabase.channel(`ciso-profiles-${organization?.id}`).on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `organization_id=eq.${organization?.id}` }, fetchAllData).subscribe(),
            supabase.channel(`ciso-content-${organization?.id}`).on('postgres_changes', { event: '*', schema: 'public', table: 'content' }, fetchAllData).subscribe(),
             supabase.channel(`ciso-analytics-${organization?.id}`).on('postgres_changes', { event: '*', schema: 'public', table: 'analytics' }, fetchAllData).subscribe(),
        ];
    
        return () => {
            channels.forEach(channel => supabase.removeChannel(channel));
        };
    }, [organization]);

    const dashboardData = useMemo(() => {
        const complianceContentIds = new Set(content.filter(c => c.compliance?.length > 0).map(c => c.id));
        
        // Executive Summary
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const activeUserIds = new Set(analytics.filter(a => new Date(a.timestamp) > thirtyDaysAgo).map(a => a.user_id));
        const activeUserCoverage = profiles.length > 0 ? Math.round((activeUserIds.size / profiles.length) * 100) : 0;
        const contentStarted = new Set(analytics.filter(a => a.event_type === 'start').map(a => `${a.user_id}-${a.content_id}`));
        const contentCompleted = new Set(analytics.filter(a => a.event_type === 'complete').map(a => `${a.user_id}-${a.content_id}`));
        const avgCompletionRate = contentStarted.size > 0 ? Math.round((contentCompleted.size / contentStarted.size) * 100) : 0;
        const totalScore = cyberAnalytics.reduce((acc, curr) => acc + (curr.score || 0), 0);
        const avgQuizScore = cyberAnalytics.length > 0 ? Math.round(totalScore / cyberAnalytics.length) : 0;
        const bii = Math.round((activeUserCoverage * 0.4) + (avgCompletionRate * 0.3) + (avgQuizScore * 0.3));
        const thisQuarterScores = cyberAnalytics.filter(a => new Date(a.completed_at) >= new Date(new Date().setMonth(new Date().getMonth() - 3)));
        const lastQuarterScores = cyberAnalytics.filter(a => new Date(a.completed_at) < new Date(new Date().setMonth(new Date().getMonth() - 3)) && new Date(a.completed_at) >= new Date(new Date().setMonth(new Date().getMonth() - 6)));
        const avgThisQ = thisQuarterScores.length > 0 ? thisQuarterScores.reduce((acc, curr) => acc + curr.score, 0) / thisQuarterScores.length : 0;
        const avgLastQ = lastQuarterScores.length > 0 ? lastQuarterScores.reduce((acc, curr) => acc + curr.score, 0) / lastQuarterScores.length : 0;
        const complianceCompletions = Array.from(contentCompleted).filter(key => complianceContentIds.has(parseInt(key.split('-')[1]))).length;
        const complianceStarts = Array.from(contentStarted).filter(key => complianceContentIds.has(parseInt(key.split('-')[1]))).length;
        const complianceAlignment = complianceStarts > 0 ? Math.round((complianceCompletions / complianceStarts) * 100) : 0;

        // Engagement
        const videosWatchedMap: { [key: string]: number } = {};
        const videoContentIds = new Set(content.filter(c => c.type.toLowerCase().includes('video')).map(c => c.id));
        analytics.filter(a => a.event_type === 'complete' && videoContentIds.has(a.content_id)).forEach(a => {
            const month = new Date(a.timestamp).toLocaleString('default', { month: 'short' });
            videosWatchedMap[month] = (videosWatchedMap[month] || 0) + 1;
        });
        const videosWatched = Object.entries(videosWatchedMap).map(([month, count]) => ({ month, count }));
        const completionRateMap: { [key: number]: { started: number, completed: number } } = {};
        analytics.forEach(a => {
            if (!completionRateMap[a.content_id]) completionRateMap[a.content_id] = { started: 0, completed: 0 };
            if (a.event_type === 'start') completionRateMap[a.content_id].started++;
            if (a.event_type === 'complete') completionRateMap[a.content_id].completed++;
        });
        const completionRate = Object.entries(completionRateMap).map(([contentId, data]) => ({
            name: (content.find(c => c.id === parseInt(contentId))?.title || 'Unknown').substring(0, 15),
            rate: data.started > 0 ? Math.round((data.completed / data.started) * 100) : 0, started: data.started
        })).sort((a,b) => b.started - a.started).slice(0, 5);
        const watchTimeMap: { [key: number]: { totalTime: number, count: number } } = {};
        cyberAnalytics.forEach(ca => {
            if (!watchTimeMap[ca.content_id]) watchTimeMap[ca.content_id] = { totalTime: 0, count: 0 };
            watchTimeMap[ca.content_id].totalTime += ca.video_watch_time;
            watchTimeMap[ca.content_id].count++;
        });
        const avgWatchTime = Object.entries(watchTimeMap).map(([contentId, data]) => ({
            module: content.find(c => c.id === parseInt(contentId))?.title || 'Unknown',
            time: data.count > 0 ? Math.round(data.totalTime / data.count) : 0
        })).sort((a,b) => b.time - a.time).slice(0, 5);

        // Effectiveness
        const scores = cyberAnalytics.map(s => s.score);
        const bins = { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0 };
        scores.forEach(score => {
            if (score <= 20) bins['0-20']++; else if (score <= 40) bins['21-40']++;
            else if (score <= 60) bins['41-60']++; else if (score <= 80) bins['61-80']++;
            else bins['81-100']++;
        });
        const scoreDistribution = Object.entries(bins).map(([name, count]) => ({ name, count }));

        // Behavioral
        const departmentScoresMap: { [key: string]: { totalScore: number, count: number } } = {};
        cyberAnalytics.forEach(ca => {
            const dept = profiles.find(p => p.id === ca.user_id)?.team || 'Unknown';
            if (!departmentScoresMap[dept]) departmentScoresMap[dept] = { totalScore: 0, count: 0 };
            departmentScoresMap[dept].totalScore += ca.score;
            departmentScoresMap[dept].count++;
        });
        const departmentalScores = Object.entries(departmentScoresMap).map(([name, data]) => ({ id: name, name, score: data.count > 0 ? Math.round(data.totalScore / data.count) : 0 })).sort((a, b) => b.score - a.score);
        const fatigueIndexMap: { [key: string]: number } = {};
        analytics.filter(a => a.event_type === 'complete').forEach(a => {
            const month = new Date(a.timestamp).toLocaleString('default', { month: 'short' });
            fatigueIndexMap[month] = (fatigueIndexMap[month] || 0) + 1;
        });
        const fatigueIndex = Object.entries(fatigueIndexMap).map(([month, completions]) => ({ month, completions }));
        const topContentMap: { [key: number]: number } = {};
        analytics.filter(a => a.event_type === 'start').forEach(a => { topContentMap[a.content_id] = (topContentMap[a.content_id] || 0) + 1; });
        const topContent = Object.entries(topContentMap).sort(([,a],[,b]) => b-a).slice(0, 5).map(([id, views]) => ({ name: content.find(c => c.id === parseInt(id))?.title || 'Unknown', views }));
        
        // Compliance
        const complianceTags = [...new Set(content.flatMap(c => c.compliance || []))];
        const controlCoverage = complianceTags.map(tag => {
            const tagContentIds = new Set(content.filter(c => c.compliance?.includes(tag)).map(c => c.id));
            const completed = Array.from(contentCompleted).filter(key => tagContentIds.has(parseInt(key.split('-')[1]))).length;
            const started = Array.from(contentStarted).filter(key => tagContentIds.has(parseInt(key.split('-')[1]))).length;
            return { id: tag, control: tag, rate: started > 0 ? (completed / started) * 100 : 0 };
        });
        const auditReadiness = Math.round(controlCoverage.reduce((acc, curr) => acc + curr.rate, 0) / (controlCoverage.length || 1));
        const alignmentTrendMap: { [key: string]: { completed: number; started: number } } = {};
        analytics.forEach(a => {
            if (complianceContentIds.has(a.content_id)) {
                const date = new Date(a.timestamp);
                const q = `Q${Math.floor(date.getMonth() / 3) + 1} '${String(date.getFullYear()).slice(2)}`;
                if (!alignmentTrendMap[q]) alignmentTrendMap[q] = { completed: 0, started: 0 };
                if (a.event_type === 'start') alignmentTrendMap[q].started++;
                if (a.event_type === 'complete') alignmentTrendMap[q].completed++;
            }
        });
        const alignmentTrend = Object.entries(alignmentTrendMap).map(([q, data]) => ({ q, value: data.started > 0 ? Math.round((data.completed / data.started) * 100) : 0 }));
        
        // ROI
        const cultureGrowthMap: { [key: string]: { totalScore: number, count: number } } = {};
        cyberAnalytics.forEach(ca => {
            const date = new Date(ca.completed_at);
            const q = `Q${Math.floor(date.getMonth() / 3) + 1} '${String(date.getFullYear()).slice(2)}`;
            if(!cultureGrowthMap[q]) cultureGrowthMap[q] = { totalScore: 0, count: 0 };
            cultureGrowthMap[q].totalScore += ca.score;
            cultureGrowthMap[q].count++;
        });
        const cultureGrowth = Object.entries(cultureGrowthMap).map(([q, data]) => ({ q, score: data.count > 0 ? Math.round(data.totalScore / data.count) : 0 }));
        
        return {
            executive: { bii, activeUserCoverageData: [{ name: 'Active', value: activeUserCoverage }, { name: 'Inactive', value: 100 - activeUserCoverage }], avgKnowledgeGain: [{ name: 'Last Q', value: Math.round(avgLastQ) }, { name: 'This Q', value: Math.round(avgThisQ) }], complianceAlignment },
            engagement: { videosWatched, completionRate, avgWatchTime },
            effectiveness: { scoreDistribution },
            behavioral: { departmentalScores, fatigueIndex, topContent },
            compliance: { controlCoverage, auditReadiness, alignmentTrend },
            roi: { cultureGrowth }
        };
    }, [profiles, content, analytics, cyberAnalytics]);

    const handleEvidenceDownload = () => { /* Logic to generate and download CSV */ };
    
    const tabs = ['Executive Summary', 'Engagement', 'Effectiveness', 'Behavioral Intel', 'Compliance', 'ROI', 'Drill-Down', 'Power BI Dashboard'];

    const renderActiveTab = () => {
        const props = {
            data: dashboardData,
            onInsightClick: setInsightModalType,
        };
        return (
            <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
                {activeTab === 'Executive Summary' && <ExecutiveSummaryView {...props} />}
                {activeTab === 'Engagement' && <EngagementView {...props} />}
                {activeTab === 'Effectiveness' && <EffectivenessView {...props} />}
                {activeTab === 'Behavioral Intel' && <BehavioralIntelView {...props} />}
                {activeTab === 'Compliance' && <ComplianceView {...props} onDownload={handleEvidenceDownload} />}
                {activeTab === 'ROI' && <RoiView {...props} />}
                {activeTab === 'Drill-Down' && <DrillDownView content={content} analytics={analytics} cyberAnalytics={cyberAnalytics} />}
                {activeTab === 'Power BI Dashboard' && <PowerBiView organization={organization} />}
            </Suspense>
        );
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen bg-background">Loading CISO Dashboard...</div>;
    }

    return (
        <div className="flex flex-col h-screen bg-background font-sans">
            <style>{` .recharts-tooltip-cursor { stroke: var(--border-color); stroke-dasharray: 3 3; } .recharts-legend-item { font-size: 12px !important; color: var(--text-secondary-color) !important; } `}</style>
            <header className="flex-shrink-0 bg-sidebar/50 backdrop-blur-md border-b border-border flex justify-between items-center px-4 sm:px-6 h-16 sticky top-0 z-10">
                <div>
                    <h1 className="text-xl font-bold text-text-main">CISO Dashboard</h1>
                    <p className="text-sm text-text-secondary">Welcome, {currentUser.name}</p>
                </div>
                <div className="flex items-center gap-2">
                    <ThemeToggleButton theme={theme} toggleTheme={toggleTheme} />
                    <Button variant="danger" size="sm" onClick={onLogout}>Logout</Button>
                </div>
            </header>
            <main className="flex-1 flex flex-col overflow-hidden">
                 <div className="flex-shrink-0 border-b border-border px-4 sm:px-6">
                    <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                        {tabs.map((tab) => (
                            <button key={tab} onClick={() => setActiveTab(tab)}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-main hover:border-border'}`}>
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                    {renderActiveTab()}
                </div>
            </main>
            <InsightModal 
                isOpen={!!insightModalType} 
                onClose={() => setInsightModalType(null)} 
                modalType={insightModalType}
                data={{ xapiStatements, profiles, content, cyberAnalytics, behavioralData: dashboardData.behavioral, complianceData: dashboardData.compliance }}
            />
        </div>
    );
};

export default CisoDashboard;
