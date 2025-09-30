export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  resumeFile?: File;
  createdAt: string;
  finalScore?: number;
  finalSummary?: string;
  interviewStatus: 'not_started' | 'in_progress' | 'completed' | 'paused';
}

export interface Question {
  id: string;
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number; // in seconds
  category: string;
}

export interface Answer {
  questionId: string;
  text: string;
  score?: number;
  feedback?: string;
  timeSpent: number; // in seconds
  submittedAt: string;
}

export interface Interview {
  id: string;
  candidateId: string;
  questions: Question[];
  answers: Answer[];
  currentQuestionIndex: number;
  startedAt?: string;
  completedAt?: string;
  pausedAt?: string;
  timerState: {
    isRunning: boolean;
    remainingTime: number;
    questionStartTime?: string;
  };
  status: 'not_started' | 'in_progress' | 'completed' | 'paused';
}

export interface ChatMessage {
  id: string;
  type: 'system' | 'user' | 'question' | 'timer' | 'score';
  content: string;
  timestamp: string;
  questionId?: string;
  metadata?: any;
}

export interface AppState {
  currentCandidateId?: string;
  currentInterviewId?: string;
  activeTab: 'interviewee' | 'interviewer';
  showWelcomeBackModal: boolean;
}

export interface RootState {
  candidates: {
    byId: Record<string, Candidate>;
    allIds: string[];
  };
  interviews: {
    byId: Record<string, Interview>;
    allIds: string[];
    byCandidateId: Record<string, string>;
  };
  chatMessages: {
    byInterviewId: Record<string, ChatMessage[]>;
  };
  app: AppState;
}

export interface ResumeData {
  name?: string;
  email?: string;
  phone?: string;
  extractedText: string;
}