import { describe, expect, it } from 'vitest'
import { QuizQuestionSchema, QuizResponseSchema } from './quiz'

const BASE_MC = {
  id: 'q1',
  type: 'multiple-choice' as const,
  question: 'What is a closure in JavaScript?',
  options: ['A function with its scope', 'A loop construct', 'A data type', 'An event listener'],
  correctAnswer: 'A function with its scope',
  explanation:
    'A closure is a function that has access to its outer scope variables even after the outer function has returned.',
}

const BASE_DESCRIPTIVE = {
  id: 'q2',
  type: 'descriptive' as const,
  question: 'Explain the difference between a process and a thread.',
  options: [],
  correctAnswer: 'A process is independent execution with its own memory; a thread shares memory.',
  explanation:
    'Processes are isolated from each other with separate memory, while threads share memory within a process and require synchronisation.',
}

describe('QuizQuestionSchema', () => {
  it('accepts a valid multiple-choice question', () => {
    const result = QuizQuestionSchema.safeParse(BASE_MC)
    expect(result.success).toBe(true)
  })

  it('accepts a valid descriptive question', () => {
    const result = QuizQuestionSchema.safeParse(BASE_DESCRIPTIVE)
    expect(result.success).toBe(true)
  })

  it('rejects MC question with wrong number of options', () => {
    const result = QuizQuestionSchema.safeParse({ ...BASE_MC, options: ['A', 'B'] })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain('Multiple-choice questions must have exactly 4 options')
    }
  })

  it('rejects descriptive question with non-empty options array', () => {
    const result = QuizQuestionSchema.safeParse({
      ...BASE_DESCRIPTIVE,
      options: ['A', 'B', 'C', 'D'],
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain('Descriptive questions must have an empty options array')
    }
  })

  it('rejects MC question where correctAnswer is not in options', () => {
    const result = QuizQuestionSchema.safeParse({
      ...BASE_MC,
      correctAnswer: 'Not in options',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain('correctAnswer must exactly match one of the options')
    }
  })

  it('rejects explanation shorter than 30 characters', () => {
    const result = QuizQuestionSchema.safeParse({ ...BASE_MC, explanation: 'Too short.' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain('Explanation must be at least 30 characters')
    }
  })
})

describe('QuizResponseSchema', () => {
  it('accepts a valid response with mixed questions', () => {
    const result = QuizResponseSchema.safeParse({
      questions: [BASE_MC, BASE_DESCRIPTIVE],
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty questions array', () => {
    const result = QuizResponseSchema.safeParse({ questions: [] })
    expect(result.success).toBe(false)
  })
})
