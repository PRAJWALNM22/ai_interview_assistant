# 🚀 AI Interview Assistant

**A production-ready, AI-powered interview application built with React, TypeScript, and Google Gemini AI.**

[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue.svg)](https://www.typescriptlang.org/)
[![Gemini AI](https://img.shields.io/badge/Google-Gemini%20AI-orange.svg)](https://ai.google.dev/)
[![Production Ready](https://img.shields.io/badge/Production-Ready-green.svg)](#deployment)

## ✨ Features

### 🤖 **AI-Powered Intelligence**
- **Dynamic Question Generation**: Role-specific questions powered by Gemini AI
- **Real-time Answer Evaluation**: Intelligent scoring with detailed feedback
- **Comprehensive Summaries**: AI-generated interview performance reports
- **Adaptive Difficulty**: Questions adjust based on role and complexity

### 📊 **Professional Interview Experience**
- **Timer Management**: Question-specific time limits with audio alerts
- **Progress Tracking**: Real-time progress indicators and completion status
- **Resume Processing**: Automatic DOCX/DOC file parsing and data extraction
- **Celebration Effects**: Engaging completion animations and sound effects

### 🎛️ **Interviewer Dashboard**
- **Candidate Management**: Search, filter, and sort candidates
- **Performance Analytics**: Visual metrics and scoring comparisons
- **Interview Transcripts**: Complete conversation history with timestamps
- **Data Export**: Easy-to-copy summaries and results

### 🔧 **Enterprise Features**
- **Data Persistence**: Redux Persist with automatic state management
- **Fallback Systems**: Graceful degradation when AI services are unavailable
- **Error Boundaries**: Robust error handling and recovery
- **Mobile Responsive**: Works seamlessly across all device sizes

## 🏗️ Architecture

### **Tech Stack**
- **Frontend**: React 19.1.1 with TypeScript 4.9.5
- **State Management**: Redux Toolkit with Redux Persist
- **UI Framework**: Ant Design 5.27.4
- **AI Integration**: Google Gemini AI (2.5-flash model)
- **File Processing**: Mammoth.js for document parsing
- **Build System**: Create React App with production optimizations

### **Performance Optimizations**
- ✅ Code splitting with lazy loading
- ✅ Memoized Redux selectors
- ✅ Bundle size optimization
- ✅ Production build compression
- ✅ Efficient re-render prevention

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16+ 
- **npm** or **yarn**
- **Google Gemini AI API key** ([Get Free Key](https://makersuite.google.com/app/apikey))

### Installation

```bash
# Clone repository
git clone <repository-url>
cd ai-interview-assistant

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and add your Gemini API key

# Start development server
npm start
```

**🌟 App will be available at [http://localhost:3000](http://localhost:3000)**

## 🔐 Environment Configuration

### Development (`.env`)
```bash
REACT_APP_GEMINI_API_KEY="your-development-key"
REACT_APP_ENV=development
REACT_APP_DEBUG=true
```

### Production (`.env.production`)
```bash
REACT_APP_GEMINI_API_KEY="your-production-key"
REACT_APP_ENV=production
REACT_APP_DEBUG=false
GENERATE_SOURCEMAP=false
```

## 📦 Production Deployment

### Build for Production
```bash
# Create optimized production build
npm run build

# Analyze bundle size (optional)
npm run build:analyze

# Test production build locally
npm run deploy
```

### Deployment Options

#### **Vercel** (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### **Netlify**
```bash
# Build command: npm run build
# Publish directory: build
# Environment variables: Add REACT_APP_GEMINI_API_KEY
```

#### **AWS S3 + CloudFront**
```bash
# Upload build/ folder to S3 bucket
# Configure CloudFront distribution
# Set up custom domain (optional)
```

## 🎯 Usage Guide

### **For Candidates**
1. 📄 Upload resume (DOCX/DOC format)
2. ✍️ Complete profile information
3. ▶️ Start AI-powered interview
4. ⏱️ Answer questions within time limits
5. 🎯 Receive instant AI feedback
6. 🏆 View detailed performance summary

### **For Interviewers**
1. 👥 Access interviewer dashboard
2. 🔍 Search and filter candidates
3. 📊 Review performance metrics
4. 💬 Read complete interview transcripts
5. 📋 Export candidate summaries
6. 🗑️ Manage interview data

## 🔧 API Configuration

### **Gemini AI Integration**
The app uses Google's Gemini 2.5-flash model for:
- **Question Generation**: Dynamic, role-specific questions
- **Answer Evaluation**: Detailed scoring and feedback
- **Summary Creation**: Comprehensive interview analysis

### **Getting Gemini API Key**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google account
3. Create new API key
4. Add to environment variables
5. Restart application

### **Fallback System**
When AI is unavailable:
- ✅ Pre-defined question sets activate
- ✅ Basic scoring algorithms engage
- ✅ Simple summary generation works
- ✅ Full functionality maintained

## 🛠️ Available Scripts

```bash
npm start          # Development server
npm run build      # Production build
npm run build:analyze  # Build with bundle analysis
npm test           # Run test suite
npm run deploy     # Build and prepare for deployment
npm run clean      # Clean build and dependencies
```

## 🏁 Production Checklist

- ✅ **Dependencies optimized** (removed unused packages)
- ✅ **Environment variables configured** (development & production)
- ✅ **Code splitting implemented** (lazy loading)
- ✅ **Performance optimized** (memoized selectors)
- ✅ **Error handling robust** (fallback systems)
- ✅ **Build optimizations enabled** (source maps disabled in production)
- ✅ **Security headers recommended** (CSP, CORS)
- ✅ **Mobile responsive** (all screen sizes)

## 📈 Performance Metrics

- **Bundle Size**: Optimized for fast loading
- **Lazy Loading**: Components load on demand
- **Memoization**: Prevents unnecessary re-renders
- **API Caching**: Efficient data management
- **Error Boundaries**: Graceful failure handling

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- 📚 **Documentation**: [Setup Guide](SETUP_GUIDE.md)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)

---

**🌟 Star this repository if it helped you build amazing interviews!**