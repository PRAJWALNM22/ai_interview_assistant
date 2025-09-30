import { createSelector } from '@reduxjs/toolkit';
import { RootState } from './index';

// Base selectors
const selectCandidatesState = (state: RootState) => state.candidates;
const selectInterviewsState = (state: RootState) => state.interviews;

// Memoized selectors to prevent unnecessary re-renders
export const selectAllCandidates = createSelector(
  [selectCandidatesState],
  (candidatesState) => candidatesState.allIds.map(id => candidatesState.byId[id])
);

export const selectCompletedCandidates = createSelector(
  [selectAllCandidates],
  (candidates) => candidates.filter(candidate => candidate.interviewStatus === 'completed')
);

export const selectHasCompletedInterviews = createSelector(
  [selectAllCandidates],
  (candidates) => candidates.some(candidate => candidate.interviewStatus === 'completed')
);

export const selectCandidatesWithStats = createSelector(
  [selectAllCandidates, selectInterviewsState],
  (candidates, interviews) => candidates.map(candidate => {
    const interviewId = interviews.byCandidateId[candidate.id];
    const interview = interviewId ? interviews.byId[interviewId] : undefined;
    
    return {
      ...candidate,
      interviewDate: interview?.completedAt || interview?.startedAt,
    };
  })
);

export const selectCandidateById = createSelector(
  [selectCandidatesState, (_, candidateId: string) => candidateId],
  (candidatesState, candidateId) => candidatesState.byId[candidateId]
);

export const selectInterviewByCandidateId = createSelector(
  [selectInterviewsState, (_, candidateId: string) => candidateId],
  (interviewsState, candidateId) => {
    const interviewId = interviewsState.byCandidateId[candidateId];
    return interviewId ? interviewsState.byId[interviewId] : undefined;
  }
);