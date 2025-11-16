

import { User as SupabaseUser } from '@supabase/supabase-js';

export enum Role {
  ADMIN = 'Admin',
  LEAD = 'Lead',
  USER = 'User',
  CISO = 'CISO',
}

export enum ContentType {
  VIDEO_QUIZ = 'Video + Quiz',
  HTML5 = 'HTML5 Content',
  SCORM = 'SCORM Package',
  VIDEO = 'Video',
  PDF = 'PDF',
  HTML = 'Raw HTML',
  QUIZ = 'Quiz',
  REACT_SANDBOX = 'React Sandbox',
  CYBER_SECURITY_TRAINING = 'Cyber Security Training',
}

export interface UserProgress {
  [contentId: number]: {
    status: 'not-started' | 'in-progress' | 'completed';
    score?: number; // For quizzes
  };
}

export interface Profile {
  id: string; // Corresponds to Supabase auth user UUID
  name: string;
  email: string;
  role: Role;
  avatar_url?: string;
  organization_id?: string;
  team?: string;
  points?: number;
  badges?: string[];
  progress?: UserProgress;
  updated_at?: string;
  created_at?: string;
  // FIX: Added optional 'company' property to align with its usage in various components for filtering and display.
  company?: string;
}

// Updated Content interface based on the DB schema
export interface Content {
  id: number;
  title: string;
  type: ContentType;
  description: string;
  content_url?: string;
  embed_url?: string;
  html_content?: string;
  questions?: QuizQuestion[];
  quiz_data?: string;
  creator_id: string | null;
  created_at: string;
  tags: string[];
  visibility: 'org-wide' | 'role-specific' | 'group-specific';
  duration_sec: number;
  risk_tags: string[];
  compliance: string[];
  thumbnail_url: string;
  category: string;
  difficulty: 'Intro' | 'Intermediate' | 'Advanced';
  passing_score?: number;
  assigned_org_ids?: string[];
}

export interface Playlist {
    id: number;
    name: string;
    description: string;
    curator_id: string | null;
    created_at: string;
    // FIX: Added 'contentIds' to store the list of content IDs, as expected by the playlist management components.
    contentIds: number[];
    content?: Content[]; // Populated after fetching from junction table
    assigned_org_ids?: string[];
}

export interface PlaylistContent {
    playlist_id: number;
    content_id: number;
}

export interface QuizQuestion {
  id: number;
  question: string; // Can contain HTML
  options: string[];
  correctAnswer: number;
}

export enum NewsItemType {
  HTML_ARTICLE = 'HTML Article',
  REACT_SANDBOX = 'React Sandbox',
}

export interface NewsItem {
  id: number;
  title: string;
  type: NewsItemType;
  content?: string; // HTML content
  embed_url?: string;
  author_id: string | null;
  author?: { name: string }; // For joined data
  created_at: string;
  thumbnail_url?: string;
}

export interface AnalyticsRecord {
  id: number;
  user_id: string;
  content_id: number;
  event_type: 'view' | 'start' | 'complete' | 'quiz_attempt';
  timestamp: string;
  details: {
    watchTime?: number; // in seconds
    score?: number; // percentage
    correctAnswers?: number;
    totalQuestions?: number;
  };
}

export interface CyberTrainingAnalyticsRecord {
  id: number;
  user_id: string;
  user_name: string;
  user_company: string;
  content_id: number;
  score: number; // percentage
  video_watch_time: number; // in seconds
  completed_at: string;
  attempt: number;
}


export interface Organization {
    id: string;
    name: string;
    theme_color: string;
    logo_url: string;
    powerbi_embed_url?: string;
}

export interface QAndAItem {
  id: number;
  user_id: string;
  user?: { name: string, avatar_url?: string };
  question: string;
  answer: string | null;
  answered_by: string | null;
  admin?: { name: string };
  created_at: string;
  answered_at: string | null;
  is_faq: boolean;
}