import React from 'react';
import { Organization } from '../../../../types';
import Card from '../../../../components/common/Card';

interface PowerBiDashboardProps {
    organization?: Organization;
}

const PowerBiDashboard: React.FC<PowerBiDashboardProps> = ({ organization }) => {
    if (organization?.powerbi_embed_url) {
        return (
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
        );
    }
    return (
        <Card>
            <div className="text-center p-8">
                <h2 className="text-xl font-bold">Dashboard Not Available</h2>
                <p className="text-text-secondary mt-2">A Power BI dashboard has not been configured for your organization.</p>
            </div>
        </Card>
    );
};

export default PowerBiDashboard;
