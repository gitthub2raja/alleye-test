import React, { useEffect, useState } from 'react';
import { Content, Profile as User } from '../../../../types';
import { fetchStatements } from '../../../../lib/xapiLrsClient';
import Button from '../../../../components/common/Button';
import DataTable from '../../../../components/common/DataTable';

interface OrgXapiFeedProps {
    orgUsers: User[];
    allContent: Content[];
}

const OrgXapiFeed: React.FC<OrgXapiFeedProps> = ({ orgUsers, allContent }) => {
    const [statements, setStatements] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        const fetchOrgStatements = async () => {
            setLoading(true);
            const allFetched = await fetchStatements({});
            const orgUserEmails = new Set(orgUsers.map(u => `mailto:${u.email}`));
            const orgStatements = allFetched.filter(s => orgUserEmails.has(s.actor.mbox));
            setStatements(orgStatements);
            setLoading(false);
        };
        fetchOrgStatements();
    }, [orgUsers]);

    const handleExportCsv = () => {
        if (statements.length === 0) {
            alert("No data to export.");
            return;
        }
        const headers = ['Timestamp', 'Actor Name', 'Actor Email', 'Verb', 'Activity Name', 'Activity ID', 'Success', 'Score', 'Response', 'Duration'];
        const csvRows = [headers.join(',')];

        for (const s of statements) {
            const row = [ `"${new Date(s.timestamp).toLocaleString()}"`, `"${s.actor.name || ''}"`, `"${s.actor.mbox || ''}"`, `"${s.verb.display['en-US'] || s.verb.id}"`, `"${s.object.definition.name['en-US'] || ''}"`, `"${s.object.id}"`, `"${s.result?.success ?? 'N/A'}"`, `"${s.result?.score?.raw ?? 'N/A'}"`, `"${s.result?.response ?? ''}"`, `"${s.result?.duration ?? 'N/A'}"` ];
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

    const statementColumns = [
        { key: 'actor', header: 'User', render: (s: any) => s.actor.name || s.actor.mbox },
        { key: 'verb', header: 'Action', render: (s: any) => s.verb.display['en-US'] },
        { key: 'object', header: 'Object', render: (s: any) => s.object.definition.name['en-US'] },
        { key: 'timestamp', header: 'Timestamp', render: (s: any) => new Date(s.timestamp).toLocaleString() },
    ];
    
    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={handleExportCsv}>Export CSV</Button>
            </div>
            {loading ? <p>Loading LRS data...</p> : (
                <DataTable columns={statementColumns} data={statements.map(s => ({...s, id: s.id || Math.random()}))} />
            )}
        </div>
    );
};

export default OrgXapiFeed;
