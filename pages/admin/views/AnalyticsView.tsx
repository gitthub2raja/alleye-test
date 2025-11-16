import React, { useState } from 'react';
import { AnalyticsRecord, Content, CyberTrainingAnalyticsRecord, Organization, Profile as User } from '../../../types';
import ViewHeader from '../components/ViewHeader';
import XAPIDashboard from './analytics/XAPIDashboard';
import XapiAnalyticsFeed from './analytics/XapiAnalyticsFeed';
import PowerBiReports from './analytics/PowerBiReports';

interface AnalyticsViewProps {
    analytics: AnalyticsRecord[];
    cyberAnalytics: CyberTrainingAnalyticsRecord[];
    content: Content[];
    organizations: Organization[];
    users: User[];
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ analytics, cyberAnalytics, content, organizations, users }) => {
    const [activeTab, setActiveTab] = useState('xAPI Dashboard');
    const tabs = ['xAPI Dashboard', 'xAPI Feed', 'Power BI'];

    return (
        <div className="animate-fade-in space-y-8">
            <ViewHeader title="Analytics" subtitle="Deep dive into platform, learning, and business intelligence data."/>
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
                {activeTab === 'xAPI Dashboard' && <XAPIDashboard users={users} content={content} />}
                {activeTab === 'xAPI Feed' && <XapiAnalyticsFeed allUsers={users} allContent={content} />}
                {activeTab === 'Power BI' && <PowerBiReports organizations={organizations} />}
            </div>
        </div>
    );
};

export default AnalyticsView;
