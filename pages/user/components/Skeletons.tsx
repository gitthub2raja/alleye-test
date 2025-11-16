import React from 'react';
import Card from '../../../components/common/Card';

export const SkeletonLoader: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`bg-sidebar-accent animate-pulse rounded-md ${className}`} />
);

export const SkeletonCard = () => (
    <Card className="!p-0 flex flex-col group overflow-hidden">
        <SkeletonLoader className="h-40 w-full" />
        <div className="p-4">
            <SkeletonLoader className="h-4 w-3/4 mb-2" />
            <SkeletonLoader className="h-3 w-1/2" />
        </div>
    </Card>
);
