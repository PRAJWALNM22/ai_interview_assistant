import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Card, 
  Input, 
  Button, 
  Avatar, 
  Typography, 
  Space, 
  Progress, 
  Tag, 
  message, 
  Spin
} from 'antd';
import { 
  RobotOutlined, 
  UserOutlined, 
  ClockCircleOutlined, 
  SendOutlined, 
  PlayCircleOutlined,
  PauseCircleOutlined 
} from '@ant-design/icons';
import { RootState } from '../../store';
import { addMessage } from '../../store/chatSlice';
import { 
  setQuestions, 
  addAnswer, 
  nextQuestion, 
  updateTimer, 
  startTimer, 
  pauseInterview, 
  resumeInterview, 
  completeInterview,
  updateInterview
} from '../../store/interviewsSlice';
import { setFinalScore, updateCandidate } from '../../store/candidatesSlice';
import { setActiveTab } from '../../store/appSlice';
import { aiService } from '../../services/aiService';
import { ChatMessage, Question, Answer } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import Confetti from '../ui/Confetti';
import { soundUtils } from '../../utils/soundUtils';

const { TextArea } = Input;
const { Text, Title } = Typography;

interface Props {
  candidateId: string;
  interviewId: string;
}

const ChatInterface: React.FC<Props> = ({ candidateId, interviewId }) => {
  const dispatch = useDispatch();
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const answerStartTime = useRef<number>(0);

  const interview = useSelector((state: RootState) => state.interviews.byId[interviewId]);
  const candidate = useSelector((state: RootState) => state.candidates.byId[candidateId]);
  const messages = useSelector((state: RootState) => state.chatMessages.byInterviewId[interviewId] || []);

  const currentQuestion = interview?.questions[interview.currentQuestionIndex];
  const isInterviewComplete = interview?.status === 'completed' || (interview?.currentQuestionIndex >= (interview?.questions.length || 0));
  const totalQuestions = interview?.questions.length || 6;
  // Progress calculation: show 100% when interview is complete or all questions answered
  const completedAnswers = interview?.answers.length || 0;
  const progress = (interview?.status === 'completed' || completedAnswers >= totalQuestions) ? 100 : (completedAnswers / totalQuestions) * 100;
  
  // Debug logging (reduced to only status changes)
  useEffect(() => {
    if (interview?.status) {
      console.log('🔍 Interview status changed:', interview.status, '| Progress:', Math.round(progress) + '%');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interview?.status]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const completeInterviewProcess = React.useCallback(async () => {
    console.log('🏁 Starting interview completion process...');
    console.log('Current interview state:', {
      currentIndex: interview?.currentQuestionIndex,
      totalQuestions: interview?.questions.length,
      answersCount: interview?.answers.length
    });
    
    setLoading(true);
    try {
      if (!interview) {
        console.error('❌ No interview found, cannot complete');
        return;
      }
      
      console.log('🤖 Generating final summary...');
      const summary = await aiService.generateFinalSummary(interview.questions, interview.answers);
      console.log('✅ AI Summary generated:', summary);
      
      console.log('📝 Updating interview status to completed...');
      dispatch(completeInterview(interviewId));
      
      console.log('🎯 Setting final score for candidate...');
      dispatch(setFinalScore({ 
        candidateId, 
        score: summary.score, 
        summary: summary.summary 
      }));
      
      console.log('💬 Adding completion message to chat...');
      const completionMessage: ChatMessage = {
        id: uuidv4(),
        type: 'system',
        content: `🎉 **Interview Complete!**\n\nFinal Score: ${summary.score}/100\n\n${summary.summary}`,
        timestamp: new Date().toISOString(),
      };
      dispatch(addMessage({ interviewId, message: completionMessage }));
      
      console.log('🎉 Interview completion process finished successfully!');
      message.success('Interview completed successfully! 🎉');
    } catch (error) {
      console.error('❌ Error in interview completion:', error);
      message.error('Failed to generate final summary. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, [interview, interviewId, candidateId, dispatch]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleTimeUpCallback = React.useCallback(async () => {
    if (!currentQuestion) return;
    
    message.warning('Time\'s up! Submitting your current answer.');
    
    const timeSpent = Math.floor((Date.now() - answerStartTime.current) / 1000);
    setLoading(true);

    try {
      const answerText = currentAnswer.trim() || '[No answer provided - time expired]';
      
      // Add user's answer to chat (even if empty)
      const answerMessage: ChatMessage = {
        id: uuidv4(),
        type: 'user',
        content: answerText,
        timestamp: new Date().toISOString(),
        questionId: currentQuestion.id,
      };
      dispatch(addMessage({ interviewId, message: answerMessage }));

      const evaluation = await aiService.evaluateAnswer(currentQuestion, answerText, timeSpent);
      
      const answer: Answer = {
        questionId: currentQuestion.id,
        text: answerText,
        score: evaluation.score,
        feedback: evaluation.feedback,
        timeSpent,
        submittedAt: new Date().toISOString(),
      };
      
      dispatch(addAnswer({ interviewId, answer }));
      
      const feedbackMessage: ChatMessage = {
        id: uuidv4(),
        type: 'score',
        content: `**Score: ${evaluation.score}/100**\n\n${evaluation.feedback}`,
        timestamp: new Date().toISOString(),
        questionId: currentQuestion.id,
      };
      dispatch(addMessage({ interviewId, message: feedbackMessage }));

      dispatch(updateTimer({ interviewId, remainingTime: 0, isRunning: false }));
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const currentIndex = interview.currentQuestionIndex;
      const nextIndex = currentIndex + 1;
      
      if (nextIndex < interview.questions.length) {
        dispatch(nextQuestion(interviewId));
        const nextQ = interview.questions[nextIndex];
        setTimeout(() => {
          const questionMessage: ChatMessage = {
            id: uuidv4(),
            type: 'question',
            content: `**Question ${nextIndex + 1}/${interview.questions.length}** (${nextQ.difficulty.toUpperCase()} - ${nextQ.timeLimit}s)\n\n${nextQ.text}`,
            timestamp: new Date().toISOString(),
            questionId: nextQ.id,
          };
          
          dispatch(addMessage({ interviewId, message: questionMessage }));
          dispatch(startTimer({ interviewId, timeLimit: nextQ.timeLimit }));
          answerStartTime.current = Date.now();
        }, 100);
      } else {
        await completeInterviewProcess();
      }
      
      setCurrentAnswer('');
    } catch (error) {
      message.error('Failed to process time up. Please refresh and continue.');
    } finally {
      setLoading(false);
    }
  }, [currentQuestion, currentAnswer, interview, interviewId, dispatch, completeInterviewProcess]);

  // Timer effect with sound alerts
  useEffect(() => {
    if (interview?.timerState.isRunning && interview?.timerState.remainingTime > 0) {
      const interval = setInterval(() => {
        const newRemainingTime = interview.timerState.remainingTime - 1;
        
        // Play sound effects based on remaining time
        if (newRemainingTime === 30) {
          soundUtils.playTimerWarningSound();
        } else if (newRemainingTime <= 10 && newRemainingTime > 0) {
          soundUtils.playTimerUrgentSound();
        }
        
        if (newRemainingTime <= 0) {
          handleTimeUpCallback();
        } else {
          dispatch(updateTimer({ 
            interviewId, 
            remainingTime: newRemainingTime, 
            isRunning: true 
          }));
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [interview?.timerState.isRunning, interview?.timerState.remainingTime, interviewId, dispatch, handleTimeUpCallback]);

  // Play celebration sound when interview completes
  useEffect(() => {
    if (isInterviewComplete && interview?.status === 'completed') {
      soundUtils.playCelebrationSound();
    }
  }, [isInterviewComplete, interview?.status]);

  const startInterview = async () => {
    setLoading(true);
    try {
      const questions = await aiService.generateQuestions();
      dispatch(setQuestions({ interviewId, questions }));
      dispatch(updateInterview({ 
        id: interviewId, 
        updates: { 
          status: 'in_progress', 
          startedAt: new Date().toISOString() 
        } 
      }));
      dispatch(updateCandidate({ 
        id: candidateId, 
        updates: { interviewStatus: 'in_progress' } 
      }));

      // Add welcome message and first question
      const welcomeMessage: ChatMessage = {
        id: uuidv4(),
        type: 'system',
        content: `Hello ${candidate?.name}! Welcome to your technical interview. You'll be asked 6 questions of varying difficulty. Let's begin!`,
        timestamp: new Date().toISOString(),
      };
      dispatch(addMessage({ interviewId, message: welcomeMessage }));
      
      // Start first question
      askCurrentQuestion(questions[0]);
    } catch (error) {
      message.error('Failed to start interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const askCurrentQuestion = (question: Question) => {
    const questionMessage: ChatMessage = {
      id: uuidv4(),
      type: 'question',
      content: `**Question ${interview.currentQuestionIndex + 1}/${totalQuestions}** (${question.difficulty.toUpperCase()} - ${question.timeLimit}s)\n\n${question.text}`,
      timestamp: new Date().toISOString(),
      questionId: question.id,
    };
    
    dispatch(addMessage({ interviewId, message: questionMessage }));
    dispatch(startTimer({ interviewId, timeLimit: question.timeLimit }));
    answerStartTime.current = Date.now();
  };

  const handleSubmitAnswer = async () => {
    if (!currentQuestion || currentAnswer.trim() === '') {
      message.warning('Please provide an answer before submitting.');
      return;
    }

    const timeSpent = Math.floor((Date.now() - answerStartTime.current) / 1000);
    setLoading(true);

    try {
      // Add user's answer to chat
      const answerMessage: ChatMessage = {
        id: uuidv4(),
        type: 'user',
        content: currentAnswer,
        timestamp: new Date().toISOString(),
        questionId: currentQuestion.id,
      };
      dispatch(addMessage({ interviewId, message: answerMessage }));

      // Evaluate answer with AI
      const evaluation = await aiService.evaluateAnswer(currentQuestion, currentAnswer, timeSpent);
      
      const answer: Answer = {
        questionId: currentQuestion.id,
        text: currentAnswer,
        score: evaluation.score,
        feedback: evaluation.feedback,
        timeSpent,
        submittedAt: new Date().toISOString(),
      };
      
      dispatch(addAnswer({ interviewId, answer }));
      
      // Add AI feedback to chat
      const feedbackMessage: ChatMessage = {
        id: uuidv4(),
        type: 'score',
        content: `**Score: ${evaluation.score}/100**\n\n${evaluation.feedback}`,
        timestamp: new Date().toISOString(),
        questionId: currentQuestion.id,
      };
      dispatch(addMessage({ interviewId, message: feedbackMessage }));

      // Stop timer
      dispatch(updateTimer({ interviewId, remainingTime: 0, isRunning: false }));
      
      // Move to next question or complete interview
      await new Promise(resolve => setTimeout(resolve, 1500)); // Brief pause before next question
      
      const currentIndex = interview.currentQuestionIndex;
      const nextIndex = currentIndex + 1;
      
      console.log('🔍 Question progression check:', {
        currentIndex,
        nextIndex,
        totalQuestions: interview.questions.length,
        shouldContinue: nextIndex < interview.questions.length
      });
      
      if (nextIndex < interview.questions.length) {
        console.log('➡️ Moving to next question:', nextIndex + 1);
        dispatch(nextQuestion(interviewId));
        // Use the next index to get the question since state update might be async
        const nextQ = interview.questions[nextIndex];
        // Update the askCurrentQuestion to use the nextIndex
        setTimeout(() => {
          const questionMessage: ChatMessage = {
            id: uuidv4(),
            type: 'question',
            content: `**Question ${nextIndex + 1}/${totalQuestions}** (${nextQ.difficulty.toUpperCase()} - ${nextQ.timeLimit}s)\n\n${nextQ.text}`,
            timestamp: new Date().toISOString(),
            questionId: nextQ.id,
          };
          
          dispatch(addMessage({ interviewId, message: questionMessage }));
          dispatch(startTimer({ interviewId, timeLimit: nextQ.timeLimit }));
          answerStartTime.current = Date.now();
        }, 100);
      } else {
        console.log('🏁 All questions completed! Advancing to completion...');
        // Advance the question index to show 100% progress
        dispatch(nextQuestion(interviewId));
        console.log('Final state before completion:', {
          answersCount: interview.answers.length + 1, // +1 because we just added an answer
          questionsCount: interview.questions.length,
          currentIndex: interview.currentQuestionIndex + 1 // +1 because we just advanced
        });
        setTimeout(async () => {
          await completeInterviewProcess();
        }, 100);
      }
      
      setCurrentAnswer('');
    } catch (error) {
      message.error('Failed to submit answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  const handlePauseResume = () => {
    if (interview?.status === 'paused') {
      dispatch(resumeInterview(interviewId));
      message.info('Interview resumed.');
    } else {
      dispatch(pauseInterview(interviewId));
      message.info('Interview paused.');
    }
  };


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
    // Simple markdown-like rendering for bold text
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

  if (!interview) {
    return <Spin size="large" />;
  }

  // Removed excessive debug logging to improve performance

  return (
    <Card title={`Interview with ${candidate?.name}`}>
      {interview.questions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Title level={3}>Ready to start your interview?</Title>
          <Text type="secondary">
            You'll be asked 6 technical questions covering React and Node.js. Each question has a time limit.
          </Text>
          <br /><br />
          <Button 
            type="primary" 
            size="large" 
            icon={<PlayCircleOutlined />}
            onClick={startInterview}
            loading={loading}
          >
            Start Interview
          </Button>
        </div>
      ) : (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {/* Progress and Timer */}
          <div style={{ padding: '0 16px' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong>Progress: {interview.currentQuestionIndex}/{totalQuestions}</Text>
                {interview.timerState.isRunning && (
                  <div 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: interview.timerState.remainingTime <= 10 
                        ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)'
                        : interview.timerState.remainingTime <= 30
                        ? 'linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)'
                        : 'linear-gradient(135deg, #48dbfb 0%, #0abde3 100%)',
                      borderRadius: '20px',
                      padding: '8px 16px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      animation: interview.timerState.remainingTime <= 10 ? 'timerPulse 1s infinite' : 'none'
                    }}
                  >
                    <ClockCircleOutlined style={{ color: 'white', fontSize: '16px', marginRight: '8px' }} />
                    <Text 
                      strong 
                      style={{ 
                        color: 'white',
                        fontSize: '16px',
                        fontFamily: 'monospace',
                        minWidth: '45px'
                      }}
                      className={interview.timerState.remainingTime <= 10 ? 'timer-critical' : ''}
                    >
                      {formatTime(interview.timerState.remainingTime)}
                    </Text>
                    <Button 
                      size="small"
                      type="text" 
                      icon={interview.status === 'paused' ? <PlayCircleOutlined /> : <PauseCircleOutlined />}
                      onClick={handlePauseResume}
                      style={{
                        color: 'white',
                        border: 'none',
                        marginLeft: '8px',
                        height: '28px'
                      }}
                    >
                      {interview.status === 'paused' ? 'Resume' : 'Pause'}
                    </Button>
                  </div>
                )}
              </div>
              <Progress percent={progress} status={isInterviewComplete ? 'success' : 'active'} />
            </Space>
          </div>

          {/* Enhanced Chat Messages */}
          <div 
            className="chat-container"
            style={{ 
              height: '450px', 
              overflowY: 'auto', 
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
              borderRadius: '12px',
              padding: '16px',
              border: 'none',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            {messages.map((message, index) => (
              <div 
                key={message.id}
                className={`message-bubble ${message.type === 'user' ? 'user-message' : 'ai-message'}`}
                style={{
                  display: 'flex',
                  marginBottom: '16px',
                  justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                  animation: `fadeInUp 0.3s ease-out ${index * 0.1}s both`
                }}
              >
                {message.type !== 'user' && (
                  <div style={{ marginRight: '8px', alignSelf: 'flex-end' }}>
                    {getMessageAvatar(message)}
                  </div>
                )}
                
                <div 
                  style={{
                    maxWidth: '70%',
                    padding: '12px 16px',
                    borderRadius: message.type === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: message.type === 'user' 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                      : message.type === 'question'
                      ? 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
                      : message.type === 'score'
                      ? 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
                      : '#ffffff',
                    color: message.type === 'user' ? 'white' : '#2c3e50',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    position: 'relative'
                  }}
                >
                  {/* Message Header */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: message.type === 'user' ? '0' : '8px'
                  }}>
                    {message.type !== 'user' && (
                      <Space>
                        <Text strong style={{ 
                          color: '#2c3e50',
                          fontSize: '14px'
                        }}>
                          {message.type === 'question' ? '🤖 Interview Question' : message.type === 'score' ? '📊 AI Evaluation' : '💬 AI Assistant'}
                        </Text>
                        {message.type === 'question' && (
                          <Tag 
                            color={currentQuestion?.difficulty === 'easy' ? 'green' : currentQuestion?.difficulty === 'medium' ? 'orange' : 'red'}
                            style={{ fontSize: '10px', fontWeight: 'bold' }}
                          >
                            {currentQuestion?.difficulty?.toUpperCase()}
                          </Tag>
                        )}
                      </Space>
                    )}
                    <Text 
                      type="secondary" 
                      style={{ 
                        fontSize: '11px',
                        color: message.type === 'user' ? 'rgba(255,255,255,0.7)' : 'rgba(44,62,80,0.6)'
                      }}
                    >
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </Text>
                  </div>
                  
                  {/* Message Content */}
                  <div style={{ 
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.5',
                    fontSize: '14px'
                  }}>
                    {renderMessageContent(message.content)}
                  </div>
                  
                  {/* Message Tail */}
                  <div 
                    style={{
                      position: 'absolute',
                      bottom: '8px',
                      [message.type === 'user' ? 'right' : 'left']: '-6px',
                      width: '12px',
                      height: '12px',
                      background: message.type === 'user' 
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                        : message.type === 'question'
                        ? 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
                        : message.type === 'score'
                        ? 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
                        : '#ffffff',
                      transform: message.type === 'user' ? 'rotate(45deg)' : 'rotate(-45deg)',
                      borderRadius: '2px'
                    }}
                  />
                </div>
                
                {message.type === 'user' && (
                  <div style={{ marginLeft: '8px', alignSelf: 'flex-end' }}>
                    {getMessageAvatar(message)}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Enhanced Answer Input */}
          {currentQuestion && !isInterviewComplete && interview.status !== 'paused' && (
            <div 
              className="chat-input-container"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                borderRadius: '16px',
                padding: '20px',
                border: '2px solid #e9ecef',
                boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ marginBottom: '12px' }}>
                <Text strong style={{ color: '#495057', fontSize: '16px' }}>
                  💭 Your Answer
                </Text>
                <Text type="secondary" style={{ marginLeft: '8px', fontSize: '14px' }}>
                  ({currentAnswer.length} characters)
                </Text>
              </div>
              <TextArea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Share your thoughts and technical insights here... Be specific and detailed!"
                rows={4}
                disabled={loading || !interview.timerState.isRunning}
                style={{
                  borderRadius: '12px',
                  border: '2px solid #dee2e6',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  resize: 'vertical',
                  transition: 'all 0.3s ease',
                  background: '#ffffff'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102,126,234,0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#dee2e6';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <div style={{ 
                marginTop: '16px', 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    💡 Tip: Include technical terms and explain your reasoning
                  </Text>
                </div>
                <Button
                  type="primary"
                  size="large"
                  icon={<SendOutlined />}
                  onClick={handleSubmitAnswer}
                  loading={loading}
                  disabled={!interview.timerState.isRunning || currentAnswer.trim().length === 0}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    height: '44px',
                    paddingLeft: '24px',
                    paddingRight: '24px',
                    fontWeight: '600',
                    boxShadow: '0 4px 15px rgba(102,126,234,0.3)',
                    transform: 'translateY(0)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    const target = e.currentTarget as HTMLButtonElement;
                    if (!target.disabled) {
                      target.style.transform = 'translateY(-2px)';
                      target.style.boxShadow = '0 6px 20px rgba(102,126,234,0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    const target = e.currentTarget as HTMLButtonElement;
                    target.style.transform = 'translateY(0)';
                    target.style.boxShadow = '0 4px 15px rgba(102,126,234,0.3)';
                  }}
                >
                  Submit Answer
                </Button>
              </div>
            </div>
          )}

          {isInterviewComplete && (
            <>
              <Confetti active={true} particleCount={150} duration={8000} />
              <div 
                className="interview-complete"
                style={{ 
                  textAlign: 'center', 
                  padding: '32px',
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  borderRadius: '16px',
                  color: 'white',
                  boxShadow: '0 8px 32px rgba(240, 147, 251, 0.3)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
              <div 
                className="celebration-emoji"
                style={{ fontSize: '48px', marginBottom: '16px', position: 'relative', zIndex: 1 }}
              >
                🎉
              </div>
              <Title 
                level={2} 
                className="celebration-text"
                style={{ color: 'white', marginBottom: '24px', position: 'relative', zIndex: 1 }}
              >
                🎉 Interview Complete!
              </Title>
              <Text 
                className="celebration-text"
                style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', display: 'block', marginBottom: '24px', position: 'relative', zIndex: 1 }}
              >
                Thank you for completing the interview! Your responses have been evaluated and your results are available in the Interviewer Dashboard.
              </Text>
              
              {(candidate?.finalScore !== undefined || (interview?.answers && interview.answers.length > 0)) && (
                <div style={{ 
                  background: 'rgba(255,255,255,0.2)', 
                  borderRadius: '12px', 
                  padding: '16px', 
                  marginBottom: '24px',
                  backdropFilter: 'blur(10px)',
                  position: 'relative',
                  zIndex: 1
                }}>
                  <Title level={3} style={{ color: 'white', margin: '0 0 8px 0' }}>
                    Your Score: {candidate?.finalScore || 'Calculating...'}/100
                  </Title>
                  <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                    {!candidate?.finalScore ? 'Your final score is being calculated...' :
                     candidate.finalScore >= 80 ? '🎆 Excellent Performance!' : 
                     candidate.finalScore >= 65 ? '💪 Good Job!' : 
                     candidate.finalScore >= 50 ? '😊 Not Bad!' : '📚 Keep Learning!'}
                  </Text>
                  <div style={{ marginTop: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                    Questions answered: {interview?.answers.length || 0}/{totalQuestions}
                  </div>
                </div>
              )}
              
              <div style={{ marginTop: '16px', position: 'relative', zIndex: 1 }}>
                <Button
                  type="primary"
                  size="large"
                  onClick={() => dispatch(setActiveTab('interviewer'))}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    height: '48px',
                    paddingLeft: '24px',
                    paddingRight: '24px',
                    fontWeight: '600',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                  }}
                >
                  📊 View Dashboard
                </Button>
              </div>
              </div>
            </>
          )}
        </Space>
      )}
    </Card>
  );
};

export default ChatInterface;
