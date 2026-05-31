import type { QuizResponse } from '@/lib/ai/schemas/quiz'

export const VALID_MC_QUESTION: QuizResponse['questions'][number] = {
  id: 'q1',
  type: 'multiple-choice',
  question: 'What does the "S" in SOLID stand for?',
  options: [
    'Single Responsibility Principle',
    'Substitution Principle',
    'Separation of Concerns',
    'Static Typing',
  ],
  correctAnswer: 'Single Responsibility Principle',
  explanation:
    'The Single Responsibility Principle states that a class should have only one reason to change, meaning it should have only one job or responsibility.',
}

export const VALID_DESCRIPTIVE_QUESTION: QuizResponse['questions'][number] = {
  id: 'q2',
  type: 'descriptive',
  question: 'Explain the difference between a process and a thread.',
  options: [],
  correctAnswer:
    'A process is an independent program in execution with its own memory space. A thread is a lighter-weight unit of execution within a process, sharing the same memory space with other threads in the same process.',
  explanation:
    'Processes are isolated from each other with separate memory, while threads share memory within a process. Threads are faster to create and communicate but require synchronisation to avoid race conditions.',
}

export const VALID_QUIZ_RESPONSE: QuizResponse = {
  questions: [VALID_MC_QUESTION, VALID_DESCRIPTIVE_QUESTION],
}

export const VALID_QUIZ_JSON = JSON.stringify(VALID_QUIZ_RESPONSE)

export const INVALID_QUIZ_JSON = JSON.stringify({
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice',
      question: 'Bad question',
      options: ['A', 'B'],
      correctAnswer: 'A',
      explanation: 'Too short.',
    },
  ],
})

export const DESCRIPTIVE_EVAL_CORRECT = JSON.stringify({
  isCorrect: true,
  score: 1,
  feedback: 'Excellent answer covering all key points.',
})

export const DESCRIPTIVE_EVAL_PARTIAL = JSON.stringify({
  isCorrect: false,
  score: 0.5,
  feedback: 'Partially correct but missing thread synchronisation details.',
})

export const DESCRIPTIVE_EVAL_WRONG = JSON.stringify({
  isCorrect: false,
  score: 0,
  feedback: 'Incorrect — processes and threads are confused.',
})
