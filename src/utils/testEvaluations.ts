import { aiService } from '../services/aiService';
import { Question } from '../types';

// Test cases to demonstrate the enhanced AI evaluation
export const runEvaluationTests = async () => {
  console.log('🤖 Testing Enhanced AI Evaluation System...\n');

  // Test 1: JavaScript var/let/const question with good answer
  const jsQuestion: Question = {
    id: 'test-1',
    text: 'What is the difference between var, let, and const in JavaScript?',
    difficulty: 'easy',
    timeLimit: 20,
    category: 'JavaScript Basics',
  };

  const goodJsAnswer = `
    var is function-scoped and can be redeclared and reassigned. It also exhibits hoisting behavior.
    let is block-scoped and can be reassigned but not redeclared in the same scope.
    const is block-scoped and cannot be reassigned or redeclared - it's immutable.
    The main difference is in their scope (function vs block) and mutability.
  `;

  const poorJsAnswer = `
    They are all variables in JavaScript. var is old, let and const are new.
  `;

  console.log('📝 Question:', jsQuestion.text);
  console.log('\n✅ Good Answer:', goodJsAnswer.trim());
  const goodEval = await aiService.evaluateAnswer(jsQuestion, goodJsAnswer, 15);
  console.log('📊 Score:', goodEval.score);
  console.log('💬 Feedback:', goodEval.feedback);

  console.log('\n❌ Poor Answer:', poorJsAnswer.trim());
  const poorEval = await aiService.evaluateAnswer(jsQuestion, poorJsAnswer, 5);
  console.log('📊 Score:', poorEval.score);
  console.log('💬 Feedback:', poorEval.feedback);

  console.log('\n' + '='.repeat(80) + '\n');

  // Test 2: React JSX question
  const reactQuestion: Question = {
    id: 'test-2',
    text: 'Explain what JSX is and how it relates to React.',
    difficulty: 'easy',
    timeLimit: 20,
    category: 'React Basics',
  };

  const goodReactAnswer = `
    JSX is a syntax extension for JavaScript that allows you to write HTML-like code in React components.
    It gets compiled to React.createElement() calls by Babel. JSX makes it easier to write and visualize
    the component structure by combining HTML-like syntax with JavaScript expressions.
  `;

  console.log('📝 Question:', reactQuestion.text);
  console.log('\n✅ Good Answer:', goodReactAnswer.trim());
  const reactEval = await aiService.evaluateAnswer(reactQuestion, goodReactAnswer, 18);
  console.log('📊 Score:', reactEval.score);
  console.log('💬 Feedback:', reactEval.feedback);

  console.log('\n' + '='.repeat(80) + '\n');

  // Test 3: Empty answer
  const emptyEval = await aiService.evaluateAnswer(jsQuestion, '', 0);
  console.log('❌ Empty Answer Test:');
  console.log('📊 Score:', emptyEval.score);
  console.log('💬 Feedback:', emptyEval.feedback);
};

// Function to test specific answer evaluation
export const testAnswer = async (questionText: string, answer: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium') => {
  const testQuestion: Question = {
    id: 'test-custom',
    text: questionText,
    difficulty,
    timeLimit: difficulty === 'easy' ? 20 : difficulty === 'medium' ? 60 : 120,
    category: 'Custom Test',
  };

  const result = await aiService.evaluateAnswer(testQuestion, answer, 30);
  console.log('📝 Question:', questionText);
  console.log('💭 Answer:', answer);
  console.log('📊 Score:', result.score);
  console.log('💬 Feedback:', result.feedback);
  
  return result;
};