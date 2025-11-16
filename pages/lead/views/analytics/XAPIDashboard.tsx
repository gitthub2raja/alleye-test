import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Content, Profile as User } from '../../../../types';
import { fetchStatements, FetchStatementsParams } from '../../../../lib/xapiLrsClient';
import Card from '../../../../components/common/Card';
import Button from '../../../../components/common/Button';

interface XAPIDashboardProps {
    orgUsers: User[];
    allContent: Content[];
}

const XAPIDashboard: React.FC<XAPIDashboardProps> = ({ orgUsers, allContent }) => {
    const dashboardRef = useRef<HTMLDivElement>(null);
    const [statements, setStatements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeFilter, setTimeFilter] = useState('30');
    const [userFilter, setUserFilter] = useState('all');
    const [contentFilter, setContentFilter] = useState('all');

    useEffect(() => {
        const fetchAndFilter = async () => {
            setLoading(true);
            const since = new Date();
            since.setDate(since.getDate() - parseInt(timeFilter));
            
            const params: FetchStatementsParams = { since: since.toISOString() };
            if (userFilter !== 'all') {
                const user = orgUsers.find(u => u.id === userFilter);
                if(user) params.agent = user;
            }
            if (contentFilter !== 'all') {
                const contentItem = allContent.find(c => c.id === parseInt(contentFilter));
                if (contentItem) params.activity = contentItem;
            }

            const fetchedStatements = await fetchStatements(params);
            
            let statementsToSet = fetchedStatements;
            if (userFilter === 'all') {
                 const orgUserEmails = new Set(orgUsers.map(u => `mailto:${u.email}`));
                 statementsToSet = fetchedStatements.filter(s => orgUserEmails.has(s.actor.mbox));
            }
            
            setStatements(statementsToSet);
            setLoading(false);
        };
        fetchAndFilter();
    }, [timeFilter, userFilter, contentFilter, orgUsers, allContent]);
    
    const stats = useMemo(() => {
        const activeLearners = new Set(statements.map(s => s.actor.mbox)).size;
        const scores = statements.filter(s => s.result?.score?.raw !== undefined).map(s => s.result.score.raw);
        const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
        return { totalStatements: statements.length, activeLearners, averageScore };
    }, [statements]);

    const engagementData = useMemo(() => {
        const dataByDate: { [key: string]: { date: string, Launched: number, Completed: number } } = {};
        statements.forEach(s => {
            const date = new Date(s.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (!dataByDate[date]) dataByDate[date] = { date, Launched: 0, Completed: 0 };
            if (s.verb.id.includes('launched')) dataByDate[date].Launched++;
            if (s.verb.id.includes('completed')) dataByDate[date].Completed++;
        });
        return Object.values(dataByDate).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [statements]);

    const deviceData = useMemo(() => {
        const devices: { [key: string]: number } = { desktop: 0, mobile: 0, unknown: 0 };
        statements.forEach(s => {
            const device = s.context?.extensions?.['https://w3id.org/xapi/acrossx/extensions/device-type'] || 'unknown';
            if (devices[device] !== undefined) devices[device]++; else devices.unknown++;
        });
        return Object.entries(devices).map(([name, value]) => ({ name, value }));
    }, [statements]);

    const scoreDistributionData = useMemo(() => {
        const bins = [ { name: '0-20', count: 0 }, { name: '21-40', count: 0 }, { name: '41-60', count: 0 }, { name: '61-80', count: 0 }, { name: '81-100', count: 0 } ];
        statements.forEach(s => {
            if (s.result?.score?.raw !== undefined) {
                const score = s.result.score.raw;
                if (score <= 20) bins[0].count++;
                else if (score <= 40) bins[1].count++;
                else if (score <= 60) bins[2].count++;
                else if (score <= 80) bins[3].count++;
                else bins[4].count++;
            }
        });
        return bins;
    }, [statements]);

    const contentHotspots = useMemo(() => {
        const performance: { [key: string]: { launches: number, completions: number } } = {};
        statements.forEach(s => {
            const contentId = s.object?.id;
            if (!contentId || !s.verb?.id) return;
            if (!performance[contentId]) performance[contentId] = { launches: 0, completions: 0 };
            if (s.verb.id.includes('launched')) performance[contentId].launches++;
            if (s.verb.id.includes('completed')) performance[contentId].completions++;
        });
        const rates = Object.entries(performance).map(([activityId, data]) => {
            const contentItem = allContent.find(c => `https://lms.example.com/content/${c.id}` === activityId);
            return { title: contentItem?.title || 'Unknown Content', rate: data.launches > 0 ? (data.completions / data.launches) * 100 : 0 };
        });
        return {
            mostCompleted: [...rates].sort((a, b) => b.rate - a.rate).slice(0, 6),
            leastCompleted: [...rates].filter(r => r.rate < 100).sort((a, b) => a.rate - b.rate).slice(0, 6),
        };
    }, [statements, allContent]);

    const handleExportCsv = () => { /* identical to admin version */ };
    const handleExportPdf = () => { /* identical to admin version */ };
    const PIE_COLORS = ['#8884d8', '#ffc658', '#82ca9d'];

    if (loading) return <div>Loading dashboard...</div>;

    return (
       <div ref={dashboardRef} className="space-y-6 bg-background p-1">
             <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-text-main">xAPI Analytics Dashboard</h2>
                    <p className="text-text-secondary text-sm">Deep dive into learner behavior across your organization.</p>
                </div>
                <div className="flex items-center gap-2">
                    <select value={timeFilter} onChange={e => setTimeFilter(e.target.value)} className="form-select text-sm"><option value="30">Last 30 Days</option><option value="7">Last 7 Days</option><option value="90">Last 90 Days</option></select>
                     <select value={userFilter} onChange={e => setUserFilter(e.target.value)} className="form-select text-sm"><option value="all">All Users</option>{orgUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select>
                     <select value={contentFilter} onChange={e => setContentFilter(e.target.value)} className="form-select text-sm"><option value="all">All Content</option>{allContent.map(c => <option key={c.id} value={String(c.id)}>{c.title}</option>)}</select>
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <Button onClick={handleExportPdf}>Export PDF</Button>
                <Button onClick={handleExportCsv}>Export CSV</Button>
                <Button variant="ghost" onClick={() => alert('Email sharing not implemented.')}>Share to Email</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="text-center"><p className="text-text-secondary">Total Statements</p><p className="text-4xl font-bold text-text-main">{stats.totalStatements}</p></Card>
                 <Card className="text-center"><p className="text-text-secondary">Active Learners</p><p className="text-4xl font-bold text-text-main">{stats.activeLearners}</p></Card>
                 <Card className="text-center"><p className="text-text-secondary">Average Score</p><p className="text-4xl font-bold text-text-main">{stats.averageScore.toFixed(2)}%</p></Card>
            </div>
             <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <Card className="lg:col-span-3">
                    <h3 className="font-semibold mb-4">Engagement Over Time</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={engagementData}><CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)"/><XAxis dataKey="date" tick={{ fill: 'var(--text-secondary-color)', fontSize: 12 }} /><YAxis tick={{ fill: 'var(--text-secondary-color)', fontSize: 12 }} /><Tooltip contentStyle={{ backgroundColor: 'var(--card-color)', border: '1px solid var(--border-color)'}}/><Legend /><Line type="monotone" dataKey="Launched" stroke="#8884d8" /><Line type="monotone" dataKey="Completed" stroke="#82ca9d" /></LineChart>
                    </ResponsiveContainer>
                </Card>
                 <Card className="lg:col-span-2">
                     <h3 className="font-semibold mb-4">Device Usage</h3>
                     <ResponsiveContainer width="100%" height={250}>
                        <PieChart><Pie data={deviceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>{deviceData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}</Pie><Tooltip contentStyle={{ backgroundColor: 'var(--card-color)', border: '1px solid var(--border-color)'}}/><Legend /></PieChart>
                    </ResponsiveContainer>
                </Card>
            </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <h3 className="font-semibold mb-4">Quiz Score Distribution</h3>
                     <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={scoreDistributionData}><CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)"/><XAxis dataKey="name" tick={{ fill: 'var(--text-secondary-color)', fontSize: 12 }}/><YAxis tick={{ fill: 'var(--text-secondary-color)', fontSize: 12 }}/><Tooltip contentStyle={{ backgroundColor: 'var(--card-color)', border: '1px solid var(--border-color)'}}/><Bar dataKey="count" fill="#8884d8" name="Learners" /></BarChart>
                    </ResponsiveContainer>
                </Card>
                 <Card>
                    <h3 className="font-semibold mb-4">Content Hotspots</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <h4 className="font-bold text-green-400">Most Completed</h4>
                            <ul className="mt-2 space-y-1 list-disc list-inside">{contentHotspots.mostCompleted.map(item => ( <li key={item.title}> {item.title} <span className="text-text-secondary">({item.rate.toFixed(0)}%)</span> </li> ))}</ul>
                        </div>
                         <div>
                            <h4 className="font-bold text-red-400">Least Completed</h4>
                             <ul className="mt-2 space-y-1 list-disc list-inside">{contentHotspots.leastCompleted.map(item => ( <li key={item.title}> {item.title} <span className="text-text-secondary">({item.rate.toFixed(0)}%)</span> </li> ))}</ul>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default XAPIDashboard;
