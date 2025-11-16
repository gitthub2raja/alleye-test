import React from 'react';

const ViewHeader: React.FC<{title: string; subtitle?: string; children?: React.ReactNode}> = ({ title, subtitle, children }) => (
    <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 pb-4 border-b border-border gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-main">{title}</h1>
          {subtitle && <p className="mt-1 text-text-secondary">{subtitle}</p>}
        </div>
        <div className="flex items-center space-x-2">
            {children}
        </div>
    </div>
);

export default ViewHeader;
