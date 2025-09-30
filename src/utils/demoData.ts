import { Candidate, Interview, Question, Answer, ChatMessage } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const generateDemoCandidate = (): Candidate => {
  const demoNames = ['John Smith', 'Sarah Johnson', 'Michael Chen', 'Emily Davis', 'David Wilson'];
  const name = demoNames[Math.floor(Math.random() * demoNames.length)];
  
  return {
    id: uuidv4(),
    name,
    email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
    phone: `+1-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    interviewStatus: Math.random() > 0.3 ? 'completed' : 'in_progress',
    finalScore: Math.random() > 0.3 ? Math.floor(Math.random() * 40 + 60) : undefined,
    finalSummary: Math.random() > 0.3 ? generateDemoSummary() : undefined,
  };
};

const generateDemoSummary = (): string => {
  const summaries = [
    `Interview Performance Summary:

Overall Score: 78/100 (Good)
Completion Rate: 100.0%

Performance by Difficulty:
• Easy Questions: 85/100
• Medium Questions: 75/100  
• Hard Questions: 72/100

Key Observations:
• Strong foundation in basic concepts
• Consistent performance across all difficulty levels

Recommendation: Good candidate - review specific areas for improvement`,
    
    `Interview Performance Summary:

Overall Score: 92/100 (Excellent)
Completion Rate: 100.0%

Performance by Difficulty:
• Easy Questions: 95/100
• Medium Questions: 90/100  
• Hard Questions: 88/100

Key Observations:
• Strong foundation in basic concepts
• Shows good problem-solving skills for complex scenarios

Recommendation: Strong candidate - ready for technical interviews`,
    
    `Interview Performance Summary:

Overall Score: 65/100 (Average)
Completion Rate: 83.3%

Performance by Difficulty:
• Easy Questions: 75/100
• Medium Questions: 60/100  
• Hard Questions: 55/100

Key Observations:
• 16.7% of questions were not answered
• May benefit from deeper study of intermediate concepts

Recommendation: Average performance - focus on practical experience and fundamentals`
  ];
  
  return summaries[Math.floor(Math.random() * summaries.length)];
};

export const generateDemoData = () => {
  const candidates: Candidate[] = [];
  const interviews: Interview[] = [];
  const chatMessages: Record<string, ChatMessage[]> = {};

  // Generate 3-5 demo candidates
  const candidateCount = Math.floor(Math.random() * 3) + 3;
  
  for (let i = 0; i < candidateCount; i++) {
    const candidate = generateDemoCandidate();
    candidates.push(candidate);
    
    if (candidate.interviewStatus === 'completed') {
      const interview = generateDemoInterview(candidate.id);
      interviews.push(interview);
      chatMessages[interview.id] = generateDemoChatMessages(interview);
    }
  }

  return { candidates, interviews, chatMessages };
};

const generateDemoInterview = (candidateId: string): Interview => {
  return {
    id: uuidv4(),
    candidateId,
    questions: generateDemoQuestions(),
    answers: [],
    currentQuestionIndex: 6,
    startedAt: new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - Math.random() * 30 * 60 * 1000).toISOString(),
    status: 'completed',
    timerState: {
      isRunning: false,
      remainingTime: 0,
    },
  };
};

const generateDemoQuestions = (): Question[] => {
  return [
    {
      id: uuidv4(),
      text: 'What is the difference between var, let, and const in JavaScript?',
      difficulty: 'easy',
      timeLimit: 20,
      category: 'JavaScript Basics',
    },
    {
      id: uuidv4(),
      text: 'Explain what JSX is and how it relates to React.',
      difficulty: 'easy',
      timeLimit: 20,
      category: 'React Basics',
    },
    // Add more demo questions as needed
  ];
};

const generateDemoChatMessages = (interview: Interview): ChatMessage[] => {
  const messages: ChatMessage[] = [];
  
  // Welcome message
  messages.push({
    id: uuidv4(),
    type: 'system',
    content: 'Welcome to your technical interview! You\'ll be asked 6 questions of varying difficulty. Let\'s begin!',
    timestamp: interview.startedAt || new Date().toISOString(),
  });

  // Add some sample Q&A
  interview.questions.forEach((question, index) => {
    messages.push({
      id: uuidv4(),
      type: 'question',
      content: `**Question ${index + 1}/6** (${question.difficulty.toUpperCase()} - ${question.timeLimit}s)\n\n${question.text}`,
      timestamp: new Date(Date.now() - (6 - index) * 5 * 60 * 1000).toISOString(),
      questionId: question.id,
    });

    messages.push({
      id: uuidv4(),
      type: 'user',
      content: generateDemoAnswer(question.difficulty),
      timestamp: new Date(Date.now() - (6 - index) * 5 * 60 * 1000 + 60000).toISOString(),
      questionId: question.id,
    });

    messages.push({
      id: uuidv4(),
      type: 'score',
      content: `**Score: ${Math.floor(Math.random() * 40 + 60)}/100**\n\nGood answer with solid understanding. ${question.difficulty === 'easy' ? 'Clear and concise.' : question.difficulty === 'medium' ? 'Shows good technical knowledge.' : 'Demonstrates complex problem-solving skills.'}`,
      timestamp: new Date(Date.now() - (6 - index) * 5 * 60 * 1000 + 90000).toISOString(),
      questionId: question.id,
    });
  });

  return messages;
};

const generateDemoAnswer = (difficulty: string): string => {
  const answers = {
    easy: [
      'var is function-scoped and can be redeclared, let is block-scoped and can be reassigned but not redeclared, and const is block-scoped and cannot be reassigned or redeclared.',
      'JSX is a syntax extension for JavaScript that allows you to write HTML-like code in React components. It gets compiled to React.createElement() calls.',
    ],
    medium: [
      'Closures in JavaScript occur when a function has access to variables in its outer scope even after the outer function has returned. This is useful for data privacy and creating function factories.',
      'useEffect runs after the DOM is painted, while useLayoutEffect runs synchronously after all DOM mutations but before the browser paints.',
    ],
    hard: [
      'For a real-time notification system, I would use WebSockets for bidirectional communication, implement a message queue for reliability, use Redis for caching, and design a microservices architecture for scalability.',
      'I would create a custom hook that uses useReducer for state management, maintains a history stack for undo operations, and implements command pattern for action reversibility.',
    ],
  };

  const difficultyAnswers = answers[difficulty as keyof typeof answers] || answers.easy;
  return difficultyAnswers[Math.floor(Math.random() * difficultyAnswers.length)];
};