// lib/xapiLrsClient.ts
import { Profile as User, Content } from '../types';

// Provided Veracity LRS Credentials
const LRS_ENDPOINT = 'https://all-eye.lrs.io/xapi/';
const LRS_KEY = 'a0cca7c1-6232-4c22-b5c8-fbd803f1584e';
const LRS_SECRET = '3edb879f-215f-4c1e-9bde-40ce04283870';

// Base64 encode the key and secret for the Authorization header
const LRS_AUTH = 'Basic ' + btoa(LRS_KEY + ':' + LRS_SECRET);

export interface FetchStatementsParams {
    agent?: User;
    activity?: Content;
    since?: string; // ISO 8601 timestamp
    until?: string; // ISO 8601 timestamp
    limit?: number;
}

/**
 * Fetches xAPI statements from the Veracity LRS.
 * @param params - Filtering parameters for the LRS query.
 * @returns A promise that resolves to an array of xAPI statement objects.
 */
export async function fetchStatements(params: FetchStatementsParams): Promise<any[]> {
    const query = new URLSearchParams();

    // The LRS expects a JSON object for the 'agent' parameter.
    if (params.agent) {
        query.append('agent', JSON.stringify({
            objectType: 'Agent',
            mbox: `mailto:${params.agent.email}`
        }));
    }
    
    // The LRS expects a URI for the 'activity' parameter.
    if (params.activity) {
        query.append('activity', `https://lms.example.com/content/${params.activity.id}`);
    }

    if (params.since) query.append('since', params.since);
    if (params.until) query.append('until', params.until);
    
    // Set a reasonable limit to avoid fetching excessive data in a single request.
    query.append('limit', (params.limit || 1000).toString());
    query.append('ascending', 'false'); // Fetch newest first for timeline consistency

    const url = `${LRS_ENDPOINT}statements?${query.toString()}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-Experience-API-Version': '1.0.3',
                'Content-Type': 'application/json',
                'Authorization': LRS_AUTH,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to fetch xAPI statements:', response.status, errorText);
            throw new Error(`LRS request failed with status ${response.status}`);
        }

        const data = await response.json();
        return data.statements || [];
    } catch (error) {
        console.error('Error fetching from Veracity LRS:', error);
        // Return an empty array on error to prevent the dashboard from crashing.
        return [];
    }
}
