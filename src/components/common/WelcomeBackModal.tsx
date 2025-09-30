import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Modal, Button, Space, Typography, Card } from 'antd';
import { PlayCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { RootState } from '../../store';
import { hideWelcomeBack, setActiveTab } from '../../store/appSlice';
import { resumeInterview } from '../../store/interviewsSlice';
import { updateCandidate } from '../../store/candidatesSlice';

const { Title, Text } = Typography;

const WelcomeBackModal: React.FC = () => {
  const dispatch = useDispatch();
  const { showWelcomeBackModal, currentInterviewId, currentCandidateId } = useSelector((state: RootState) => state.app);
  
  const candidate = useSelector((state: RootState) => 
    currentCandidateId ? state.candidates.byId[currentCandidateId] : undefined
  );
  const interview = useSelector((state: RootState) => 
    currentInterviewId ? state.interviews.byId[currentInterviewId] : undefined
  );

  const handleResumeInterview = () => {
    if (currentInterviewId) {
      dispatch(resumeInterview(currentInterviewId));
      dispatch(setActiveTab('interviewee'));
    }
    dispatch(hideWelcomeBack());
  };

  const handleStartNew = () => {
    if (currentCandidateId) {
      dispatch(updateCandidate({ 
        id: currentCandidateId, 
        updates: { interviewStatus: 'not_started' } 
      }));
    }
    dispatch(setActiveTab('interviewee'));
    dispatch(hideWelcomeBack());
  };

  const currentQuestion = interview?.questions[interview?.currentQuestionIndex || 0];
  const progress = interview ? ((interview.currentQuestionIndex / interview.questions.length) * 100) : 0;

  return (
    <Modal
      title="Welcome Back!"
      open={showWelcomeBackModal}
      onCancel={() => dispatch(hideWelcomeBack())}
      footer={null}
      width={500}
      centered
    >
      <Card style={{ border: 'none', boxShadow: 'none' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Title level={3}>You have an unfinished interview</Title>
            <Text type="secondary">
              {candidate?.name}, you paused your interview partway through. Would you like to continue where you left off?
            </Text>
          </div>

          {interview && (
            <div style={{ 
              backgroundColor: '#f6f8fa', 
              padding: '16px', 
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <Text strong>Progress: {interview.currentQuestionIndex}/{interview.questions.length} questions completed</Text>
              <div style={{ margin: '8px 0' }}>
                <div style={{ 
                  width: '100%', 
                  height: '8px', 
                  backgroundColor: '#e6f7ff', 
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div 
                    style={{ 
                      width: `${progress}%`, 
                      height: '100%', 
                      backgroundColor: '#1890ff',
                      transition: 'width 0.3s ease'
                    }} 
                  />
                </div>
              </div>
              {currentQuestion && (
                <Text type="secondary">
                  Next: Question {interview.currentQuestionIndex + 1} ({currentQuestion.difficulty})
                </Text>
              )}
            </div>
          )}

          <Space size="middle" style={{ width: '100%', justifyContent: 'center' }}>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              size="large"
              onClick={handleResumeInterview}
            >
              Continue Interview
            </Button>
            <Button
              icon={<DeleteOutlined />}
              size="large"
              onClick={handleStartNew}
            >
              Start Over
            </Button>
          </Space>

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Your progress has been automatically saved
            </Text>
          </div>
        </Space>
      </Card>
    </Modal>
  );
};

export default WelcomeBackModal;