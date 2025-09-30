import React, { useEffect, Suspense } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ConfigProvider, Layout, Tabs, Spin } from 'antd';
import { RootState } from './store';
import { setActiveTab, showWelcomeBack } from './store/appSlice';
import WelcomeBackModal from './components/common/WelcomeBackModal';
import './App.css';

// Lazy load components for better performance
const IntervieweeTab = React.lazy(() => import('./components/Interviewee/IntervieweeTab'));
const InterviewerTab = React.lazy(() => import('./components/Interviewer/InterviewerTab'));

const { TabPane } = Tabs;
const { Header, Content } = Layout;

function App() {
  const dispatch = useDispatch();
  const { activeTab, currentInterviewId } = useSelector((state: RootState) => state.app);
  const currentInterview = useSelector((state: RootState) => 
    currentInterviewId ? state.interviews.byId[currentInterviewId] : undefined
  );

  useEffect(() => {
    // Check for unfinished interviews on app load
    if (currentInterview && currentInterview.status === 'paused') {
      dispatch(showWelcomeBack());
    }
  }, [currentInterview, dispatch]);

  const handleTabChange = (key: string) => {
    dispatch(setActiveTab(key as 'interviewee' | 'interviewer'));
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
        },
      }}
    >
      <Layout className="app-layout">
        <Header className="app-header">
          <div className="logo">
            <h1 style={{ color: 'white', margin: 0 }}>AI Interview Assistant</h1>
          </div>
        </Header>
        <Content className="app-content">
          <Tabs 
            activeKey={activeTab} 
            onChange={handleTabChange}
            size="large"
            className="main-tabs"
          >
            <TabPane tab="Interviewee" key="interviewee">
              <Suspense fallback={
                <div style={{ textAlign: 'center', padding: '50px' }}>
                  <Spin size="large" tip="Loading..." />
                </div>
              }>
                <IntervieweeTab />
              </Suspense>
            </TabPane>
            <TabPane tab="Interviewer Dashboard" key="interviewer">
              <Suspense fallback={
                <div style={{ textAlign: 'center', padding: '50px' }}>
                  <Spin size="large" tip="Loading..." />
                </div>
              }>
                <InterviewerTab />
              </Suspense>
            </TabPane>
          </Tabs>
        </Content>
      </Layout>
      <WelcomeBackModal />
    </ConfigProvider>
  );
}

export default App;
