import { Question, Answer } from '../types';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini API Configuration
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY || 'your-gemini-api-key-here';
const genAI = new GoogleGenerativeAI(API_KEY);

// Check if API key is properly configured
const isValidApiKey = API_KEY && API_KEY !== 'your-gemini-api-key-here' && API_KEY.length > 10;

if (!isValidApiKey) {
  console.warn('⚠️ Gemini API key not configured. Using fallback evaluation methods.');
  console.warn('To enable AI features, add your API key to the .env file:');
  console.warn('REACT_APP_GEMINI_API_KEY=your-actual-api-key');
  console.warn('Get your free API key from: https://makersuite.google.com/app/apikey');
}
export class AIService {
  private static instance: AIService;

  private constructor() {}

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async generateQuestions(): Promise<Question[]> {
    // Skip API call if key is not configured
    if (!isValidApiKey) {
      console.log('🤖 Generating questions using fallback (API key not configured)...');
      return this.getFallbackQuestions();
    }
    
    try {
      console.log('🤖 Generating questions using Gemini AI...');
      
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      
      const prompt = `Generate 6 technical interview questions for a full-stack developer position focusing on React, Node.js, and JavaScript. 
      
Requirements:
- 2 easy questions (basic concepts, 20-60 seconds to answer)
- 2 medium questions (intermediate concepts, 60-120 seconds to answer)  
- 2 hard questions (advanced concepts, 120-180 seconds to answer)
- Cover areas like: JavaScript fundamentals, React concepts, Node.js, web development, system design
- Make questions practical and relevant to real development work

Please format the response as a JSON array with this structure:
[
  {
    "text": "question text here",
    "difficulty": "easy|medium|hard",
    "category": "category name",
    "timeLimit": time_in_seconds
  }
]

Only return the JSON array, no additional text.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('📝 Raw Gemini response:', text);
      
      // Parse the JSON response
      const questionsData = this.parseQuestionsFromResponse(text);
      
      // Convert to Question objects with IDs
      const questions: Question[] = questionsData.map((q, index) => ({
        id: `q${index + 1}_${Date.now()}`,
        text: q.text,
        difficulty: q.difficulty as 'easy' | 'medium' | 'hard',
        timeLimit: q.timeLimit || this.getDefaultTimeLimit(q.difficulty),
        category: q.category || 'General'
      }));
      
      console.log('✅ Generated questions:', questions);
      return questions;
      
    } catch (error) {
      console.error('❌ Error generating questions with Gemini:', error);
      
      // Fallback to a basic set of questions if API fails
      return this.getFallbackQuestions();
    }
  }

  async evaluateAnswer(question: Question, answer: string, timeSpent: number): Promise<{ score: number; feedback: string }> {
    // Skip API call if key is not configured
    if (!isValidApiKey) {
      console.log(`📊 Evaluating answer using fallback (API key not configured)...`);
      return this.getFallbackEvaluation(question, answer, timeSpent);
    }
    
    try {
      console.log(`📊 Evaluating answer for question: ${question.text.substring(0, 50)}...`);
      
      if (answer.trim().length === 0) {
        return {
          score: 0,
          feedback: 'No answer provided. Consider providing a response even if you\'re unsure. Try to explain your thought process or mention what you know about the topic.'
        };
      }
      
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      
      const prompt = `You are an expert technical interviewer evaluating a candidate's answer to a ${question.difficulty} level question.

Question: "${question.text}"
Candidate's Answer: "${answer}"
Time spent: ${timeSpent} seconds (limit was ${question.timeLimit} seconds)
Question Category: ${question.category}

Evaluate this answer and provide:
1. A score from 0-100 based on:
   - Technical accuracy and completeness (60%)
   - Use of appropriate terminology (20%)
   - Practical understanding shown (20%)
   
2. Constructive feedback that:
   - Highlights what was done well
   - Points out missing concepts or inaccuracies
   - Suggests improvements
   - Is encouraging and professional

Consider the difficulty level when scoring:
- Easy questions: Focus on basic understanding
- Medium questions: Expect deeper knowledge and examples
- Hard questions: Look for advanced concepts and system thinking

Provide your response in this JSON format:
{
  "score": number_between_0_and_100,
  "feedback": "detailed_feedback_string"
}

Only return the JSON object, no additional text.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('📝 Raw Gemini evaluation:', text);
      
      // Parse the evaluation response
      const evaluation = this.parseEvaluationFromResponse(text);
      
      // Apply time bonus if answered quickly
      const timeBonus = this.calculateTimeBonus(timeSpent, question.timeLimit);
      const finalScore = Math.min(100, evaluation.score + timeBonus);
      
      const timeFeedback = timeBonus > 0 ? ` (+${timeBonus} bonus for quick response)` : '';
      
      console.log(`✅ Evaluation complete: ${finalScore}/100`);
      
      return {
        score: finalScore,
        feedback: evaluation.feedback + timeFeedback
      };
      
    } catch (error) {
      console.error('❌ Error evaluating answer with Gemini:', error);
      
      // Fallback to basic evaluation
      return this.getFallbackEvaluation(question, answer, timeSpent);
    }
  }

  async generateFinalSummary(questions: Question[], answers: Answer[]): Promise<{ score: number; summary: string }> {
    // Skip API call if key is not configured
    if (!isValidApiKey) {
      console.log('📈 Generating final summary using fallback (API key not configured)...');
      return this.getFallbackSummary(questions, answers);
    }
    
    try {
      console.log('📈 Generating final summary using Gemini AI...');
      
      const totalScore = answers.reduce((sum, answer) => sum + (answer.score || 0), 0);
      const averageScore = Math.round(totalScore / questions.length);
      
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      
      // Prepare interview data for analysis
      const interviewData = questions.map((q, index) => {
        const answer = answers[index] || { text: 'No answer provided', score: 0, timeSpent: 0 };
        return {
          question: q.text,
          difficulty: q.difficulty,
          category: q.category,
          answer: answer.text,
          score: answer.score || 0,
          timeSpent: answer.timeSpent || 0,
          timeLimit: q.timeLimit
        };
      });
      
      const prompt = `You are an expert technical interviewer analyzing a candidate's complete interview performance.

Interview Results:
${JSON.stringify(interviewData, null, 2)}

Overall Statistics:
- Average Score: ${averageScore}/100
- Questions Answered: ${answers.filter(a => a.text.trim().length > 0).length}/${questions.length}
- Total Interview Time: ${answers.reduce((sum, a) => sum + (a.timeSpent || 0), 0)} seconds

Provide a comprehensive interview summary that includes:

1. **Overall Performance Assessment**: Brief evaluation of the candidate's technical level
2. **Strengths**: What the candidate did well (specific examples)
3. **Areas for Improvement**: Specific technical areas that need work
4. **Difficulty Analysis**: How they performed across easy/medium/hard questions
5. **Technical Readiness**: Assessment of their readiness for the role
6. **Recommendations**: Specific advice for improvement

Make the summary:
- Professional and constructive
- Specific with examples from their answers
- Balanced (both strengths and weaknesses)
- Actionable for the candidate
- Suitable for hiring decisions

Provide your response in this JSON format:
{
  "score": ${averageScore},
  "summary": "comprehensive_summary_string"
}

Only return the JSON object, no additional text.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('📝 Raw Gemini summary:', text);
      
      // Parse the summary response
      const summaryData = this.parseSummaryFromResponse(text);
      
      console.log('✅ Final summary generated');
      
      return {
        score: summaryData.score || averageScore,
        summary: summaryData.summary
      };
      
    } catch (error) {
      console.error('❌ Error generating summary with Gemini:', error);
      
      // Fallback to basic summary
      return this.getFallbackSummary(questions, answers);
    }
  }

  // Helper method to parse questions from Gemini response
  private parseQuestionsFromResponse(text: string): any[] {
    try {
      // Clean up the response to extract JSON
      let cleanedText = text.trim();
      
      // Remove markdown code blocks if present
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Remove control characters that break JSON parsing
      // eslint-disable-next-line no-control-regex
      cleanedText = cleanedText.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
      
      // Find JSON array in the response
      const jsonMatch = cleanedText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        let jsonString = jsonMatch[0];
        // Additional cleanup for JSON string
        jsonString = jsonString.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
        return JSON.parse(jsonString);
      }
      
      // If no JSON found, try parsing the whole response
      cleanedText = cleanedText.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error('Error parsing questions response:', error);
      console.error('Raw response text:', text);
      throw new Error('Failed to parse questions from Gemini response');
    }
  }
  
  // Helper method to parse evaluation from Gemini response
  private parseEvaluationFromResponse(text: string): { score: number; feedback: string } {
    try {
      // Clean up the response to extract JSON
      let cleanedText = text.trim();
      
      // Remove markdown code blocks if present
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Remove control characters that break JSON parsing
      // eslint-disable-next-line no-control-regex
      cleanedText = cleanedText.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
      
      // Try multiple approaches to extract and parse JSON
      const approaches = [
        // Approach 1: Find JSON object with regex
        () => {
          const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            let jsonString = jsonMatch[0];
            // Clean up common issues in JSON strings
            jsonString = jsonString
              .replace(/\n/g, ' ')  // Replace newlines with spaces
              .replace(/\r/g, ' ')  // Replace carriage returns
              .replace(/\t/g, ' ')  // Replace tabs
              .replace(/\\\\/g, '/') // Fix escaped slashes
              .replace(/\\\\n/g, '\\n') // Fix double-escaped newlines
              .replace(/\s+/g, ' ') // Normalize whitespace
              .trim();
            return JSON.parse(jsonString);
          }
          throw new Error('No JSON object found');
        },
        // Approach 2: Try parsing the whole cleaned text
        () => {
          let jsonString = cleanedText
            .replace(/\n/g, ' ')
            .replace(/\r/g, ' ')
            .replace(/\t/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          return JSON.parse(jsonString);
        },
        // Approach 3: Extract JSON manually if it contains score and feedback
        () => {
          const scoreMatch = cleanedText.match(/["']score["']\s*:\s*(\d+)/);
          const feedbackMatch = cleanedText.match(/["']feedback["']\s*:\s*["']([^"']*)["']/);
          
          if (scoreMatch && feedbackMatch) {
            return {
              score: parseInt(scoreMatch[1]),
              feedback: feedbackMatch[1]
            };
          }
          throw new Error('Could not extract score and feedback');
        }
      ];
      
      // Try each approach until one works
      for (let i = 0; i < approaches.length; i++) {
        try {
          const result = approaches[i]();
          if (result && typeof result.score === 'number' && typeof result.feedback === 'string') {
            return result;
          }
        } catch (e: any) {
          console.warn(`JSON parsing approach ${i + 1} failed:`, e.message);
        }
      }
      
      throw new Error('All JSON parsing approaches failed');
    } catch (error) {
      console.error('Error parsing evaluation response:', error);
      console.error('Raw response text:', text);
      throw new Error('Failed to parse evaluation from Gemini response');
    }
  }
  
  // Helper method to parse summary from Gemini response
  private parseSummaryFromResponse(text: string): { score: number; summary: string } {
    try {
      // Clean up the response to extract JSON
      let cleanedText = text.trim();
      
      // Remove markdown code blocks if present
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Remove control characters that break JSON parsing
      // eslint-disable-next-line no-control-regex
      cleanedText = cleanedText.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
      
      // Find JSON object in the response
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        let jsonString = jsonMatch[0];
        // Additional cleanup for JSON string
        jsonString = jsonString.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
        return JSON.parse(jsonString);
      }
      
      // If no JSON found, try parsing the whole response
      cleanedText = cleanedText.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error('Error parsing summary response:', error);
      console.error('Raw response text:', text);
      throw new Error('Failed to parse summary from Gemini response');
    }
  }
  
  private calculateTimeBonus(timeSpent: number, timeLimit: number): number {
    const timeRatio = timeSpent / timeLimit;
    if (timeRatio <= 0.5) return 10; // Answered very quickly
    if (timeRatio <= 0.8) return 5;  // Answered efficiently
    return 0; // Used most or all of the time
  }
  
  private getDefaultTimeLimit(difficulty: string): number {
    const limits = { easy: 20, medium: 60, hard: 120 };
    return limits[difficulty as keyof typeof limits] || 60;
  }

  // Fallback methods for when Gemini API fails
  private getFallbackQuestions(): Question[] {
    const fallbackQuestions = [
      {
        id: `q1_${Date.now()}`,
        text: "What is the difference between var, let, and const in JavaScript?",
        difficulty: 'easy' as const,
        timeLimit: 20,
        category: "JavaScript Basics"
      },
      {
        id: `q2_${Date.now() + 1}`,
        text: "Explain what JSX is and how it relates to React.",
        difficulty: 'easy' as const,
        timeLimit: 20,
        category: "React Basics"
      },
      {
        id: `q3_${Date.now() + 2}`,
        text: "Explain the concept of closures in JavaScript with an example.",
        difficulty: 'medium' as const,
        timeLimit: 60,
        category: "JavaScript Advanced"
      },
      {
        id: `q4_${Date.now() + 3}`,
        text: "What is the difference between useEffect and useLayoutEffect in React?",
        difficulty: 'medium' as const,
        timeLimit: 60,
        category: "React Hooks"
      },
      {
        id: `q5_${Date.now() + 4}`,
        text: "Design a scalable system for real-time notifications. Consider performance and reliability.",
        difficulty: 'hard' as const,
        timeLimit: 120,
        category: "System Design"
      },
      {
        id: `q6_${Date.now() + 5}`,
        text: "How would you optimize a Node.js application experiencing memory leaks and high CPU usage?",
        difficulty: 'hard' as const,
        timeLimit: 120,
        category: "Performance Optimization"
      }
    ];
    
    console.log('⚠️ Using fallback questions due to API error');
    return fallbackQuestions;
  }
  
  private getFallbackEvaluation(question: Question, answer: string, timeSpent: number): { score: number; feedback: string } {
    const answerLength = answer.trim().length;
    const words = answer.trim().split(/\s+/).length;
    
    let baseScore = 0;
    
    // Basic scoring based on answer length and content
    if (answerLength === 0) {
      baseScore = 0;
    } else if (words < 10) {
      baseScore = 30; // Very short answer
    } else if (words < 30) {
      baseScore = 50; // Short but reasonable
    } else if (words < 80) {
      baseScore = 70; // Good length
    } else {
      baseScore = 60; // Very long, might be unfocused
    }
    
    // Difficulty adjustment
    const difficultyMultiplier = { easy: 1.0, medium: 1.1, hard: 1.2 };
    const adjustedScore = Math.round(baseScore * difficultyMultiplier[question.difficulty]);
    
    // Time bonus
    const timeBonus = this.calculateTimeBonus(timeSpent, question.timeLimit);
    const finalScore = Math.min(100, adjustedScore + timeBonus);
    
    const feedback = `Answer evaluated using basic criteria due to AI service unavailability. ` +
                    `Score based on answer length (${words} words) and difficulty level (${question.difficulty}). ` +
                    `Consider providing more specific technical details and examples.`;
    
    console.log('⚠️ Using fallback evaluation due to API error');
    return { score: finalScore, feedback };
  }
  
  private getFallbackSummary(questions: Question[], answers: Answer[]): { score: number; summary: string } {
    const totalScore = answers.reduce((sum, answer) => sum + (answer.score || 0), 0);
    const averageScore = Math.round(totalScore / questions.length);
    const completedAnswers = answers.filter(a => a.text.trim().length > 0).length;
    const completionRate = (completedAnswers / questions.length) * 100;
    
    let performanceLevel = '';
    if (averageScore >= 80) {
      performanceLevel = 'Excellent';
    } else if (averageScore >= 65) {
      performanceLevel = 'Good';
    } else if (averageScore >= 50) {
      performanceLevel = 'Average';
    } else {
      performanceLevel = 'Needs Improvement';
    }
    
    const summary = `Interview Performance Summary (Basic Analysis)

Overall Score: ${averageScore}/100 (${performanceLevel})
Questions Completed: ${completedAnswers}/${questions.length} (${completionRate.toFixed(1)}%)

This is a basic summary generated due to AI service unavailability.
For detailed analysis, please ensure the Gemini API is properly configured.

Recommendation: ${
      averageScore >= 70 ? 'Strong technical foundation demonstrated.' :
      averageScore >= 50 ? 'Solid understanding with room for improvement.' :
      'Additional study and practice recommended.'
    }`;
    
    console.log('⚠️ Using fallback summary due to API error');
    return { score: averageScore, summary };
  }
}

export const aiService = AIService.getInstance();