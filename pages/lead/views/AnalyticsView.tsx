import React, { useState } from 'react';
import { AnalyticsRecord, Content, CyberTrainingAnalyticsRecord, Organization, Profile as User } from '../../../types';
import ViewHeader from '../components/ViewHeader';
import XAPIDashboard from './analytics/XAPIDashboard';
import OrgXapiFeed from './analytics/OrgXapiFeed';
import PowerBiDashboard from './analytics/PowerBiDashboard';

interface AnalyticsViewProps {
    teamUsers: User[];
    teamAnalytics: AnalyticsRecord[];
    teamCyberAnalytics: CyberTrainingAnalyticsRecord[];
    allContent: Content[];
    allUsers: User[];
    organization?: Organization;
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ teamUsers, teamAnalytics, teamCyberAnalytics, allContent, allUsers, organization }) => {
    const [activeTab, setActiveTab] = useState('xAPI Dashboard');
    const tabs = ['xAPI Dashboard', 'xAPI Feed', 'Power BI'];

    return (
        <div className="animate-fade-in space-y-8">
            <ViewHeader title="Analytics" subtitle="Track team performance, learning activity, and business intelligence."/>
            
            <div className="flex border-b border-border">
                {tabs.map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-medium ${activeTab === tab ? 'border-b-2 border-primary text-primary' : 'text-text-secondary hover:text-text-main'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="mt-6">
                {activeTab === 'xAPI Dashboard' && <XAPIDashboard orgUsers={allUsers} allContent={allContent} />}
                {activeTab === 'xAPI Feed' && <OrgXapiFeed orgUsers={allUsers} allContent={allContent} />}
                {activeTab === 'Power BI' && <PowerBiDashboard organization={organization} />}
            </div>
        </div>
    );
};

export default AnalyticsView;
