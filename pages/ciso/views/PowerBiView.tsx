import React from 'react';
import { Organization } from '../../../types';
import Card from '../../../components/common/Card';

const ViewHeader: React.FC<{title: string; subtitle?: string;}> = ({ title, subtitle }) => (
    <div className="mb-6 pb-4 border-b border-border">
        <h1 className="text-3xl font-bold text-text-main">{title}</h1>
        {subtitle && <p className="mt-1 text-text-secondary">{subtitle}</p>}
    </div>
);

const PowerBiView: React.FC<{ organization?: Organization }> = ({ organization }) => {
    if (organization?.powerbi_embed_url) {
        return (
            <div className="animate-fade-in">
                <ViewHeader title="Organization Dashboard" subtitle="Live insights from Power BI." />
                <Card className="!p-0 overflow-hidden" style={{ height: 'calc(100vh - 18rem)' }}>
                    <iframe
                        title={organization.name}
                        width="100%"
                        height="100%"
                        src={organization.powerbi_embed_url}
                        frameBorder="0"
                        allowFullScreen={true}
                    ></iframe>
                </Card>
            </div>
        );
    }
    return (
        <div className="animate-fade-in">
            <ViewHeader title="Dashboard" />
            <Card>
                <div className="text-center p-8">
                    <h2 className="text-xl font-bold">Dashboard Not Available</h2>
                    <p className="text-text-secondary mt-2">A Power BI dashboard has not been configured for your organization yet.</p>
                </div>
            </Card>
        </div>
    );
};

export default PowerBiView;
