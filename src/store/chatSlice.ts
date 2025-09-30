import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatMessage } from '../types';

interface ChatState {
  byInterviewId: Record<string, ChatMessage[]>;
}

const initialState: ChatState = {
  byInterviewId: {},
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<{ interviewId: string; message: ChatMessage }>) => {
      const { interviewId, message } = action.payload;
      if (!state.byInterviewId[interviewId]) {
        state.byInterviewId[interviewId] = [];
      }
      state.byInterviewId[interviewId].push(message);
    },
    clearMessages: (state, action: PayloadAction<string>) => {
      const interviewId = action.payload;
      state.byInterviewId[interviewId] = [];
    },
    initializeChat: (state, action: PayloadAction<string>) => {
      const interviewId = action.payload;
      // Always initialize with a fresh welcome message
      state.byInterviewId[interviewId] = [
        {
          id: `welcome-${Date.now()}`,
          type: 'system',
          content: 'Welcome to the AI Interview Assistant! Ready to start your interview?',
          timestamp: new Date().toISOString(),
        },
      ];
    },
    clearAllData: (state) => {
      state.byInterviewId = {};
    },
  },
});

export const { addMessage, clearMessages, initializeChat, clearAllData } = chatSlice.actions;
export default chatSlice.reducer;