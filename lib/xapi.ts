import { Profile as User, Content, NewsItem, QuizQuestion } from '../types';
import { v4 as uuidv4 } from 'uuid';

// --- LRS Configuration ---
const LRS_ENDPOINT = 'https://all-eye.lrs.io/xapi/';
const LRS_KEY = 'a0cca7c1-6232-4c22-b5c8-fbd803f1584e';
const LRS_SECRET = '3edb879f-215f-4c1e-9bde-40ce04283870';
const LRS_AUTH = 'Basic ' + btoa(LRS_KEY + ':' + LRS_SECRET);

// --- Session and Context Management ---
let sessionID = uuidv4();

// Function to detect device type
const getDeviceType = () => {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return "tablet";
    }
    if (/Mobile|iP(hone|od)|Android|Bada|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/i.test(ua)) {
        return "mobile";
    }
    return "desktop";
};

// Function to get browser info
const getBrowserInfo = () => {
    const ua = navigator.userAgent;
    let tem;
    let M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
        return { name: 'IE', version: (tem[1] || '') };
    }
    if (M[1] === 'Chrome') {
        tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
        if (tem != null) return { name: tem[1].replace('OPR', 'Opera'), version: tem[2] };
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
    return { name: M[0], version: M[1] };
};

const getContext = (content: Content | NewsItem) => {
    const browser = getBrowserInfo();
    return {
        registration: sessionID,
        platform: "Web",
        contextActivities: {
            parent: [{ id: `https://lms.example.com/content/${content.id}` }]
        },
        extensions: {
            "https://w3id.org/xapi/acrossx/extensions/device-type": getDeviceType(),
            "https://example.com/xapi/browser-info": {
                name: browser.name,
                version: browser.version
            }
        }
    };
};


// --- Statement Queue for Non-Blocking Delivery ---
// Note: This is a simple in-memory queue. For full offline support,
// this could be enhanced with localStorage or a Service Worker.
const statementQueue: object[] = [];
let isSending = false;

async function processQueue() {
    if (isSending || statementQueue.length === 0) return;
    isSending = true;
    const statement = statementQueue.shift();
    if (!statement) {
        isSending = false;
        return;
    }

    try {
        const response = await fetch(`${LRS_ENDPOINT}statements`, {
            method: 'POST',
            headers: {
                'X-Experience-API-Version': '1.0.3',
                'Content-Type': 'application/json',
                'Authorization': LRS_AUTH,
            },
            body: JSON.stringify(statement),
        });
        if (!response.ok) {
            console.error('Failed to send xAPI statement:', response.status, await response.text());
        }
    } catch (error) {
        console.error('Error sending xAPI statement. Re-queueing.', error);
        statementQueue.unshift(statement); // Add it back to the front for retry
    } finally {
        isSending = false;
        // Process next item in the queue after a short delay
        setTimeout(processQueue, 100);
    }
}

function queueStatement(statement: object) {
    statementQueue.push(statement);
    processQueue();
}

// --- Helper Functions ---
const createActor = (user: User) => ({
    mbox: `mailto:${user.email}`,
    name: user.name,
    objectType: 'Agent',
});

const createActivityObject = (content: Content | NewsItem) => {
    const isNewsItem = 'author_id' in content;
    const description = isNewsItem ? `Threat Intel Article: ${content.title}` : content.description;
    const type = isNewsItem ? 'http://activitystrea.ms/schema/1.0/article' : 'http://adlnet.gov/expapi/activities/course';

    return {
        id: `https://lms.example.com/content/${content.id}`,
        definition: {
            name: { 'en-US': content.title },
            description: { 'en-US': description },
            type: type,
        },
        objectType: 'Activity',
    };
};

// --- Statement Builders & Public API ---

/**
 * Sends a "launched" xAPI statement.
 */
export function sendLaunchedStatement(user: User, content: Content | NewsItem) {
    const statement = {
        actor: createActor(user),
        verb: { id: 'http://adlnet.gov/expapi/verbs/launched', display: { 'en-US': 'launched' } },
        object: createActivityObject(content),
        context: getContext(content),
        timestamp: new Date().toISOString(),
    };
    queueStatement(statement);
}

/**
 * Sends a "completed" xAPI statement.
 */
export function sendCompletedStatement(user: User, content: Content | NewsItem, result?: { score?: { scaled: number, raw?: number, min?: number, max?: number }, success?: boolean, completion?: boolean, duration?: string }) {
    const passingScore = 'passing_score' in content ? (content.passing_score ?? 70) / 100 : 0.7;
    const statement = {
        actor: createActor(user),
        verb: { id: 'http://adlnet.gov/expapi/verbs/completed', display: { 'en-US': 'completed' } },
        object: createActivityObject(content),
        result: {
            completion: true,
            success: result?.score ? result.score.scaled >= passingScore : true,
            ...result,
        },
        context: getContext(content),
        timestamp: new Date().toISOString(),
    };
    queueStatement(statement);
}


/**
 * Sends a "paused" xAPI statement for time-based media.
 * @param progress - The timestamp where the media was paused (in seconds).
 *
 * Example JSON:
 * { ... "verb": { "id": "http://adlnet.gov/expapi/verbs/paused" }, "result": { "extensions": { "https://w3id.org/xapi/video/extensions/time": 45.3 } } ... }
 */
export function sendPausedStatement(user: User, content: Content, progress: number) {
    const statement = {
        actor: createActor(user),
        verb: { id: 'http://adlnet.gov/expapi/verbs/paused', display: { 'en-US': 'paused' } },
        object: createActivityObject(content),
        result: {
            extensions: { "https://w3id.org/xapi/video/extensions/time": progress }
        },
        context: getContext(content),
        timestamp: new Date().toISOString(),
    };
    queueStatement(statement);
}

/**
 * Sends a "resumed" xAPI statement for time-based media.
 * @param progress - The timestamp where the media was resumed (in seconds).
 *
 * Example JSON:
 * { ... "verb": { "id": "http://adlnet.gov/expapi/verbs/resumed" }, "result": { "extensions": { "https://w3id.org/xapi/video/extensions/time": 45.3 } } ... }
 */
export function sendResumedStatement(user: User, content: Content, progress: number) {
    const statement = {
        actor: createActor(user),
        verb: { id: 'http://adlnet.gov/expapi/verbs/resumed', display: { 'en-US': 'resumed' } },
        object: createActivityObject(content),
        result: {
            extensions: { "https://w3id.org/xapi/video/extensions/time": progress }
        },
        context: getContext(content),
        timestamp: new Date().toISOString(),
    };
    queueStatement(statement);
}

/**
 * Sends an "exited" or "suspended" xAPI statement when a user leaves content.
 * @param duration - ISO 8601 formatted duration string (e.g., "PT2M30S").
 *
 * Example JSON:
 * { ... "verb": { "id": "http://adlnet.gov/expapi/verbs/suspended" }, "result": { "duration": "PT2M30S" } ... }
 */
export function sendExitedStatement(user: User, content: Content | NewsItem, duration: string) {
    const statement = {
        actor: createActor(user),
        verb: { id: 'http://adlnet.gov/expapi/verbs/suspended', display: { 'en-US': 'suspended' } },
        object: createActivityObject(content),
        result: { duration },
        context: getContext(content),
        timestamp: new Date().toISOString(),
    };
    queueStatement(statement);
}

/**
 * Sends an "answered" xAPI statement for quiz questions.
 *
 * Example JSON:
 * { ... "verb": { "id": "http://adlnet.gov/expapi/verbs/answered" }, "object": { ... "definition": { "type": "http://adlnet.gov/expapi/activities/cmi.interaction" ... } }, "result": { "success": true, "response": "Option B" } ... }
 */
export function sendAnsweredStatement(user: User, content: Content, question: QuizQuestion, response: string, isCorrect: boolean) {
    // FIX: Parse `correctAnswer` to an integer and validate it to prevent type errors.
    // This ensures `correctResponsesPattern` always receives a string, even if the question data is malformed.
    const correctAnswerIndex = parseInt(String(question.correctAnswer), 10);
    const correctResponse = (question.options && !isNaN(correctAnswerIndex) && question.options[correctAnswerIndex])
        ? question.options[correctAnswerIndex]
        : "";

    const statement = {
        actor: createActor(user),
        verb: { id: 'http://adlnet.gov/expapi/verbs/answered', display: { 'en-US': 'answered' } },
        object: {
            id: `https://lms.example.com/content/${content.id}/question/${question.id}`,
            definition: {
                name: { 'en-US': `Question ${question.id} in ${content.title}` },
                description: { 'en-US': question.question },
                type: 'http://adlnet.gov/expapi/activities/cmi.interaction',
                interactionType: 'choice',
                correctResponsesPattern: [correctResponse],
                choices: question.options.map(opt => ({ id: opt, description: { 'en-US': opt } }))
            },
            objectType: 'Activity',
        },
        result: {
            success: isCorrect,
            response: response,
        },
        context: getContext(content),
        timestamp: new Date().toISOString(),
    };
    queueStatement(statement);
}

/**
 * Sends a "read" statement when a user scrolls through a document.
 *
 * Example JSON:
 * { ... "verb": { "id": "http://id.tincanapi.com/verb/read" } ... }
 */
export function sendReadStatement(user: User, content: NewsItem) {
     const statement = {
        actor: createActor(user),
        verb: { id: 'http://id.tincanapi.com/verb/read', display: { 'en-US': 'read' } },
        object: createActivityObject(content),
        context: getContext(content),
        timestamp: new Date().toISOString(),
    };
    queueStatement(statement);
}