import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Interview, Question, Answer } from '../types';

interface InterviewsState {
  byId: Record<string, Interview>;
  allIds: string[];
  byCandidateId: Record<string, string>;
}

const initialState: InterviewsState = {
  byId: {},
  allIds: [],
  byCandidateId: {},
};

const interviewsSlice = createSlice({
  name: 'interviews',
  initialState,
  reducers: {
    createInterview: (state, action: PayloadAction<Interview>) => {
      const interview = action.payload;
      state.byId[interview.id] = interview;
      state.allIds.push(interview.id);
      state.byCandidateId[interview.candidateId] = interview.id;
    },
    updateInterview: (state, action: PayloadAction<{ id: string; updates: Partial<Interview> }>) => {
      const { id, updates } = action.payload;
      if (state.byId[id]) {
        state.byId[id] = { ...state.byId[id], ...updates };
      }
    },
    setQuestions: (state, action: PayloadAction<{ interviewId: string; questions: Question[] }>) => {
      const { interviewId, questions } = action.payload;
      if (state.byId[interviewId]) {
        state.byId[interviewId].questions = questions;
      }
    },
    addAnswer: (state, action: PayloadAction<{ interviewId: string; answer: Answer }>) => {
      const { interviewId, answer } = action.payload;
      if (state.byId[interviewId]) {
        state.byId[interviewId].answers.push(answer);
      }
    },
    nextQuestion: (state, action: PayloadAction<string>) => {
      const interviewId = action.payload;
      if (state.byId[interviewId]) {
        state.byId[interviewId].currentQuestionIndex += 1;
      }
    },
    updateTimer: (state, action: PayloadAction<{ interviewId: string; remainingTime: number; isRunning: boolean }>) => {
      const { interviewId, remainingTime, isRunning } = action.payload;
      if (state.byId[interviewId]) {
        state.byId[interviewId].timerState.remainingTime = remainingTime;
        state.byId[interviewId].timerState.isRunning = isRunning;
      }
    },
    startTimer: (state, action: PayloadAction<{ interviewId: string; timeLimit: number }>) => {
      const { interviewId, timeLimit } = action.payload;
      if (state.byId[interviewId]) {
        state.byId[interviewId].timerState = {
          isRunning: true,
          remainingTime: timeLimit,
          questionStartTime: new Date().toISOString(),
        };
      }
    },
    pauseInterview: (state, action: PayloadAction<string>) => {
      const interviewId = action.payload;
      if (state.byId[interviewId]) {
        state.byId[interviewId].status = 'paused';
        state.byId[interviewId].pausedAt = new Date().toISOString();
        state.byId[interviewId].timerState.isRunning = false;
      }
    },
    resumeInterview: (state, action: PayloadAction<string>) => {
      const interviewId = action.payload;
      if (state.byId[interviewId]) {
        state.byId[interviewId].status = 'in_progress';
        state.byId[interviewId].pausedAt = undefined;
        state.byId[interviewId].timerState.isRunning = true;
      }
    },
    completeInterview: (state, action: PayloadAction<string>) => {
      const interviewId = action.payload;
      if (state.byId[interviewId]) {
        state.byId[interviewId].status = 'completed';
        state.byId[interviewId].completedAt = new Date().toISOString();
        state.byId[interviewId].timerState.isRunning = false;
      }
    },
    resetInterview: (state, action: PayloadAction<{ interviewId: string; candidateId: string }>) => {
      const { interviewId, candidateId } = action.payload;
      if (state.byId[interviewId]) {
        state.byId[interviewId] = {
          id: interviewId,
          candidateId,
          questions: [],
          answers: [],
          currentQuestionIndex: 0,
          timerState: {
            isRunning: false,
            remainingTime: 0,
          },
          status: 'not_started',
        };
      }
    },
    clearAllData: (state) => {
      state.byId = {};
      state.allIds = [];
      state.byCandidateId = {};
    },
  },
});

export const {
  createInterview,
  updateInterview,
  setQuestions,
  addAnswer,
  nextQuestion,
  updateTimer,
  startTimer,
  pauseInterview,
  resumeInterview,
  completeInterview,
  resetInterview,
  clearAllData,
} = interviewsSlice.actions;

export default interviewsSlice.reducer;