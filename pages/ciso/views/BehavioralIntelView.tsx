import React from 'react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import DashboardCard from '../components/DashboardCard';
import CustomTooltip from '../components/CustomTooltip';

const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);

interface BehavioralIntelViewProps {
    data: { behavioral: any };
    onInsightClick: (type: string) => void;
}

const BehavioralIntelView: React.FC<BehavioralIntelViewProps> = ({ data, onInsightClick }) => (
    <DashboardCard 
        title="Behavioral Intelligence" 
        subtitle="Identify and predict human-risk factors" 
        icon={EyeIcon} 
        onInsightClick={() => onInsightClick('Behavioral Intelligence')}
    >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            <div>
                <p className="text-sm font-semibold text-text-secondary mb-1">Departmental Awareness Score</p>
                <ResponsiveContainer width="100%" height={150}>
                     <BarChart data={data.behavioral.departmentalScores} layout="vertical" margin={{ left: 20 }}>
                         <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-secondary-color)', fontSize: 10 }} width={80} axisLine={false} tickLine={false}/>
                         <XAxis type="number" hide />
                         <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--sidebar-accent-color)' }}/>
                         <Bar dataKey="score" fill="#f59e0b" barSize={15} name="Average Score %"/>
                     </BarChart>
                 </ResponsiveContainer>
            </div>
             <div>
                <p className="text-sm font-semibold text-text-secondary mb-1">Top Viewed Content</p>
                <ul className="text-xs list-decimal pl-4 space-y-1 text-text-main h-[150px] overflow-y-auto">
                    {data.behavioral.topContent.map((c: any) => <li key={c.name}>{c.name} ({c.views} views)</li>)}
                </ul>
            </div>
            <div className="md:col-span-2">
                 <p className="text-sm font-semibold text-text-secondary mb-1">Awareness Fatigue Index (Completions/Month)</p>
                 <ResponsiveContainer width="100%" height={120}>
                     <LineChart data={data.behavioral.fatigueIndex}>
                        <XAxis dataKey="month" tick={{ fill: 'var(--text-secondary-color)', fontSize: 10 }} />
                        <YAxis tick={{ fill: 'var(--text-secondary-color)', fontSize: 10 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="completions" stroke="#ef4444" />
                     </LineChart>
                 </ResponsiveContainer>
            </div>
        </div>
    </DashboardCard>
);

export default BehavioralIntelView;
