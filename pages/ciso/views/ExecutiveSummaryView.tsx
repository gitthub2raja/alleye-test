import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Tooltip } from 'recharts';
import DashboardCard from '../components/DashboardCard';
import CustomTooltip from '../components/CustomTooltip';
import Gauge from '../components/Gauge';

const ShieldCheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286z" />
  </svg>
);

const COLORS = ['var(--highlight-color)', 'var(--sidebar-accent-color)'];

interface ExecutiveSummaryViewProps {
    data: { executive: any };
    onInsightClick: (type: string) => void;
}

const ExecutiveSummaryView: React.FC<ExecutiveSummaryViewProps> = ({ data, onInsightClick }) => (
    <DashboardCard title="Executive Summary" subtitle="One-glance view of organizational awareness health" icon={ShieldCheckIcon} onInsightClick={() => onInsightClick('Executive Summary')}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full">
            <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-sidebar-accent">
                <div className="w-full h-24">
                   <Gauge value={data.executive.bii} label="Breach Insight Index" />
                </div>
            </div>
            <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-sidebar-accent">
                <ResponsiveContainer width="100%" height={100}>
                    <PieChart>
                        <Pie data={data.executive.activeUserCoverageData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={30} outerRadius={45} stroke="none">
                            {data.executive.activeUserCoverageData.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
                <p className="text-3xl font-bold text-highlight -mt-4">{data.executive.activeUserCoverageData[0]?.value}%</p>
                <p className="text-xs text-text-secondary">Active User Coverage</p>
            </div>
            <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-sidebar-accent">
                 <ResponsiveContainer width="100%" height={80}>
                    <LineChart data={data.executive.avgKnowledgeGain} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <Line type="monotone" dataKey="value" stroke="var(--secondary-color)" strokeWidth={2} />
                        <Tooltip content={<CustomTooltip />} />
                    </LineChart>
                </ResponsiveContainer>
                 <p className="text-3xl font-bold text-secondary">+{data.executive.avgKnowledgeGain[1]?.value}%</p>
                <p className="text-xs text-text-secondary">Avg. Score vs Last Q</p>
            </div>
            <div className="flex flex-col justify-center p-4 rounded-lg bg-sidebar-accent">
                 <p className="text-3xl font-bold text-blue-400">{data.executive.complianceAlignment}%</p>
                <p className="text-xs text-text-secondary mb-2">Compliance Alignment (ISO, SOC2)</p>
                <div className="w-full bg-border rounded-full h-2.5">
                    <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${data.executive.complianceAlignment}%` }}></div>
                </div>
            </div>
        </div>
    </DashboardCard>
);

export default ExecutiveSummaryView;
