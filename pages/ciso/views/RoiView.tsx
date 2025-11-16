import React from 'react';
import { ResponsiveContainer, ComposedChart, Bar, Line, ScatterChart, Scatter, LineChart, XAxis, YAxis, Tooltip } from 'recharts';
import DashboardCard from '../components/DashboardCard';
import CustomTooltip from '../components/CustomTooltip';

const CurrencyDollarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);

// Dummy data as some metrics aren't calculable from current schema
const dummyRoiData = {
    awarenessROI: [
        { q: 'Q1', cost: 50, savings: 30 }, { q: 'Q2', cost: 55, savings: 45 },
        { q: 'Q3', cost: 60, savings: 70 }, { q: 'Q4', cost: 65, savings: 90 }
    ],
    incidentReduction: [
        { maturity: 65, incidents: 12 }, { maturity: 72, incidents: 10 },
        { maturity: 80, incidents: 7 }, { maturity: 88, incidents: 4 }
    ]
};

interface RoiViewProps {
    data: { roi: any };
    onInsightClick: (type: string) => void;
}

const RoiView: React.FC<RoiViewProps> = ({ data, onInsightClick }) => (
    <DashboardCard title="ROI & Cultural Trend" subtitle="Tie awareness to business outcomes" icon={CurrencyDollarIcon} onInsightClick={() => onInsightClick('ROI')}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
             <div className="h-48">
                <p className="text-sm font-semibold text-text-secondary mb-1">Awareness ROI (in thousands)</p>
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={dummyRoiData.awarenessROI}>
                        <XAxis dataKey="q" tick={{ fill: 'var(--text-secondary-color)', fontSize: 10 }} />
                        <YAxis tick={{ fill: 'var(--text-secondary-color)', fontSize: 10 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="cost" barSize={20} fill="#ef4444" name="Cost" />
                        <Line type="monotone" dataKey="savings" stroke="var(--highlight-color)" name="Savings" />
                    </ComposedChart>
                 </ResponsiveContainer>
             </div>
             <div className="h-48">
                <p className="text-sm font-semibold text-text-secondary mb-1">Culture Growth Trend (Avg Score)</p>
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.roi.cultureGrowth}>
                        <XAxis dataKey="q" tick={{ fill: 'var(--text-secondary-color)', fontSize: 10 }} />
                        <YAxis tick={{ fill: 'var(--text-secondary-color)', fontSize: 10 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="score" stroke="#3b82f6" name="Avg Score %"/>
                    </LineChart>
                 </ResponsiveContainer>
             </div>
             <div className="h-48">
                <p className="text-sm font-semibold text-text-secondary mb-1">Incident Reduction Correlation</p>
                 <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                        <XAxis type="number" dataKey="maturity" name="Maturity" unit="%" tick={{ fill: 'var(--text-secondary-color)', fontSize: 10 }} />
                        <YAxis type="number" dataKey="incidents" name="Incidents" tick={{ fill: 'var(--text-secondary-color)', fontSize: 10 }} />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                        <Scatter name="Correlation" data={dummyRoiData.incidentReduction} fill="#f97316" />
                    </ScatterChart>
                 </ResponsiveContainer>
             </div>
        </div>
    </DashboardCard>
);

export default RoiView;
