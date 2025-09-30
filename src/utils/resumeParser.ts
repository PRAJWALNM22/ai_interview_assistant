import * as mammoth from 'mammoth';
import { ResumeData } from '../types';

export const parseResume = async (file: File): Promise<ResumeData> => {
  let extractedText = '';
  
  try {
    if (
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.type === 'application/msword'
    ) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      extractedText = result.value;
    } else {
      throw new Error('Unsupported file format. Please upload DOCX or DOC files only.');
    }
  } catch (error) {
    throw new Error(`Failed to parse resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return {
    name: extractName(extractedText),
    email: extractEmail(extractedText),
    phone: extractPhone(extractedText),
    extractedText,
  };
};

const extractName = (text: string): string | undefined => {
  // Common patterns for names at the beginning of resumes
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // First non-empty line is often the name
  const firstLine = lines[0];
  if (firstLine && firstLine.length < 50 && /^[A-Za-z\s.'-]+$/.test(firstLine)) {
    return firstLine;
  }
  
  // Look for "Name:" pattern
  const nameMatch = text.match(/(?:Name|Full Name):\s*([A-Za-z\s.'-]+)/i);
  if (nameMatch) {
    return nameMatch[1].trim();
  }
  
  return undefined;
};

const extractEmail = (text: string): string | undefined => {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const emails = text.match(emailRegex);
  return emails ? emails[0] : undefined;
};

const extractPhone = (text: string): string | undefined => {
  // Various phone number patterns
  const phonePatterns = [
    /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, // 123-456-7890 or 123.456.7890 or 1234567890
    /\b\(\d{3}\)\s*\d{3}[-.]?\d{4}\b/g, // (123) 456-7890
    /\b\+\d{1,3}[-.\s]?\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, // +1-123-456-7890
  ];
  
  for (const pattern of phonePatterns) {
    const matches = text.match(pattern);
    if (matches) {
      return matches[0];
    }
  }
  
  return undefined;
};

export const validateFileType = (file: File): boolean => {
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword' // .doc
  ];
  
  return allowedTypes.includes(file.type);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

