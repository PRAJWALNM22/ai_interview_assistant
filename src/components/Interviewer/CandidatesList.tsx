import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Card, 
  Table, 
  Input, 
  Select, 
  Space, 
  Tag, 
  Button, 
  Typography, 
  Badge,
  Avatar,
  Modal,
  message
} from 'antd';
import { 
  SearchOutlined, 
  UserOutlined, 
  EyeOutlined,
  TrophyOutlined,
  CalendarOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { selectCandidatesWithStats } from '../../store/selectors';
import { Candidate } from '../../types';

const { Title } = Typography;
const { Option } = Select;

interface Props {
  onSelectCandidate: (candidateId: string) => void;
}

interface CandidateWithStats extends Candidate {
  interviewDate?: string;
}

const CandidatesList: React.FC<Props> = ({ onSelectCandidate }) => {
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'date'>('score');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const candidatesWithStats = useSelector(selectCandidatesWithStats);

  const filteredAndSortedCandidates = useMemo(() => {
    let filtered = candidatesWithStats.filter(candidate => {
      const matchesSearch = candidate.name.toLowerCase().includes(searchText.toLowerCase()) ||
                           candidate.email.toLowerCase().includes(searchText.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || candidate.interviewStatus === filterStatus;
      
      return matchesSearch && matchesStatus;
    });

    // Sort candidates
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return (b.finalScore || 0) - (a.finalScore || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          const dateA = new Date(a.interviewDate || 0).getTime();
          const dateB = new Date(b.interviewDate || 0).getTime();
          return dateB - dateA;
        default:
          return 0;
      }
    });

    return filtered;
  }, [candidatesWithStats, searchText, sortBy, filterStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'processing';
      case 'paused':
        return 'warning';
      case 'not_started':
        return 'default';
      default:
        return 'default';
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return '#666';
    if (score >= 80) return '#52c41a';
    if (score >= 65) return '#1890ff';
    if (score >= 50) return '#faad14';
    return '#ff4d4f';
  };

  const columns: ColumnsType<CandidateWithStats> = [
    {
      title: 'Candidate',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 500 }}>{name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.email}</div>
          </div>
        </Space>
      ),
      width: '30%',
    },
    {
      title: 'Score',
      dataIndex: 'finalScore',
      key: 'finalScore',
      render: (score) => (
        score !== undefined ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrophyOutlined style={{ color: getScoreColor(score) }} />
            <Badge
              count={`${score}/100`}
              style={{ 
                backgroundColor: getScoreColor(score),
                fontSize: '12px',
                fontWeight: 600
              }}
            />
          </div>
        ) : (
          <span style={{ color: '#999' }}>-</span>
        )
      ),
      sorter: true,
      width: '15%',
    },
    {
      title: 'Status',
      dataIndex: 'interviewStatus',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status.replace('_', ' ').toUpperCase()}
        </Tag>
      ),
      width: '15%',
    },
    {
      title: 'Interview Date',
      dataIndex: 'interviewDate',
      key: 'interviewDate',
      render: (date) => (
        date ? (
          <Space>
            <CalendarOutlined />
            {new Date(date).toLocaleDateString()}
          </Space>
        ) : (
          <span style={{ color: '#999' }}>-</span>
        )
      ),
      width: '20%',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => onSelectCandidate(record.id)}
          disabled={record.interviewStatus === 'not_started'}
        >
          View Details
        </Button>
      ),
      width: '20%',
    },
  ];

  const completedInterviews = candidatesWithStats.filter(c => c.interviewStatus === 'completed').length;
  const averageScore = candidatesWithStats
    .filter(c => c.finalScore !== undefined)
    .reduce((sum, c) => sum + (c.finalScore || 0), 0) / completedInterviews || 0;

  const handleClearAllData = () => {
    Modal.confirm({
      title: 'Clear All Data',
      content: 'Are you sure you want to clear all interview data? This action cannot be undone.',
      okText: 'Yes, Clear All',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        // Import the clear actions
        import('../../store/candidatesSlice').then(({ clearAllData: clearCandidates }) => {
          dispatch(clearCandidates());
        });
        import('../../store/interviewsSlice').then(({ clearAllData: clearInterviews }) => {
          dispatch(clearInterviews());
        });
        import('../../store/chatSlice').then(({ clearAllData: clearChat }) => {
          dispatch(clearChat());
        });
        message.success('All data has been cleared successfully!');
      },
    });
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card>
        <Title level={2}>Interview Dashboard</Title>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px', 
          marginBottom: '24px' 
        }}>
          <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f0f2f5', borderRadius: '8px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
              {candidatesWithStats.length}
            </div>
            <div style={{ color: '#666' }}>Total Candidates</div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f0f2f5', borderRadius: '8px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
              {completedInterviews}
            </div>
            <div style={{ color: '#666' }}>Completed</div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f0f2f5', borderRadius: '8px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
              {averageScore.toFixed(0)}
            </div>
            <div style={{ color: '#666' }}>Average Score</div>
          </div>
        </div>

        <Space size="middle" style={{ marginBottom: '16px', width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <Input
              placeholder="Search candidates..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 250 }}
            />
            
            <Select
              placeholder="Filter by status"
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: 150 }}
            >
              <Option value="all">All Status</Option>
              <Option value="completed">Completed</Option>
              <Option value="in_progress">In Progress</Option>
              <Option value="paused">Paused</Option>
              <Option value="not_started">Not Started</Option>
            </Select>
          </Space>

          <Space>
            <Select
              placeholder="Sort by"
              value={sortBy}
              onChange={setSortBy}
              style={{ width: 120 }}
            >
              <Option value="score">Score</Option>
              <Option value="name">Name</Option>
              <Option value="date">Date</Option>
            </Select>
            
            <Button 
              danger 
              icon={<DeleteOutlined />}
              onClick={handleClearAllData}
              disabled={candidatesWithStats.length === 0}
            >
              Clear All Data
            </Button>
          </Space>
        </Space>

        <Table
          columns={columns}
          dataSource={filteredAndSortedCandidates}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} candidates`,
          }}
        />
      </Card>
    </Space>
  );
};

export default CandidatesList;