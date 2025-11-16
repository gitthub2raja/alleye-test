import React from 'react';

const InformationCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>);

const DashboardCard: React.FC<{ 
    title: string; 
    subtitle: string; 
    icon: React.FC<React.SVGProps<SVGSVGElement>>; 
    children: React.ReactNode; 
    className?: string; 
    style?: React.CSSProperties, 
    onInsightClick?: () => void 
}> = ({ title, subtitle, icon: Icon, children, className = '', style, onInsightClick }) => (
    <div className={`glass-card p-4 md:p-6 flex flex-col ${className}`} style={style}>
        <div className="flex items-start justify-between mb-4">
            <div>
                <h3 className="text-lg font-semibold text-text-main">{title}</h3>
                <p className="text-xs text-text-secondary">{subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
                {onInsightClick && (
                    <button onClick={onInsightClick} className="p-1 rounded-full text-text-secondary hover:bg-sidebar-accent transition-colors" aria-label="Show detailed insight">
                        <InformationCircleIcon className="w-5 h-5" />
                    </button>
                )}
                <div className="p-2 bg-sidebar-accent rounded-lg">
                    <Icon className="w-5 h-5 text-text-secondary" />
                </div>
            </div>
        </div>
        <div className="flex-grow">{children}</div>
    </div>
);

export default DashboardCard;
