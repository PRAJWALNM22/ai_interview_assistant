import React from 'react';
import { useSelector } from 'react-redux';
import { 
  Card, 
  Button, 
  Space, 
  Typography, 
  Descriptions, 
  List, 
  Avatar, 
  Tag, 
  Progress,
  Row,
  Col,
  Statistic
} from 'antd';
import { 
  ArrowLeftOutlined, 
  UserOutlined, 
  RobotOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { RootState } from '../../store';
import { ChatMessage } from '../../types';

const { Title, Text, Paragraph } = Typography;

interface Props {
  candidateId: string;
  onBack: () => void;
}

const CandidateDetail: React.FC<Props> = ({ candidateId, onBack }) => {
  const candidate = useSelector((state: RootState) => state.candidates.byId[candidateId]);
  const interviewId = useSelector((state: RootState) => state.interviews.byCandidateId[candidateId]);
  const interview = useSelector((state: RootState) => 
    interviewId ? state.interviews.byId[interviewId] : undefined
  );
  const messages = useSelector((state: RootState) => 
    interviewId ? state.chatMessages.byInterviewId[interviewId] || [] : []
  );

  // Debug logging for chat history issue
  console.log('🔍 CandidateDetail Debug:', {
    candidateId,
    interviewId,
    messagesCount: messages.length,
    hasInterview: !!interview,
    interviewStatus: interview?.status,
    candidateStatus: candidate?.interviewStatus
  });

  if (!candidate) {
    return <div>Candidate not found</div>;
  }

  const getMessageAvatar = (message: ChatMessage) => {
    switch (message.type) {
      case 'system':
      case 'question':
      case 'score':
        return <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#1890ff' }} />;
      case 'user':
        return <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#52c41a' }} />;
      default:
        return <Avatar icon={<RobotOutlined />} />;
    }
  };

  const renderMessageContent = (content: string) => {
    return content.split('\n').map((line, index) => (
      <div key={index}>
        {line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').split('<strong>').map((part, i) => {
          if (i % 2 === 0) {
            return <span key={i}>{part}</span>;
          } else {
            const [boldText, ...rest] = part.split('</strong>');
            return (
              <span key={i}>
                <strong>{boldText}</strong>
                {rest.join('</strong>')}
              </span>
            );
          }
        })}
      </div>
    ));
  };

  const getScoreColor = (score?: number) => {
    if (!score) return '#666';
    if (score >= 80) return '#52c41a';
    if (score >= 65) return '#1890ff';
    if (score >= 50) return '#faad14';
    return '#ff4d4f';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'green';
      case 'medium':
        return 'orange';
      case 'hard':
        return 'red';
      default:
        return 'default';
    }
  };

  const answeredQuestions = interview?.answers.length || 0;
  const totalQuestions = interview?.questions.length || 6;

  const averageTimePerQuestion = interview?.answers.length 
    ? interview.answers.reduce((sum, answer) => sum + answer.timeSpent, 0) / interview.answers.length
    : 0;

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card>
        <Space align="center" style={{ marginBottom: '16px' }}>
          <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
            Back to List
          </Button>
          <Title level={3} style={{ margin: 0 }}>
            {candidate.name}'s Interview Details
          </Title>
        </Space>

        <Row gutter={[16, 16]}>
          <Col span={24} md={8}>
            <Card title="Candidate Info" size="small">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Name">{candidate.name}</Descriptions.Item>
                <Descriptions.Item label="Email">{candidate.email}</Descriptions.Item>
                <Descriptions.Item label="Phone">{candidate.phone}</Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={candidate.interviewStatus === 'completed' ? 'success' : 'processing'}>
                    {candidate.interviewStatus.replace('_', ' ').toUpperCase()}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Interview Date">
                  {interview?.completedAt ? new Date(interview.completedAt).toLocaleString() : 'N/A'}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          <Col span={24} md={8}>
            <Card title="Performance Overview" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Statistic
                  title="Final Score"
                  value={candidate.finalScore || 0}
                  suffix="/100"
                  valueStyle={{ color: getScoreColor(candidate.finalScore) }}
                  prefix={<TrophyOutlined />}
                />
                <Progress 
                  percent={candidate.finalScore || 0} 
                  strokeColor={getScoreColor(candidate.finalScore)}
                  size="small"
                />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Statistic
                    title="Questions"
                    value={answeredQuestions}
                    suffix={`/${totalQuestions}`}
                    prefix={<CheckCircleOutlined />}
                  />
                  <Statistic
                    title="Avg Time"
                    value={Math.round(averageTimePerQuestion)}
                    suffix="s"
                    prefix={<ClockCircleOutlined />}
                  />
                </div>
              </Space>
            </Card>
          </Col>

          <Col span={24} md={8}>
            <Card title="Question Breakdown" size="small">
              {interview?.questions.map((question, index) => {
                const answer = interview.answers.find(a => a.questionId === question.id);
                return (
                  <div key={question.id} style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Space>
                        <Text strong>Q{index + 1}</Text>
                        <Tag color={getDifficultyColor(question.difficulty)}>
                          {question.difficulty.toUpperCase()}
                        </Tag>
                      </Space>
                      <Text strong style={{ color: getScoreColor(answer?.score) }}>
                        {answer?.score || 0}/100
                      </Text>
                    </div>
                    <Progress 
                      percent={answer?.score || 0} 
                      size="small" 
                      showInfo={false}
                      strokeColor={getScoreColor(answer?.score)}
                    />
                  </div>
                );
              }) || <Text type="secondary">No questions available</Text>}
            </Card>
          </Col>
        </Row>
      </Card>

      {candidate.finalSummary && (
        <Card title="AI Summary" extra={<FileTextOutlined />}>
          <Paragraph style={{ whiteSpace: 'pre-wrap', backgroundColor: '#f6f8fa', padding: '16px', borderRadius: '6px' }}>
            {candidate.finalSummary}
          </Paragraph>
        </Card>
      )}

      <Card title={`Chat History (${messages.length} messages)`}>
        {!interviewId ? (
          <Text type="secondary">No interview found for this candidate</Text>
        ) : messages.length > 0 ? (
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            <List
              dataSource={messages}
              renderItem={(message, index) => (
                <List.Item 
                  key={message.id} 
                  style={{ 
                    alignItems: 'flex-start',
                    padding: '12px 0',
                    borderBottom: index < messages.length - 1 ? '1px solid #f0f0f0' : 'none'
                  }}
                >
                  <List.Item.Meta
                    avatar={getMessageAvatar(message)}
                    title={
                      <Space>
                        <Text strong>
                          {message.type === 'user' ? candidate.name : 
                           message.type === 'system' ? 'System' : 'AI Assistant'}
                        </Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </Text>
                        {message.type === 'question' && (
                          <Tag color={getDifficultyColor(interview?.questions.find(q => q.id === message.questionId)?.difficulty || 'easy')}>
                            {interview?.questions.find(q => q.id === message.questionId)?.difficulty?.toUpperCase()}
                          </Tag>
                        )}
                        {message.type === 'score' && (
                          <Tag color="blue">EVALUATION</Tag>
                        )}
                      </Space>
                    }
                    description={
                      <div style={{ 
                        whiteSpace: 'pre-wrap', 
                        marginTop: '8px',
                        background: message.type === 'user' ? '#e6f7ff' : 
                                   message.type === 'question' ? '#fff2e6' :
                                   message.type === 'score' ? '#f0f9ff' : '#f9f9f9',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #f0f0f0'
                      }}>
                        {renderMessageContent(message.content)}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Text type="secondary">No chat history available yet</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Chat messages will appear here once the candidate starts the interview
            </Text>
          </div>
        )}
      </Card>
    </Space>
  );
};

export default CandidateDetail;