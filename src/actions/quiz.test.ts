import { describe, expect, it, vi, beforeEach } from 'vitest'
import { VALID_QUIZ_JSON, INVALID_QUIZ_JSON } from '@/__mocks__/ai/quiz-fixture'

// ─── Module mocks ──────────────────────────────────────────────────────────────

vi.mock('@/lib/ai/client', () => ({
  MODELS: { fast: 'claude-haiku-4-5', smart: 'claude-sonnet-4-6' },
  createCachedSystemPrompt: (content: string) => ({
    type: 'text',
    text: content,
    cache_control: { type: 'ephemeral' },
  }),
  anthropic: {
    messages: {
      create: vi.fn(),
    },
  },
}))

vi.mock('@/lib/db/queries/quiz', () => ({
  findOrCreateSubjectArea: vi.fn(),
  insertQuizSession: vi.fn(),
  insertQuizQuestions: vi.fn(),
  getQuizSessionWithQuestions: vi.fn(),
  getQuestionById: vi.fn(),
  updateQuestionAttempt: vi.fn(),
  completeQuizSession: vi.fn(),
}))

// Import after mocks are registered
import { createQuiz, submitAnswer, finishQuiz } from './quiz'
import { anthropic } from '@/lib/ai/client'
import * as queries from '@/lib/db/queries/quiz'

const mockAnthropicCreate = vi.mocked(anthropic.messages.create)
const mockFindOrCreate = vi.mocked(queries.findOrCreateSubjectArea)
const mockInsertSession = vi.mocked(queries.insertQuizSession)
const mockInsertQuestions = vi.mocked(queries.insertQuizQuestions)
const mockGetSession = vi.mocked(queries.getQuizSessionWithQuestions)
const mockGetQuestion = vi.mocked(queries.getQuestionById)
const mockUpdateAttempt = vi.mocked(queries.updateQuestionAttempt)
const mockCompleteSession = vi.mocked(queries.completeQuizSession)

function makeAIResponse(text: string) {
  return {
    content: [{ type: 'text' as const, text }],
    usage: {
      input_tokens: 100,
      output_tokens: 50,
      cache_creation_input_tokens: 0,
      cache_read_input_tokens: 0,
    },
  }
}

const BASE_SESSION_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
const BASE_QUESTION_ID = 'b2c3d4e5-f6a7-8901-bcde-f12345678901'
const BASE_USER_ID = 'user_clerk_001'

function makeQuizQuestion(overrides: Partial<import('@/types/database').QuizQuestionRow> = {}) {
  return {
    id: BASE_QUESTION_ID,
    session_id: BASE_SESSION_ID,
    type: 'multiple-choice' as const,
    question: 'What is a closure?',
    options: ['A function with its scope', 'A loop', 'A type', 'An event'],
    correct_answer: 'A function with its scope',
    explanation: 'A closure is a function that retains access to its outer scope variables.',
    attempt_count: 0,
    is_correct: null,
    user_answer: null,
    score: null,
    position: 0,
    ...overrides,
  }
}

function makeSession(
  questionOverrides: Partial<import('@/types/database').QuizQuestionRow>[] = [],
) {
  return {
    id: BASE_SESSION_ID,
    user_id: BASE_USER_ID,
    subject_area_id: 'sa-uuid',
    topics: ['Closures', 'Scope'],
    total_questions: 2,
    correct_answers: 0,
    status: 'in_progress' as const,
    started_at: new Date().toISOString(),
    completed_at: null,
    subject_areas: { title: 'JavaScript' },
    quiz_questions: questionOverrides.map((o) => makeQuizQuestion(o)),
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockFindOrCreate.mockResolvedValue('sa-uuid')
  mockInsertSession.mockResolvedValue(BASE_SESSION_ID)
  mockInsertQuestions.mockResolvedValue(undefined)
  mockUpdateAttempt.mockResolvedValue(undefined)
  mockCompleteSession.mockResolvedValue(undefined)
})

// ─── createQuiz ───────────────────────────────────────────────────────────────

describe('createQuiz', () => {
  it('happy path returns sessionId', async () => {
    mockAnthropicCreate.mockResolvedValueOnce(makeAIResponse(VALID_QUIZ_JSON) as never)

    const result = await createQuiz({
      userId: BASE_USER_ID,
      subjectArea: 'JavaScript',
      topics: ['Closures', 'Scope'],
      totalQuestions: 10,
    })

    expect(result.error).toBeNull()
    expect(result.data?.sessionId).toBe(BASE_SESSION_ID)
    expect(mockInsertSession).toHaveBeenCalledOnce()
    expect(mockInsertQuestions).toHaveBeenCalledOnce()
  })

  it('retries once on invalid AI JSON and succeeds on second attempt', async () => {
    mockAnthropicCreate
      .mockResolvedValueOnce(makeAIResponse(INVALID_QUIZ_JSON) as never)
      .mockResolvedValueOnce(makeAIResponse(VALID_QUIZ_JSON) as never)

    const result = await createQuiz({
      userId: BASE_USER_ID,
      subjectArea: 'JavaScript',
      topics: ['Closures'],
      totalQuestions: 10,
    })

    expect(result.error).toBeNull()
    expect(result.data?.sessionId).toBe(BASE_SESSION_ID)
    expect(mockAnthropicCreate).toHaveBeenCalledTimes(2)
  })

  it('returns QUIZ_GENERATION_FAILED error when both attempts fail', async () => {
    mockAnthropicCreate
      .mockResolvedValueOnce(makeAIResponse(INVALID_QUIZ_JSON) as never)
      .mockResolvedValueOnce(makeAIResponse(INVALID_QUIZ_JSON) as never)

    const result = await createQuiz({
      userId: BASE_USER_ID,
      subjectArea: 'JavaScript',
      topics: ['Closures'],
      totalQuestions: 10,
    })

    expect(result.data).toBeNull()
    expect(result.error?.code).toBe('QUIZ_GENERATION_FAILED')
  })
})

// ─── submitAnswer ─────────────────────────────────────────────────────────────

describe('submitAnswer - multiple choice', () => {
  const correctInput = {
    sessionId: BASE_SESSION_ID,
    questionId: BASE_QUESTION_ID,
    userId: BASE_USER_ID,
    userAnswer: 'A function with its scope',
  }

  it('correct answer path returns isCorrect: true without AI call', async () => {
    mockGetQuestion.mockResolvedValue(makeQuizQuestion())
    mockGetSession.mockResolvedValue(makeSession([]) as never)

    const result = await submitAnswer(correctInput)

    expect(result.error).toBeNull()
    expect(result.data?.isCorrect).toBe(true)
    expect(result.data?.score).toBe(1)
    expect(result.data?.feedback).toBe('Correct!')
    expect(mockAnthropicCreate).not.toHaveBeenCalled()
  })

  it('wrong answer on first attempt calls AI for a hint', async () => {
    mockGetQuestion.mockResolvedValue(makeQuizQuestion({ attempt_count: 0 }))
    mockGetSession.mockResolvedValue(makeSession([]) as never)
    mockAnthropicCreate.mockResolvedValueOnce(
      makeAIResponse('Think about scope and closures.') as never,
    )

    const result = await submitAnswer({ ...correctInput, userAnswer: 'A loop' })

    expect(result.error).toBeNull()
    expect(result.data?.isCorrect).toBe(false)
    expect(result.data?.showExplanation).toBe(false)
    expect(result.data?.feedback).toBe('Think about scope and closures.')
    expect(mockAnthropicCreate).toHaveBeenCalledOnce()
  })

  it('3rd wrong attempt returns showExplanation: true without an AI call', async () => {
    mockGetQuestion.mockResolvedValue(makeQuizQuestion({ attempt_count: 2 }))
    mockGetSession.mockResolvedValue(makeSession([]) as never)

    const result = await submitAnswer({ ...correctInput, userAnswer: 'A loop' })

    expect(result.error).toBeNull()
    expect(result.data?.showExplanation).toBe(true)
    expect(result.data?.explanation).toBeDefined()
    expect(mockAnthropicCreate).not.toHaveBeenCalled()
  })
})

// ─── finishQuiz ───────────────────────────────────────────────────────────────

describe('finishQuiz', () => {
  it('calculates scorePercentage correctly with full and partial credit', async () => {
    const questions = [
      makeQuizQuestion({ id: 'q1', is_correct: true, score: 1, attempt_count: 1 }),
      makeQuizQuestion({ id: 'q2', is_correct: true, score: 0.5, attempt_count: 2 }),
      makeQuizQuestion({ id: 'q3', is_correct: false, score: 0, attempt_count: 3 }),
      makeQuizQuestion({ id: 'q4', is_correct: false, score: 0, attempt_count: 3 }),
    ]
    const session = makeSession([])
    const fullSession = {
      ...session,
      total_questions: 4,
      quiz_questions: questions,
    }
    mockGetSession.mockResolvedValue(fullSession as never)

    const result = await finishQuiz(BASE_SESSION_ID, BASE_USER_ID)

    expect(result.error).toBeNull()
    // totalScore = 1 + 0.5 + 0 + 0 = 1.5 → 1.5/4 * 100 = 37.5
    expect(result.data?.scorePercentage).toBeCloseTo(37.5)
    expect(result.data?.totalQuestions).toBe(4)
  })

  it('returns 100% when all questions fully correct', async () => {
    const questions = [1, 2].map((i) =>
      makeQuizQuestion({ id: `q${i}`, is_correct: true, score: 1, attempt_count: 1 }),
    )
    mockGetSession.mockResolvedValue({
      ...makeSession([]),
      total_questions: 2,
      quiz_questions: questions,
    } as never)

    const result = await finishQuiz(BASE_SESSION_ID, BASE_USER_ID)

    expect(result.data?.scorePercentage).toBe(100)
  })
})
