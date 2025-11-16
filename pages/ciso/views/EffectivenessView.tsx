import React from 'react';
import { ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, BarChart, Bar, XAxis, Tooltip } from 'recharts';
import DashboardCard from '../components/DashboardCard';
import CustomTooltip from '../components/CustomTooltip';

const BeakerIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.21 1.025l-1.3 2.6a1.5 1.5 0 00-2.4 1.825l.875 2.187a1.5 1.5 0 001.442 1.042h5.216a1.5 1.5 0 001.442-1.042l.875-2.187a1.5 1.5 0 00-2.4-1.825l-1.3-2.6a2.25 2.25 0 01-.21-1.025V3.104a2.25 2.25 0 00-3.75 0zM9.75 3.104c-1.35.32-2.45.8-3.375 1.5" /></svg>
);

// Dummy data as some metrics aren't calculable from current schema
const dummyEffectivenessData = {
    scenarioAdaptation: [
        { subject: 'Phishing', A: 90, fullMark: 100 }, { subject: 'Vishing', A: 85, fullMark: 100 },
        { subject: 'Tailgating', A: 75, fullMark: 100 }, { subject: 'Data Leak', A: 80, fullMark: 100 },
        { subject: 'Insider Threat', A: 70, fullMark: 100 }
    ]
};

interface EffectivenessViewProps {
    data: { effectiveness: any };
    onInsightClick: (type: string) => void;
}

const EffectivenessView: React.FC<EffectivenessViewProps> = ({ data, onInsightClick }) => (
    <DashboardCard title="Learning Effectiveness" subtitle="Measure comprehension and retention over time" icon={BeakerIcon} onInsightClick={() => onInsightClick('Learning Effectiveness')}>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            <div>
                 <p className="text-sm font-semibold text-text-secondary mb-1">Scenario Adaptation</p>
                <ResponsiveContainer width="100%" height={200}>
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={dummyEffectivenessData.scenarioAdaptation}>
                        <PolarGrid stroke="var(--border-color)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary-color)', fontSize: 10 }} />
                        <Radar name="Adaptation" dataKey="A" stroke="var(--secondary-color)" fill="var(--secondary-color)" fillOpacity={0.6} />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
            <div>
                 <p className="text-sm font-semibold text-text-secondary mb-1">Score Distribution</p>
                 <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={data.effectiveness.scoreDistribution}>
                        <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary-color)', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--sidebar-accent-color)' }}/>
                        <Bar dataKey="count" fill="var(--highlight-color)" name="Users" radius={[4, 4, 0, 0]}/>
                    </BarChart>
                 </ResponsiveContainer>
            </div>
         </div>
    </DashboardCard>
);

export default EffectivenessView;
