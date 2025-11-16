import React, { useEffect, useState } from 'react';
import { Content, Profile as User } from '../../../../types';
import { fetchStatements } from '../../../../lib/xapiLrsClient';
import Button from '../../../../components/common/Button';
import DataTable from '../../../../components/common/DataTable';

interface XapiAnalyticsFeedProps {
    allUsers: User[];
    allContent: Content[];
}

const XapiAnalyticsFeed: React.FC<XapiAnalyticsFeedProps> = ({ allUsers, allContent }) => {
    const [statements, setStatements] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({ userId: 'all', contentId: 'all' });

    useEffect(() => {
        const fetchAllStatements = async () => {
            setLoading(true);
            let agent, activity;
            if (filters.userId !== 'all') {
                agent = allUsers.find(u => u.id === filters.userId);
            }
            if (filters.contentId !== 'all') {
                activity = allContent.find(c => c.id === parseInt(filters.contentId));
            }
            const fetched = await fetchStatements({ agent, activity });
            setStatements(fetched);
            setLoading(false);
        };
        fetchAllStatements();
    }, [filters, allUsers, allContent]);
    
    const handleExportCsv = () => {
        if (statements.length === 0) {
            alert("No data to export.");
            return;
        }
        const headers = ['Timestamp', 'Actor Name', 'Actor Email', 'Verb', 'Activity Name', 'Activity ID', 'Success', 'Score', 'Response', 'Duration'];
        const csvRows = [headers.join(',')];
        for (const s of statements) {
            const row = [ `"${new Date(s.timestamp).toLocaleString()}"`, `"${s.actor.name || ''}"`, `"${s.actor.mbox || ''}"`, `"${s.verb.display['en-US'] || s.verb.id}"`, `"${s.object.definition?.name?.['en-US'] || ''}"`, `"${s.object.id}"`, `"${s.result?.success ?? 'N/A'}"`, `"${s.result?.score?.raw ?? 'N/A'}"`, `"${s.result?.response ?? ''}"`, `"${s.result?.duration ?? 'N/A'}"` ];
            csvRows.push(row.join(','));
        }
        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'xapi_report.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const columns = [
        { key: 'actor', header: 'User', render: (s: any) => s.actor.name || s.actor.mbox },
        { key: 'verb', header: 'Action', render: (s: any) => s.verb.display['en-US'] },
        { key: 'object', header: 'Object', render: (s: any) => s.object.definition?.name?.['en-US'] || s.object.id },
        { key: 'timestamp', header: 'Timestamp', render: (s: any) => new Date(s.timestamp).toLocaleString() },
    ];
    
    return (
         <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="flex gap-4">
                    <select value={filters.userId} onChange={e => setFilters(p => ({...p, userId: e.target.value}))} className="form-select">
                        <option value="all">All Users</option>
                        {allUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                    <select value={filters.contentId} onChange={e => setFilters(p => ({...p, contentId: e.target.value}))} className="form-select">
                        <option value="all">All Content</option>
                        {allContent.map(c => <option key={c.id} value={String(c.id)}>{c.title}</option>)}
                    </select>
                </div>
                <Button onClick={handleExportCsv}>Export CSV</Button>
            </div>
            {loading ? <p>Loading LRS data...</p> : (
                <DataTable<any>
                    columns={columns}
                    data={statements.map(s => ({...s, id: s.id || Math.random().toString()}))}
                />
            )}
        </div>
    )
}

export default XapiAnalyticsFeed;
