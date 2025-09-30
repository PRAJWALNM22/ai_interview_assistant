import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Card, Empty } from 'antd';
import { selectAllCandidates, selectHasCompletedInterviews } from '../../store/selectors';
import CandidatesList from './CandidatesList';
import CandidateDetail from './CandidateDetail';

const InterviewerTab: React.FC = () => {
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  
  const candidates = useSelector(selectAllCandidates);
  const hasCompletedInterviews = useSelector(selectHasCompletedInterviews);

  if (!hasCompletedInterviews && candidates.length === 0) {
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <Empty
            description="No candidates have completed interviews yet"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {selectedCandidateId ? (
        <CandidateDetail 
          candidateId={selectedCandidateId}
          onBack={() => setSelectedCandidateId(null)}
        />
      ) : (
        <CandidatesList onSelectCandidate={setSelectedCandidateId} />
      )}
    </div>
  );
};

export default InterviewerTab;