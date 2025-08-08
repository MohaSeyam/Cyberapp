// Types for the entire application

export interface Task {
  id: string;
  type: 'Blue Team' | 'Red Team' | 'Soft Skills' | 'Practical';
  duration: number;
  description: {
    ar: string;
    en: string;
  };
  done?: boolean;
}

export interface Day {
  key: string;
  day: {
    ar: string;
    en: string;
  };
  topic: {
    ar: string;
    en: string;
  };
  tasks: Task[];
  resources: Resource[];
  notes_prompt?: {
    title: {
      ar: string;
      en: string;
    };
    points: Array<{
      ar: string;
      en: string;
    }>;
  };
}

export interface Week {
  week: number;
  phase: number;
  title: {
    ar: string;
    en: string;
  };
  objective: {
    ar: string;
    en: string;
  };
  days: Day[];
}

export interface Resource {
  id?: number;
  type: 'video' | 'article' | 'book' | 'tool' | 'podcast' | 'course' | 'quiz' | 'project' | 'community' | 'news' | 'link';
  title: string;
  url: string;
  weekId?: number;
  dayIndex?: number;
  createdAt?: number;
  updatedAt?: number;
}

export interface Note {
  id?: number;
  title: string;
  content: string;
  keywords?: string;
  tags: string[];
  weekId: number;
  dayKey: string;
  taskId: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface JournalEntry {
  id?: number;
  title: string;
  content: string;
  tags: string[];
  weekId: number;
  dayKey: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface Progress {
  id?: number;
  weekId: number;
  dayKey: string;
  taskId: string;
  done: boolean;
}

export interface AppSettings {
  notifications: boolean;
  sound: boolean;
  autoSave: boolean;
  theme: 'light' | 'dark';
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
}

export interface AppState {
  progress: Record<string, boolean>;
  notes: Record<string, Note[]>;
  journal: Record<string, JournalEntry[]>;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

export type Language = 'ar' | 'en';
export type Theme = 'light' | 'dark';

export interface TaskEvaluation {
  taskId: string;
  weekId: number;
  rating: number; // 1-5 stars
  difficulty?: 'easy' | 'medium' | 'hard';
  note?: string;
}

export interface WeekEvaluation {
  weekId: number;
  rating: number; // 1-5 stars
  note?: string;
}