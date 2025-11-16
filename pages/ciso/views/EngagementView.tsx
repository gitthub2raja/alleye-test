import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import DashboardCard from '../components/DashboardCard';
import CustomTooltip from '../components/CustomTooltip';

const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5zM3.75 19.125a9.094 9.094 0 018.25-3.469 9.094 9.094 0 018.25 3.469m-16.5 0a3 3 0 01-3-3V16.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-3.442 1.42l-1.105-4.423a1.875 1.875 0 00-3.442-1.42H3.75z" /></svg>
);

interface EngagementViewProps {
    data: { engagement: any };
    onInsightClick: (type: string) => void;
}

const EngagementView: React.FC<EngagementViewProps> = ({ data, onInsightClick }) => (
    <DashboardCard title="Engagement Analytics" subtitle="Track participation and consistency" icon={UsersIcon} onInsightClick={() => onInsightClick('Engagement')}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            <div className="h-48">
                <p className="text-sm font-semibold text-text-secondary mb-1">Total Videos Watched</p>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.engagement.videosWatched}>
                        <XAxis dataKey="month" tick={{ fill: 'var(--text-secondary-color)', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--sidebar-accent-color)' }}/>
                        <Bar dataKey="count" fill="var(--secondary-color)" barSize={10} radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="h-48">
                <p className="text-sm font-semibold text-text-secondary mb-1">Top 5 Module Completion Rates</p>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.engagement.completionRate} layout="vertical" margin={{ left: 20 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" tick={{ fill: 'var(--text-secondary-color)', fontSize: 10 }} width={80} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--sidebar-accent-color)' }}/>
                        <Bar dataKey="rate" fill="var(--highlight-color)" barSize={15} name="Completion Rate %" radius={[0, 4, 4, 0]}/>
                    </BarChart>
                </ResponsiveContainer>
            </div>
             <div className="md:col-span-2">
                <p className="text-sm font-semibold text-text-secondary mb-1">Avg. Watch Time Heatmap</p>
                <div className="flex flex-wrap gap-2 text-xs">
                    {data.engagement.avgWatchTime.map((item: any) => (
                        <div key={item.module} className="p-2 rounded text-black" style={{ backgroundColor: `rgba(245, 158, 11, ${item.time / 200})` }}>
                            {item.module}: {item.time}s
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </DashboardCard>
);

export default EngagementView;
