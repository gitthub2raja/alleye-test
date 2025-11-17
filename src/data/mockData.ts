export interface Video {
  id: string;
  title: string;
  description: string;
  duration: string;
  thumbnail: string;
  videoUrl: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  teamId?: string;
}

export interface Quiz {
  id: string;
  videoId: string;
  questions: Question[];
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  teamId?: string;
  progress: UserProgress[];
}

export interface UserProgress {
  videoId: string;
  completed: boolean;
  quizScore?: number;
  watchedAt?: string;
}

// Mock Videos
export const mockVideos: Video[] = [
  {
    id: '1',
    title: 'Introduction to Cybersecurity',
    description: 'Learn the fundamentals of cybersecurity and why it matters in today\'s digital world.',
    duration: '8:45',
    thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=450&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    category: 'Fundamentals',
    difficulty: 'Beginner',
  },
  {
    id: '2',
    title: 'Password Security Best Practices',
    description: 'Master the art of creating and managing secure passwords to protect your digital identity.',
    duration: '12:30',
    thumbnail: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&h=450&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    category: 'Authentication',
    difficulty: 'Beginner',
  },
  {
    id: '3',
    title: 'Phishing Attack Detection',
    description: 'Identify and prevent phishing attempts that target you and your organization.',
    duration: '15:20',
    thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=450&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    category: 'Threats',
    difficulty: 'Intermediate',
  },
  {
    id: '4',
    title: 'Network Security Fundamentals',
    description: 'Understand how to secure network infrastructure and protect data in transit.',
    duration: '18:15',
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=450&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    category: 'Networks',
    difficulty: 'Intermediate',
  },
  {
    id: '5',
    title: 'Advanced Threat Detection',
    description: 'Learn advanced techniques for identifying and responding to sophisticated cyber threats.',
    duration: '22:45',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=450&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    category: 'Advanced Topics',
    difficulty: 'Advanced',
  },
  {
    id: '6',
    title: 'Incident Response Procedures',
    description: 'Master the steps to effectively respond to and recover from security incidents.',
    duration: '20:10',
    thumbnail: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&h=450&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    category: 'Response',
    difficulty: 'Advanced',
  },
];

// Mock Quizzes
export const mockQuizzes: Quiz[] = [
  {
    id: 'q1',
    videoId: '1',
    questions: [
      {
        id: 'q1-1',
        question: 'What is the primary goal of cybersecurity?',
        options: [
          'To make systems faster',
          'To protect systems and data from threats',
          'To reduce costs',
          'To increase user experience'
        ],
        correctAnswer: 1,
      },
      {
        id: 'q1-2',
        question: 'Which of the following is NOT a common cyber threat?',
        options: [
          'Malware',
          'Phishing',
          'Software updates',
          'Ransomware'
        ],
        correctAnswer: 2,
      },
      {
        id: 'q1-3',
        question: 'What does CIA stand for in cybersecurity?',
        options: [
          'Computer Internet Access',
          'Confidentiality, Integrity, Availability',
          'Cyber Intelligence Agency',
          'Critical Information Assets'
        ],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: 'q2',
    videoId: '2',
    questions: [
      {
        id: 'q2-1',
        question: 'What is the recommended minimum length for a strong password?',
        options: ['6 characters', '8 characters', '12 characters', '20 characters'],
        correctAnswer: 2,
      },
      {
        id: 'q2-2',
        question: 'Which of these is the MOST secure password?',
        options: [
          'password123',
          'MyDog2024',
          'Tr0ub4dor&3',
          'correct horse battery staple'
        ],
        correctAnswer: 3,
      },
    ],
  },
  {
    id: 'q3',
    videoId: '3',
    questions: [
      {
        id: 'q3-1',
        question: 'What is a common sign of a phishing email?',
        options: [
          'Professional formatting',
          'Urgent requests for personal information',
          'Company logo present',
          'Proper grammar'
        ],
        correctAnswer: 1,
      },
      {
        id: 'q3-2',
        question: 'What should you do if you suspect a phishing attempt?',
        options: [
          'Click the link to investigate',
          'Reply asking if it\'s legitimate',
          'Report it and delete it',
          'Forward it to colleagues'
        ],
        correctAnswer: 2,
      },
    ],
  },
];

// Mock User
export const mockCurrentUser: User = {
  id: 'user1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'user',
  teamId: 'team1',
  progress: [
    { videoId: '1', completed: true, quizScore: 100, watchedAt: '2024-01-15' },
    { videoId: '2', completed: true, quizScore: 85, watchedAt: '2024-01-16' },
    { videoId: '3', completed: false },
  ],
};

// Mock Admin User
export const mockAdminUser: User = {
  id: 'admin1',
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin',
  progress: [],
};
