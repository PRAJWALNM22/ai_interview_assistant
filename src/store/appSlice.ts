import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppState } from '../types';

const initialState: AppState = {
  activeTab: 'interviewee',
  showWelcomeBackModal: false,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<'interviewee' | 'interviewer'>) => {
      state.activeTab = action.payload;
    },
    setCurrentCandidate: (state, action: PayloadAction<string | undefined>) => {
      state.currentCandidateId = action.payload;
    },
    setCurrentInterview: (state, action: PayloadAction<string | undefined>) => {
      state.currentInterviewId = action.payload;
    },
    showWelcomeBack: (state) => {
      state.showWelcomeBackModal = true;
    },
    hideWelcomeBack: (state) => {
      state.showWelcomeBackModal = false;
    },
  },
});

export const {
  setActiveTab,
  setCurrentCandidate,
  setCurrentInterview,
  showWelcomeBack,
  hideWelcomeBack,
} = appSlice.actions;

export default appSlice.reducer;