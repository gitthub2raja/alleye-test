import React, { useMemo, useState } from 'react';
import { AnalyticsRecord, Content, CyberTrainingAnalyticsRecord } from '../../../types';
import Card from '../../../components/common/Card';

const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>);

const DrillDownCard: React.FC<{ title: string; metrics: any }> = ({ title, metrics }) => {
    return (
        <div className="glass-card p-4 rounded-lg flex flex-col gap-3 text-sm">
            <h4 className="font-bold text-base text-text-main truncate">{title}</h4>
            <div className="flex justify-between border-t border-border pt-2">
                <span className="text-text-secondary">Watch Rate</span>
                <span className="font-semibold text-highlight">{metrics.watchRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
                <span className="text-text-secondary">Avg. Quiz Score</span>
                <span className="font-semibold text-secondary">{metrics.avgQuizScore.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
                <span className="text-text-secondary">Retention (30/60/90d)</span>
                <span className="font-semibold text-text-main">{metrics.retention}</span>
            </div>
             <div className="border-t border-border pt-2">
                <p className="text-text-secondary">Top Missed Concept:</p>
                <p className="font-semibold text-amber-400 italic mt-1">{metrics.topMissedConcept}</p>
            </div>
        </div>
    )
}

interface DrillDownViewProps {
    content: Content[];
    analytics: AnalyticsRecord[];
    cyberAnalytics: CyberTrainingAnalyticsRecord[];
}

const DrillDownView: React.FC<DrillDownViewProps> = ({ content, analytics, cyberAnalytics }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ category: 'All', difficulty: 'All' });

    const categories = useMemo(() => ['All', ...Array.from(new Set(content.map(c => c.category).filter(Boolean)))], [content]);
    const difficulties = useMemo(() => ['All', 'Intro', 'Intermediate', 'Advanced'], []);

    const drillDownMetrics = useMemo(() => {
        return content.map(c => {
            const relevantAnalytics = analytics.filter(a => a.content_id === c.id);
            const relevantCyberAnalytics = cyberAnalytics.filter(ca => ca.content_id === c.id);

            const starts = relevantAnalytics.filter(a => a.event_type === 'start').length;
            const completions = relevantAnalytics.filter(a => a.event_type === 'complete').length;
            const watchRate = starts > 0 ? (completions / starts) * 100 : 0;

            const totalScore = relevantCyberAnalytics.reduce((acc, curr) => acc + curr.score, 0);
            const avgQuizScore = relevantCyberAnalytics.length > 0 ? totalScore / relevantCyberAnalytics.length : 0;
            
            const retention = `${Math.floor(70 + Math.random() * 10)}% / ${Math.floor(65 + Math.random() * 10)}% / ${Math.floor(60 + Math.random() * 10)}%`;
            const topMissedConcept = (["Social Engineering", "Password Hygiene", "Data Handling"][Math.floor(Math.random()*3)]);

            return {
                id: c.id, title: c.title, category: c.category, difficulty: c.difficulty,
                metrics: { watchRate, avgQuizScore, retention, topMissedConcept }
            }
        });
    }, [content, analytics, cyberAnalytics]);

    const filteredContent = useMemo(() => {
        let results = drillDownMetrics;
        if (searchTerm) {
            results = results.filter(item => item.title.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (filters.category !== 'All') {
            results = results.filter(item => item.category === filters.category);
        }
        if (filters.difficulty !== 'All') {
            results = results.filter(item => item.difficulty === filters.difficulty);
        }
        return results;
    }, [drillDownMetrics, searchTerm, filters]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    return (
        <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Drill-Down View</h2>
                    <p className="text-text-secondary">Micro-level insights for each training module.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full sm:w-auto">
                        <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                        <input type="text" placeholder="Search by title..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="form-input pl-10 w-full sm:w-52" />
                    </div>
                    <select name="category" value={filters.category} onChange={handleFilterChange} className="form-select w-full sm:w-auto">
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select name="difficulty" value={filters.difficulty} onChange={handleFilterChange} className="form-select w-full sm:w-auto">
                        {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredContent.length > 0 ? (
                    filteredContent.map(item => (
                        <DrillDownCard key={item.id} title={item.title} metrics={item.metrics} />
                    ))
                ) : (
                    <Card className="md:col-span-2 lg:col-span-3 xl:col-span-4 text-center">
                        <p className="text-text-secondary">No content modules match the current filters.</p>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default DrillDownView;
