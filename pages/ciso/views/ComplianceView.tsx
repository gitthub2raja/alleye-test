import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts';
import DashboardCard from '../components/DashboardCard';
import CustomTooltip from '../components/CustomTooltip';
import Gauge from '../components/Gauge';
import Button from '../../../components/common/Button';

const ShieldCheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286z" />
  </svg>
);

interface ComplianceViewProps {
    data: { compliance: any };
    onDownload: () => void;
    onInsightClick: (type: string) => void;
}

const ComplianceView: React.FC<ComplianceViewProps> = ({ data, onDownload, onInsightClick }) => (
     <DashboardCard title="Governance & Compliance" subtitle="Demonstrate readiness to auditors and the board" icon={ShieldCheckIcon} onInsightClick={() => onInsightClick('Governance & Compliance')}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            <div>
                <p className="text-sm font-semibold text-text-secondary mb-2">Control Coverage Completion</p>
                <table className="w-full text-xs text-left">
                     <thead className="text-text-secondary uppercase">
                         <tr>
                            <th className="py-1 font-normal">Control</th>
                            <th className="py-1 font-normal text-right">Rate</th>
                         </tr>
                     </thead>
                     <tbody>
                        {data.compliance.controlCoverage.map((item: any) => (
                            <tr key={item.control} className="border-t border-border">
                                <td className="py-1.5 text-text-main">{item.control}</td>
                                <td className="py-1.5 font-semibold text-right text-highlight">{item.rate.toFixed(0)}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <Button variant="secondary" size="sm" className="w-full mt-4" onClick={onDownload}>Download Evidence Pack</Button>
            </div>
            <div className="flex flex-col justify-between">
                 <div className="h-28">
                   <Gauge value={data.compliance.auditReadiness} label="Audit Readiness Score" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-text-secondary mb-1">Quarterly Alignment Trend</p>
                    <ResponsiveContainer width="100%" height={100}>
                         <AreaChart data={data.compliance.alignmentTrend}>
                            <defs>
                                <linearGradient id="colorCompliance" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--secondary-color)" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="var(--secondary-color)" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="q" tick={{ fill: 'var(--text-secondary-color)', fontSize: 10 }} axisLine={false} tickLine={false}/>
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="value" stroke="var(--secondary-color)" fill="url(#colorCompliance)" name="Avg Completion %"/>
                         </AreaChart>
                     </ResponsiveContainer>
                </div>
            </div>
        </div>
     </DashboardCard>
);

export default ComplianceView;
