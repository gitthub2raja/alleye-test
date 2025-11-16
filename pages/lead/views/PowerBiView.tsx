import React from 'react';
import { Organization } from '../../../types';
import ViewHeader from '../components/ViewHeader';
import Card from '../../../components/common/Card';

interface PowerBiViewProps {
    organization?: Organization;
}

const PowerBiView: React.FC<PowerBiViewProps> = ({ organization }) => {
    if (organization?.powerbi_embed_url) {
        return (
            <div className="animate-fade-in">
                <ViewHeader title="Organization Dashboard" subtitle="Live insights from Power BI." />
                <Card className="!p-0 overflow-hidden" style={{ height: 'calc(100vh - 12rem)' }}>
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
