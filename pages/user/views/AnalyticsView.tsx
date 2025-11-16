
import React, { useEffect, useState, useMemo } from 'react';
import { Profile as User, Content, ContentType } from '../../../types';
import { fetchStatements } from '../../../lib/xapiLrsClient';
import Card from '../../../components/common/Card';
import ActivityLineChart from '../../../components/analytics/ActivityLineChart';
import CompletionRateChart from '../../../components/analytics/CompletionRateChart';
import { ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip } from 'recharts';

// Icons
const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const StarIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.31h5.404a.562.562 0 01.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988h5.404a.563.563 0 00.475-.31l2.125-5.11z" /></svg>);
const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);

// New Stat Card component
const StatCard = ({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) => (
    <Card className="flex items-center p-4">
        <div className="p-3 mr-4 bg-sidebar-accent rounded-lg">{icon}</div>
        <div>
            <p className="text-sm text-text-secondary">{title}</p>
            <p className="text-2xl font-bold text-text-main">{value}</p>
        </div>
    </Card>
);

const CustomRadarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-sidebar p-2 border border-border rounded-md shadow-lg text-xs">
          <p className="font-bold text-text-main">{`${payload[0].payload.subject}`}</p>
          <p style={{ color: payload[0].color || payload[0].fill }}>{`Avg. Score: ${payload[0].value.toFixed(1)}%`}</p>
        </div>
      );
    }
    return null;
};

// New Radar Chart component
const CategoryRadarChart = ({ data }: { data: any[] }) => (
    <Card>
        <h3 className="text-lg font-semibold text-text-main mb-4">Skill Proficiency</h3>
        <div style={{ width: '100%', height: 250 }}>
          {data.length > 2 ? (
            <ResponsiveContainer>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid stroke="var(--border-color)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary-color)', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Score" dataKey="score" stroke="var(--primary-color)" fill="var(--primary-color)" fillOpacity={0.6} />
                    <Tooltip content={<CustomRadarTooltip />} />
                </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-center text-text-secondary text-sm p-4">
                <p>Complete quizzes in at least 3 different categories to see your skill proficiency chart.</p>
            </div>
          )}
        </div>
    </Card>
);

const AnalyticsView: React.FC<{ user: User, allContent: Content[] }> = ({ user, allContent }) => {
    const [statements, setStatements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const data = await fetchStatements({ agent: user, limit: 1000 });
            setStatements(data);
            setLoading(false);
        };
        loadData();
    }, [user]);
    
    const overallStats = useMemo(() => {
        const completedContentIds = new Set(
            Object.entries(user.progress || {})
                .filter(([, p]) => p.status === 'completed')
                .map(([id]) => parseInt(id, 10))
        );

        const scores = Object.values(user.progress || {}).map(p => p.score).filter((s): s is number => s !== undefined && s !== null);
        const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
        
        const totalLearningTime = allContent
            .filter(c => completedContentIds.has(c.id))
            .reduce((sum, c) => sum + (c.duration_sec || 0), 0);
        
        return { 
            completed: completedContentIds.size, 
            avgScore: Math.round(avgScore),
            learningTime: Math.floor(totalLearningTime / 60) // in minutes
        };
    }, [user.progress, allContent]);

    const activityData = useMemo(() => {
        const data: {[date: string]: { date: string, logins: number, completions: number }} = {};
        statements.forEach(s => {
            const date = new Date(s.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (!data[date]) data[date] = { date, logins: 0, completions: 0 };
            if (s.verb.id.includes('launched')) data[date].logins++;
            if (s.verb.id.includes('completed')) data[date].completions++;
        });
        return Object.values(data).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-30);
    }, [statements]);

    const categoryProficiency = useMemo(() => {
        const categories: { [key: string]: { scores: number[], count: number } } = {};
        const quizContentTypes = [ContentType.QUIZ, ContentType.VIDEO_QUIZ, ContentType.CYBER_SECURITY_TRAINING];
        
        allContent.forEach(c => {
            const progress = user.progress?.[c.id];
            if (
                progress?.status === 'completed' && 
                progress.score !== undefined &&
                quizContentTypes.includes(c.type) &&
                c.category
            ) {
                if (!categories[c.category]) {
                    categories[c.category] = { scores: [], count: 0 };
                }
                categories[c.category].scores.push(progress.score);
                categories[c.category].count++;
            }
        });

        return Object.entries(categories)
            .map(([subject, data]) => ({
                subject,
                score: data.scores.reduce((a, b) => a + b, 0) / data.count,
                fullMark: 100,
            }))
            .slice(0, 6); // Limit to 6 for radar chart readability
    }, [user.progress, allContent]);

    const learningFocusData = useMemo(() => {
        return allContent
            .map(c => ({ content: c, progress: user.progress?.[c.id] }))
            .filter(item => item.progress && (item.progress.status === 'in-progress' || item.progress.status === 'completed'))
            .map(item => {
                const { content, progress } = item;
                let value = 0;
                if (progress?.status === 'completed') {
                    value = progress.score !== undefined ? progress.score : 100;
                }
                return {
                    id: content.id,
                    title: content.title,
                    status: progress!.status,
                    value: value,
                    isQuiz: [ContentType.QUIZ, ContentType.VIDEO_QUIZ, ContentType.CYBER_SECURITY_TRAINING].includes(content.type)
                };
            })
            .sort((a, b) => (a.status === 'in-progress' ? -1 : 1) - (b.status === 'in-progress' ? -1 : 1) || b.id - a.id)
            .slice(0, 10);
    }, [user.progress, allContent]);


    if (loading) return <div>Loading your analytics...</div>;

    return (
        <div className="animate-fade-in space-y-6">
            <h1 className="text-3xl font-bold">My Analytics</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Courses Completed" value={overallStats.completed} icon={<CheckCircleIcon className="w-6 h-6 text-green-400" />} />
                <StatCard title="Average Score" value={`${overallStats.avgScore}%`} icon={<StarIcon className="w-6 h-6 text-yellow-400" />} />
                <StatCard title="Total Learning Time" value={`${overallStats.learningTime} min`} icon={<ClockIcon className="w-6 h-6 text-blue-400" />} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <ActivityLineChart data={activityData} title="My Activity (Last 30 entries)" />
                </div>
                <div className="lg:col-span-1">
                    <CategoryRadarChart data={categoryProficiency} />
                </div>
            </div>
            <div>
                <CompletionRateChart data={learningFocusData} title="Learning Focus" />
            </div>
        </div>
    );
};

export default AnalyticsView;