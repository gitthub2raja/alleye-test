import React from 'react';

// Icons have been updated with a more refined and professional aesthetic.
// Brand logos, the Alleye logo, and standard UI icons (like Play/Check circles) remain unchanged.

// --- NEW PROFESSIONAL ICON SET ---

// A simpler, more classic and instantly recognizable house icon.
export const HomeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 22V12h6v10" />
    </svg>
);

// Refined book icon with clearer page lines, giving it more structure.
export const ContentIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
);


// A more modern and universally understood "news" or "article" icon.
export const NewsIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5h10.5M6.75 12h10.5m-10.5 4.5h4.5m1.5-13.5h.008v.008H8.25v-.008zm0 4.5h.008v.008H8.25v-.008z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 3h15a1.5 1.5 0 011.5 1.5v15a1.5 1.5 0 01-1.5 1.5h-15a1.5 1.5 0 01-1.5-1.5v-15A1.5 1.5 0 014.5 3z" />
    </svg>
);


// Cleaner and more balanced bar chart for "Analytics".
export const AnalyticsIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 19V8M12 19V4M20 19v-8" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 19h19" />
    </svg>
);


// A standardized, solid-feel profile icon.
export const ProfileIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 0115 0" />
    </svg>
);

// Drastically simplified and clarified from the original. Clearly represents a group of users.
export const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.663l.001.109m-4.435 5.728a9.375 9.375 0 01-2.625-.372A9.337 9.337 0 013.121 19.48 4.125 4.125 0 017.533 16.99c.631.256 1.295.426 1.996.534v-.004c1.113.285 2.16.786 3.07 1.342m-4.435-5.728a6.375 6.375 0 01-6.375-6.375c0-1.113.285-2.16.786-3.07m11.964 4.663l-.001-.109a6.375 6.375 0 00-11.964-4.663l-.001.109m11.964 4.663a9.375 9.375 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493m-4.435-5.728s-1.092 1.092-3.07 1.342m-4.435 5.728a9.375 9.375 0 01-2.625-.372 9.337 9.337 0 01-4.121.952 4.125 4.125 0 017.533 2.493m4.435-5.728s1.092-1.092 3.07-1.342m0 0a6.375 6.375 0 00-6.375-6.375c-1.113 0-2.16-.285-3.07-.786m11.964 4.663c.631-.256 1.295-.426 1.996-.534s1.421-.109 2.126 0l.001.109a6.375 6.375 0 01-7.533 4.125 4.125 4.125 0 01-4.121-.952m-4.435-5.728c.631.256 1.295.426 1.996.534s1.421.109 2.126 0l-.001-.109a6.375 6.375 0 00-7.533-4.125 4.125 4.125 0 00-4.121.952" />
    </svg>
);

// A modern office building icon, more geometric and clean.
export const OrganizationIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 21h16M4 10h16M4 15h16M4 21V6a2 2 0 012-2h12a2 2 0 012 2v15" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v10m4-10v10m4-10v10" />
    </svg>
);


// A clearer representation of a list or playlist.
export const PlaylistIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
);


// Kept the same universal hamburger menu icon. No changes needed.
export const MenuIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);

// A pulse/heartbeat line is a strong and dynamic metaphor for "Activity".
export const ActivityIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h3.385l2.25-6 3.73 12 2.25-6h3.385" />
    </svg>
);


// A more direct Q&A icon with a question mark in a speech bubble.
export const QAIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25a8.25 8.25 0 11-16.5 0 8.25 8.25 0 0116.5 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M11.25 7.5a.375.375 0 11-1.5 0 .375.375 0 011.5 0z" />
    </svg>
);


// Universal share icon, cleaner and more recognizable than the original.
export const ShareIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.195.025.39.044.588.05H11a2.25 2.25 0 012.25 2.25v1.286a2.25 2.25 0 002.25 2.25h.382a2.25 2.25 0 002.25-2.25v-.192a2.25 2.25 0 00-1.152-1.956l-2.26-1.13a2.25 2.25 0 01-1.152-1.956V8.25a2.25 2.25 0 00-2.25-2.25h-.588a2.25 2.25 0 10-2.186 0z" />
    </svg>
);

// Icon for AI recommendations.
export const LightBulbIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-1.125 6.01 6.01 0 0 0 1.5-1.125M12 11.625a6.01 6.01 0 0 1-1.5-1.125 6.01 6.01 0 0 1-1.5-1.125m0 0A2.25 2.25 0 0 1 5.625 6h12.75a2.25 2.25 0 0 1 1.625 3.375M12 21a2.25 2.25 0 0 1-2.25-2.25V18a2.25 2.25 0 0 1 4.5 0v.75A2.25 2.25 0 0 1 12 21Z" />
    </svg>
);


// --- BRAND & LOGO ICONS (Unchanged) ---

export const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,36.62,44,30.638,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>
);

export const AzureIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px" {...props}>
        <path fill="#f35325" d="M1 5h10v10H1z"/>
        <path fill="#81bc06" d="M13 5h10v10H13z"/>
        <path fill="#05a6f0" d="M1 17h10v10H1z"/>
        <path fill="#ffba08" d="M13 17h10v10H13z"/>
    </svg>
);

export const OktaIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px" fill="currentColor" {...props}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
    </svg>
);

export const AlleyeFullLogo = ({ className }: { className?: string }) => (
  <svg width="120" height="32" viewBox="0 0 150 40" className={className} xmlns="http://www.w3.org/2000/svg">
    <g fill="currentColor">
      {/* Icon Path */}
      <path d="M25.3,3.3C22.6,0.6,18.8,0,16,2.2c-5,4-1.2,12.8-1.2,12.8c-1.4-2.8-2.6-5-4.5-6.2c-3.2-2-6-0.8-6,2.8 c0,3.3,4.2,6.5,8,9.7c2.3,2,4,3.7,4.8,6.3c0.3,1,0.2,2.1-0.3,3c-0.8,1.5-2.5,2.3-4.2,1.9c-2.3-0.5-3.8-2.4-4.6-4.5 c-0.5-1.4-0.6-3.4,0.3-5.3c0.2-0.4,0.1-0.9-0.3-1.1c-0.4-0.2-0.9-0.1-1.1,0.3c-1.2,2.4-1.1,5.1-0.5,6.8 c1,2.8,3.2,5.3,6.3,6c3.1,0.6,6.2-0.6,8.1-3.1c2.1-2.8,2.6-6.4,1.5-9.6c-0.6-1.9-1.8-3.4-3.2-4.9c-3-3.2-6.6-6-6.6-8.5 c0-1.2,1.1-1.7,2.2-1c1.3,0.8,2.3,2.9,3.5,5.3c0.2,0.5,0.8,0.7,1.3,0.5c0.5-0.2,0.7-0.8,0.5-1.3c-1.4-2.8-2.7-5.3-4.5-6.4 c-1.1-0.7-2-0.9-2.7-0.7c-0.1,0-0.2,0.1-0.3,0.1c4.1-3.4,8.5,1,10,5.4C32.1,10,29.9,6.5,25.3,3.3z M40.4,18.2 c-3.8,3.2-8,6.4-8,9.7c0,3.6,2.8,4.8,6,2.8c1.9-1.2,3.1-3.4,4.5-6.2c0,0,3.8,8.8-1.2,12.8c-2.8,2.2-6.6,1.6-9.3-1.1 c-4.6-4.6-2.4-8.1,0-12.8c1.5-2.9,3.2-5.4,4.5-6.4c-1.8-1.1-3.1-3.6-4.5-6.4c0.2-0.5,0.8-0.7,1.3-0.5 c0.5,0.2,0.7,0.8,0.5,1.3c1.2,2.4,2.2,4.5,3.5,5.3c1.1,0.7,2.2,0.2,2.2-1c0-2.5-3.6-5.3-6.6-8.5c-1.4-1.5-2.6-3-3.2-4.9 c-1.1-3.2-0.6-6.8,1.5-9.6c2-2.5,5-3.7,8.1-3.1c3.1,0.7,5.3,3.2,6.3,6c0.6,1.7,0.7,4.4-0.5,6.8c-0.2,0.4-0.7,0.5-1.1,0.3 c-0.4-0.2-0.5-0.7-0.3-1.1c0.9-1.9,0.8-3.9,0.3-5.3c-0.8-2.1-2.3-4-4.6-4.5c-1.7-0.4-3.4,0.4-4.2,1.9 c-0.5,0.9-0.6,2-0.3,3c0.8,2.6,2.5,4.3,4.8,6.3z" />
      {/* Wordmark Path */}
      <path d="M55,26.5 V13.8 h2.5 l4.8,8.8 V13.8 h2.5 v12.7 h-2.2 l-5.1-9.3 v9.3 H55 Z M71.8,26.5 V13.8 H79 v2.2 h-4.7 v3 h4.2 v2.2 h-4.2 v3.1 H79 v2.2 h-7.2 Z M82.2,26.5 V13.8 h7.2 v2.2 h-4.7 v3 h4.2 v2.2 h-4.2 v3.1 H89.4 v2.2 h-7.2 Z M98.4,25.3 c-2.6,2.3-6.3,1.6-8.2-1.4 c-1.5-2.4-1.1-5.3,0.6-7.3 c2.1-2.4,5.6-2.7,8-0.6 l-1.1,1.9 c-1.7-1.4-4-1.2-5.4,0.6 c-1.1,1.4-1.3,3.4-0.5,4.9 c1,1.8,3.2,2.3,5,1.1 L98.4,25.3 Z M109.1,14.6 c-2.2-1.7-5.1-1.1-6.6,1.3 c-1.5,2.4-1.1,5.3,0.6,7.3 c2.1,2.4,5.6,2.7,8,0.6 l-1.1-1.9 c-1.7,1.4-4,1.2-5.4-0.6 c-1.1-1.4-1.3-3.4-0.5-4.9 c0.9-1.8,3.1-2.3,4.9-1.1 L109.1,14.6 Z" />
    </g>
  </svg>
);

// --- TIMELINE & UI ICONS (Unchanged) ---

export const PlayCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
    </svg>
);

export const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const QuestionMarkCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
    </svg>
);

export const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export const InformationCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
);