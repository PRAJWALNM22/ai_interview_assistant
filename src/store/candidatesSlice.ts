import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Candidate } from '../types';

interface CandidatesState {
  byId: Record<string, Candidate>;
  allIds: string[];
}

const initialState: CandidatesState = {
  byId: {},
  allIds: [],
};

const candidatesSlice = createSlice({
  name: 'candidates',
  initialState,
  reducers: {
    addCandidate: (state, action: PayloadAction<Candidate>) => {
      const candidate = action.payload;
      state.byId[candidate.id] = candidate;
      if (!state.allIds.includes(candidate.id)) {
        state.allIds.push(candidate.id);
      }
    },
    updateCandidate: (state, action: PayloadAction<{ id: string; updates: Partial<Candidate> }>) => {
      const { id, updates } = action.payload;
      if (state.byId[id]) {
        state.byId[id] = { ...state.byId[id], ...updates };
      }
    },
    deleteCandidate: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      delete state.byId[id];
      state.allIds = state.allIds.filter(candidateId => candidateId !== id);
    },
    setFinalScore: (state, action: PayloadAction<{ candidateId: string; score: number; summary: string }>) => {
      const { candidateId, score, summary } = action.payload;
      if (state.byId[candidateId]) {
        state.byId[candidateId].finalScore = score;
        state.byId[candidateId].finalSummary = summary;
        state.byId[candidateId].interviewStatus = 'completed';
      }
    },
    clearAllData: (state) => {
      state.byId = {};
      state.allIds = [];
    },
  },
});

export const { addCandidate, updateCandidate, deleteCandidate, setFinalScore, clearAllData } = candidatesSlice.actions;
export default candidatesSlice.reducer;