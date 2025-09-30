import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Upload, Button, message, Form, Input, Card, Typography, Space, Alert } from 'antd';
import { UploadOutlined, FileTextOutlined, InfoCircleOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd/es/upload/interface';
import { parseResume, validateFileType, formatFileSize } from '../../utils/resumeParser';
import { addCandidate } from '../../store/candidatesSlice';
import { setCurrentCandidate } from '../../store/appSlice';
import { ResumeData } from '../../types';
import { v4 as uuidv4 } from 'uuid';

const { Title, Text } = Typography;

const ResumeUpload: React.FC = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [parsedData, setParsedData] = useState<ResumeData | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showForm, setShowForm] = useState(false);

  const uploadProps: UploadProps = {
    beforeUpload: async (file) => {
      if (!validateFileType(file)) {
        message.error('Please upload only DOCX or DOC files. PDF files are not currently supported.');
        return false;
      }

      if (file.size > 10 * 1024 * 1024) {
        message.error('File size must be less than 10MB.');
        return false;
      }

      setLoading(true);
      try {
        const data = await parseResume(file);
        setParsedData(data);
        setUploadedFile(file);
        setShowForm(true);
        
        // Pre-fill form with extracted data
        form.setFieldsValue({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
        });

        message.success('Resume parsed successfully!');
      } catch (error) {
        message.error(`Error parsing resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }

      return false; // Prevent default upload behavior
    },
    showUploadList: false,
    accept: '.docx,.doc',
    maxCount: 1,
  };

  const handleSubmit = (values: { name: string; email: string; phone: string }) => {
    if (!parsedData || !uploadedFile) {
      message.error('Please upload a resume first.');
      return;
    }

    const candidateId = uuidv4();
    const candidate = {
      id: candidateId,
      name: values.name,
      email: values.email,
      phone: values.phone,
      resumeFile: uploadedFile,
      createdAt: new Date().toISOString(),
      interviewStatus: 'not_started' as const,
    };

    dispatch(addCandidate(candidate));
    dispatch(setCurrentCandidate(candidateId));
    message.success('Profile created successfully! You can now start the interview.');
  };

  const getMissingFields = () => {
    if (!parsedData) return [];
    
    const missing = [];
    if (!parsedData.name) missing.push('Name');
    if (!parsedData.email) missing.push('Email');
    if (!parsedData.phone) missing.push('Phone');
    
    return missing;
  };

  const missingFields = parsedData ? getMissingFields() : [];

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          <Title level={2}>Welcome to AI Interview Assistant</Title>
          <Text type="secondary">
            Upload your resume to get started. We'll extract your basic information and begin the interview process.
            <br /><br />
            <strong>📁 Supported formats:</strong> DOCX, DOC files only
            <br />
            <Text type="warning">⚠️ PDF files are not currently supported. Please convert to DOCX format.</Text>
          </Text>
        </div>

        <Card>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Upload {...uploadProps}>
              <Button 
                icon={<UploadOutlined />} 
                size="large" 
                loading={loading}
                block
              >
                {loading ? 'Parsing Resume...' : 'Upload Resume (DOCX/DOC)'}
              </Button>
            </Upload>

            {uploadedFile && (
              <Alert
                message="File Uploaded Successfully"
                description={
                  <Space>
                    <FileTextOutlined />
                    <span>{uploadedFile.name}</span>
                    <span>({formatFileSize(uploadedFile.size)})</span>
                  </Space>
                }
                type="success"
                showIcon
              />
            )}

            {missingFields.length > 0 && (
              <Alert
                message="Missing Information"
                description={`We couldn't extract the following fields: ${missingFields.join(', ')}. Please fill them in below.`}
                type="warning"
                showIcon
              />
            )}
          </Space>
        </Card>

        <Card 
          size="small" 
          style={{ backgroundColor: '#f6ffed', borderColor: '#b7eb8f' }}
        >
          <Space direction="vertical" size="small">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <InfoCircleOutlined style={{ color: '#52c41a' }} />
              <Text strong>Have a PDF resume?</Text>
            </div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Convert it to DOCX using:
              <ul style={{ margin: '4px 0', paddingLeft: '16px' }}>
                <li>Google Docs (upload PDF → download as DOCX)</li>
                <li>Microsoft Word Online (free)</li>
                <li>Online converters like SmallPDF or ILovePDF</li>
              </ul>
            </Text>
          </Space>
        </Card>

        {showForm && (
          <Card title="Complete Your Profile">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              requiredMark={false}
            >
              <Form.Item
                label="Full Name"
                name="name"
                rules={[{ required: true, message: 'Please enter your full name' }]}
              >
                <Input placeholder="Enter your full name" />
              </Form.Item>

              <Form.Item
                label="Email Address"
                name="email"
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input placeholder="Enter your email address" />
              </Form.Item>

              <Form.Item
                label="Phone Number"
                name="phone"
                rules={[{ required: true, message: 'Please enter your phone number' }]}
              >
                <Input placeholder="Enter your phone number" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" size="large" block>
                  Start Interview
                </Button>
              </Form.Item>
            </Form>
          </Card>
        )}
      </Space>
    </div>
  );
};

export default ResumeUpload;