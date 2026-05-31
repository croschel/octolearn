export type { QuizQuestion, QuizResponse } from '@/lib/ai/schemas/quiz'

export type QuizSessionStatus = 'in_progress' | 'completed'

export interface QuizSessionState {
  sessionId: string
  subjectArea: string
  topics: string[]
  questions: import('@/lib/ai/schemas/quiz').QuizQuestion[]
  currentQuestionIndex: number
  answers: Record<
    string,
    {
      userAnswer: string
      isCorrect: boolean
      attemptCount: number
      score: number
    }
  >
  status: QuizSessionStatus
}

export interface EvaluationResult {
  isCorrect: boolean
  score: number
  feedback: string
  showExplanation: boolean
  explanation?: string
  attemptCount: number
}
