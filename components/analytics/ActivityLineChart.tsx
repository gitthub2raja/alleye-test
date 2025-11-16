
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../common/Card';

interface ChartData {
  date: string;
  logins: number;
  completions: number;
}
interface ActivityLineChartProps {
    data: ChartData[];
    title: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-sidebar p-2 border border-border rounded-md shadow-lg text-xs">
        <p className="font-bold text-text-main">{label}</p>
        {payload.map((pld: any, index: number) => (
          <p key={index} style={{ color: pld.stroke }}>
            {`${pld.name}: ${pld.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};


const ActivityLineChart: React.FC<ActivityLineChartProps> = ({ data, title }) => {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-text-main mb-4">{title}</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorLogins" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorCompletions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis dataKey="date" tick={{ fill: 'var(--text-secondary-color)', fontSize: 12 }} />
            <YAxis tick={{ fill: 'var(--text-secondary-color)', fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '14px' }} />
            <Area type="monotone" dataKey="logins" name="Engagements" stroke="#8884d8" fillOpacity={1} fill="url(#colorLogins)" />
            <Area type="monotone" dataKey="completions" name="Completions" stroke="#82ca9d" fillOpacity={1} fill="url(#colorCompletions)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default ActivityLineChart;