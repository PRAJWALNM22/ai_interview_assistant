import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card } from 'antd';
import { RootState } from '../../store';
import { setCurrentInterview } from '../../store/appSlice';
import { createInterview } from '../../store/interviewsSlice';
import { initializeChat } from '../../store/chatSlice';
import ResumeUpload from './ResumeUpload';
import ChatInterface from './ChatInterface';
import { v4 as uuidv4 } from 'uuid';

const IntervieweeTab: React.FC = () => {
  const dispatch = useDispatch();
  const { currentCandidateId, currentInterviewId } = useSelector((state: RootState) => state.app);
  const candidate = useSelector((state: RootState) => 
    currentCandidateId ? state.candidates.byId[currentCandidateId] : undefined
  );
  const interview = useSelector((state: RootState) => 
    currentInterviewId ? state.interviews.byId[currentInterviewId] : undefined
  );

  useEffect(() => {
    // If we have a candidate but no interview, create one
    if (candidate && !interview && !currentInterviewId) {
      const newInterviewId = uuidv4();
      const newInterview = {
        id: newInterviewId,
        candidateId: candidate.id,
        questions: [],
        answers: [],
        currentQuestionIndex: 0,
        timerState: {
          isRunning: false,
          remainingTime: 0,
        },
        status: 'not_started' as const,
      };
      
      dispatch(createInterview(newInterview));
      dispatch(setCurrentInterview(newInterviewId));
      dispatch(initializeChat(newInterviewId));
    }
  }, [candidate, interview, currentInterviewId, dispatch]);

  if (!candidate) {
    return (
      <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        <Card>
          <ResumeUpload />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <ChatInterface candidateId={candidate.id} interviewId={currentInterviewId!} />
    </div>
  );
};

export default IntervieweeTab;