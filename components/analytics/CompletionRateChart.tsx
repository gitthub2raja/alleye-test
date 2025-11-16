
import React from 'react';
import Card from '../common/Card';
import { ContentType } from '../../../types';

interface ChartData {
  id: number;
  title: string;
  status: 'not-started' | 'in-progress' | 'completed';
  value: number; // For progress bar
  isQuiz: boolean;
}

interface CompletionRateChartProps {
    data: ChartData[];
    title: string;
}

const CompletionRateChart: React.FC<CompletionRateChartProps> = ({ data, title }) => {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-text-main mb-4">{title}</h3>
      <div className="max-h-[350px] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {data.length > 0 ? data.map(item => {
            const isCompleted = item.status === 'completed';
            const isInProgress = item.status === 'in-progress';
            let colorClass: string;
            
            if (isCompleted) {
                if (item.isQuiz) {
                    colorClass = item.value >= 70 ? 'bg-green-500' : 'bg-orange-500';
                } else {
                    colorClass = 'bg-green-500';
                }
            } else {
                colorClass = 'bg-yellow-500';
            }

            return (
                <div key={item.id}>
                    <div className="flex justify-between items-center mb-1 text-sm">
                        <span className="font-semibold text-text-main truncate pr-4">{item.title}</span>
                        <span className={`font-mono font-semibold ${isCompleted ? 'text-text-main' : 'text-yellow-400'}`}>
                            {isCompleted ? (item.isQuiz ? `${item.value}%` : 'Done') : 'In Progress'}
                        </span>
                    </div>
                    <div className="w-full bg-sidebar rounded-full h-2">
                        <div 
                            className={`h-2 rounded-full transition-all duration-300 ${colorClass}`}
                            style={{ width: `${isInProgress ? 50 : item.value}%` }}
                        ></div>
                    </div>
                </div>
            )
        }) : (
            <div className="flex items-center justify-center h-full min-h-[200px]">
              <p className="text-text-secondary text-center">No learning activity to display yet.</p>
            </div>
        )}
      </div>
    </Card>
  );
};

export default CompletionRateChart;