import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Gauge: React.FC<{ value: number; label: string }> = ({ value, label }) => {
    const endAngle = 90 - (value / 100) * 180;
    const color = value > 80 ? 'var(--highlight-color)' : value > 60 ? '#f59e0b' : '#ef4444';
    
    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                    <Pie 
                        data={[{ value: 100 }]} 
                        dataKey="value" 
                        startAngle={90} 
                        endAngle={-90} 
                        innerRadius="70%" 
                        outerRadius="100%" 
                        cy="100%" 
                        isAnimationActive={false} 
                        stroke="none"
                    >
                        <Cell fill="var(--sidebar-accent-color)" />
                    </Pie>
                    <Pie 
                        data={[{ value }]} 
                        dataKey="value" 
                        startAngle={90} 
                        endAngle={endAngle} 
                        innerRadius="70%" 
                        outerRadius="100%" 
                        cy="100%" 
                        cornerRadius={10} 
                        isAnimationActive={true} 
                        stroke="none"
                    >
                        <Cell fill={color} />
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute bottom-[-10%] text-center">
                <span className="text-3xl font-bold" style={{ color }}>{value}</span>
                <p className="text-xs text-text-secondary mt-1">{label}</p>
            </div>
        </div>
    );
};

export default Gauge;
