'use server'

import { z } from 'zod'
import { anthropic, MODELS, createCachedSystemPrompt } from '@/lib/ai/client'
import { QuizResponseSchema } from '@/lib/ai/schemas/quiz'
import { buildQuizGeneratorPrompt, buildQuizRetryPrompt } from '@/lib/ai/prompts/quiz-generator'
import { buildHintPrompt, buildDescriptiveEvalPrompt } from '@/lib/ai/prompts/evaluator'
import { buildTopicSuggesterPrompt } from '@/lib/ai/prompts/topic-suggester'
import { tryCatch } from '@/lib/utils/try-catch'
import type { Result } from '@/lib/utils/try-catch'
import type { EvaluationResult, QuizSessionState } from '@/types/quiz'
import {
  findOrCreateSubjectArea,
  insertQuizSession,
  insertQuizQuestions,
  getQuizSessionWithQuestions,
  getQuestionById,
  updateQuestionAttempt,
  completeQuizSession,
} from '@/lib/db/queries/quiz'

// ─── Input schemas ────────────────────────────────────────────────────────────

const CreateQuizInputSchema = z.object({
  userId: z.string().min(1),
  subjectArea: z.string().min(1, 'Subject area is required'),
  topics: z.array(z.string().min(1)).min(1, 'At least one topic is required'),
  totalQuestions: z.number().int().min(5).max(20).default(10),
})

export type CreateQuizInput = z.infer<typeof CreateQuizInputSchema>

const SubmitAnswerInputSchema = z.object({
  sessionId: z.string().uuid(),
  questionId: z.string().uuid(),
  userId: z.string().min(1),
  userAnswer: z.string().min(1),
})

export type SubmitAnswerInput = z.infer<typeof SubmitAnswerInputSchema>

const DescriptiveEvalResponseSchema = z.object({
  isCorrect: z.boolean(),
  score: z.union([z.literal(0), z.literal(0.5), z.literal(1)]),
  feedback: z.string().min(1),
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fisherYatesShuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = arr[i]
    arr[i] = arr[j]!
    arr[j] = temp!
  }
  return arr
}

async function callAI(model: string, system: string, user: string): Promise<string> {
  const response = await anthropic.messages.create({
    model,
    max_tokens: 1500,
    system: [createCachedSystemPrompt(system)],
    messages: [{ role: 'user', content: user }],
  })
  const block = response.content[0]
  if (block.type !== 'text') throw new Error('Unexpected AI response type')

  if (process.env.NODE_ENV === 'development') {
    console.debug(
      '[AI]',
      model,
      'input:',
      response.usage.input_tokens,
      'output:',
      response.usage.output_tokens,
    )
  }

  return block.text
}

// ─── createQuiz ───────────────────────────────────────────────────────────────

export async function createQuiz(input: CreateQuizInput): Promise<Result<{ sessionId: string }>> {
  return tryCatch(async () => {
    const parsed = CreateQuizInputSchema.safeParse(input)
    if (!parsed.success) {
      throw new Error(parsed.error.issues.map((e) => e.message).join(', '))
    }

    const { userId, subjectArea, topics, totalQuestions } = parsed.data
    const mcCount = Math.round(totalQuestions * 0.7)
    const descriptiveCount = totalQuestions - mcCount

    const subjectAreaId = await findOrCreateSubjectArea(userId, subjectArea)

    const sessionId = await insertQuizSession({
      user_id: userId,
      subject_area_id: subjectAreaId,
      topics,
      total_questions: totalQuestions,
      status: 'in_progress',
    })

    const promptParams = { subjectArea, topics, totalQuestions, mcCount, descriptiveCount }
    const { system, user } = buildQuizGeneratorPrompt(promptParams)

    let quizData: import('@/lib/ai/schemas/quiz').QuizResponse

    const rawText = await callAI(MODELS.fast, system, user)

    const firstAttempt = QuizResponseSchema.safeParse(JSON.parse(rawText))
    if (firstAttempt.success) {
      quizData = firstAttempt.data
    } else {
      const retryPrompt = buildQuizRetryPrompt(promptParams)
      const retryText = await callAI(MODELS.fast, retryPrompt.system, retryPrompt.user)
      const secondAttempt = QuizResponseSchema.safeParse(JSON.parse(retryText))
      if (!secondAttempt.success) {
        throw new Error('Quiz generation failed after retry: ' + secondAttempt.error.message)
      }
      quizData = secondAttempt.data
    }

    const shuffled = fisherYatesShuffle(quizData.questions)

    await insertQuizQuestions(
      shuffled.map((q, index) => ({
        session_id: sessionId,
        type: q.type,
        question: q.question,
        options: q.type === 'multiple-choice' ? q.options : null,
        correct_answer: q.correctAnswer,
        explanation: q.explanation,
        position: index,
      })),
    )

    return { sessionId }
  }, 'QUIZ_GENERATION_FAILED')
}

// ─── suggestTopics ────────────────────────────────────────────────────────────

export async function suggestTopics(subjectArea: string): Promise<Result<string[]>> {
  return tryCatch(async () => {
    const prompt = buildTopicSuggesterPrompt(subjectArea)
    const response = await anthropic.messages.create({
      model: MODELS.fast,
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    })

    const block = response.content[0]
    if (block.type !== 'text') throw new Error('Unexpected AI response type')

    const suggestions: unknown = JSON.parse(block.text)
    if (!Array.isArray(suggestions)) throw new Error('Expected JSON array from topic suggester')

    return suggestions.slice(0, 6).filter((s): s is string => typeof s === 'string')
  }, 'TOPIC_SUGGESTION_FAILED')
}

// ─── getQuizSession ───────────────────────────────────────────────────────────

export async function getQuizSession(
  sessionId: string,
  userId: string,
): Promise<Result<QuizSessionState>> {
  return tryCatch(async () => {
    const row = await getQuizSessionWithQuestions(sessionId)
    if (!row) throw new Error('Session not found')
    if (row.user_id !== userId) throw new Error('UNAUTHORIZED')

    const sortedQuestions = [...row.quiz_questions].sort((a, b) => a.position - b.position)

    const questions = sortedQuestions.map((q) => ({
      id: q.id,
      type: q.type,
      question: q.question,
      options: q.options ?? [],
      correctAnswer: q.correct_answer,
      explanation: q.explanation,
    }))

    const answers: QuizSessionState['answers'] = {}
    for (const q of sortedQuestions) {
      if (q.attempt_count > 0 && q.user_answer !== null) {
        answers[q.id] = {
          userAnswer: q.user_answer,
          isCorrect: q.is_correct ?? false,
          attemptCount: q.attempt_count,
          score: q.score ?? 0,
        }
      }
    }

    const currentQuestionIndex = sortedQuestions.findIndex((q) => !q.is_correct)
    const effectiveIndex =
      currentQuestionIndex === -1 ? sortedQuestions.length : currentQuestionIndex

    return {
      sessionId: row.id,
      subjectArea: row.subject_areas?.title ?? '',
      topics: row.topics,
      questions,
      currentQuestionIndex: effectiveIndex,
      answers,
      status: row.status,
    }
  }, 'SESSION_FETCH_FAILED')
}

// ─── submitAnswer ─────────────────────────────────────────────────────────────

export async function submitAnswer(input: SubmitAnswerInput): Promise<Result<EvaluationResult>> {
  return tryCatch(async () => {
    const parsed = SubmitAnswerInputSchema.safeParse(input)
    if (!parsed.success) {
      throw new Error(parsed.error.issues.map((e) => e.message).join(', '))
    }

    const { sessionId, questionId, userId, userAnswer } = parsed.data

    const question = await getQuestionById(questionId)
    if (!question) throw new Error('Question not found')
    if (question.session_id !== sessionId) throw new Error('Question does not belong to session')

    const session = await getQuizSessionWithQuestions(sessionId)
    if (!session) throw new Error('Session not found')
    if (session.user_id !== userId) throw new Error('UNAUTHORIZED')

    const previousAttempts = question.attempt_count
    const newAttemptCount = previousAttempts + 1

    await updateQuestionAttempt(questionId, { attempt_count: newAttemptCount })

    if (question.type === 'multiple-choice') {
      const isCorrect =
        userAnswer.trim().toLowerCase() === question.correct_answer.trim().toLowerCase()

      if (isCorrect) {
        await updateQuestionAttempt(questionId, {
          attempt_count: newAttemptCount,
          is_correct: true,
          user_answer: userAnswer,
          score: 1,
        })
        return {
          isCorrect: true,
          score: 1,
          feedback: 'Correct!',
          showExplanation: false,
          attemptCount: newAttemptCount,
        }
      }

      if (previousAttempts >= 2) {
        await updateQuestionAttempt(questionId, {
          attempt_count: newAttemptCount,
          is_correct: false,
          user_answer: userAnswer,
          score: 0,
        })
        return {
          isCorrect: false,
          score: 0,
          feedback: question.explanation,
          showExplanation: true,
          explanation: question.explanation,
          attemptCount: newAttemptCount,
        }
      }

      const hintText = await callAI(
        MODELS.fast,
        'You are a helpful quiz hint provider. Give short, guiding hints only.',
        buildHintPrompt({
          questionText: question.question,
          correctAnswer: question.correct_answer,
          userAnswer,
          attemptCount: previousAttempts,
        }),
      )

      await updateQuestionAttempt(questionId, {
        attempt_count: newAttemptCount,
        user_answer: userAnswer,
      })

      return {
        isCorrect: false,
        score: 0,
        feedback: hintText.trim(),
        showExplanation: false,
        attemptCount: newAttemptCount,
      }
    }

    // Descriptive evaluation
    const evalText = await callAI(
      MODELS.fast,
      'You are a quiz answer evaluator. Return only valid JSON.',
      buildDescriptiveEvalPrompt({
        questionText: question.question,
        correctAnswer: question.correct_answer,
        userAnswer,
      }),
    )

    const evalParsed = DescriptiveEvalResponseSchema.safeParse(JSON.parse(evalText))
    if (!evalParsed.success) {
      throw new Error('Failed to parse evaluation response')
    }

    const { score, feedback } = evalParsed.data
    const isCorrect = score >= 0.5

    const showExplanation = !isCorrect && previousAttempts >= 2

    await updateQuestionAttempt(questionId, {
      attempt_count: newAttemptCount,
      is_correct: isCorrect,
      user_answer: userAnswer,
      score,
    })

    return {
      isCorrect,
      score,
      feedback: showExplanation ? `${feedback}\n\n${question.explanation}` : feedback,
      showExplanation,
      explanation: showExplanation ? question.explanation : undefined,
      attemptCount: newAttemptCount,
    }
  }, 'ANSWER_EVALUATION_FAILED')
}

// ─── finishQuiz ───────────────────────────────────────────────────────────────

export async function finishQuiz(
  sessionId: string,
  userId: string,
): Promise<Result<{ correctAnswers: number; totalQuestions: number; scorePercentage: number }>> {
  return tryCatch(async () => {
    const session = await getQuizSessionWithQuestions(sessionId)
    if (!session) throw new Error('Session not found')
    if (session.user_id !== userId) throw new Error('UNAUTHORIZED')

    const totalScore = session.quiz_questions.reduce((sum, q) => sum + (q.score ?? 0), 0)
    const totalQuestions = session.total_questions
    const scorePercentage = totalQuestions > 0 ? (totalScore / totalQuestions) * 100 : 0
    const correctAnswers = Math.round(totalScore)

    await completeQuizSession(sessionId, {
      correct_answers: correctAnswers,
      completed_at: new Date().toISOString(),
    })

    return { correctAnswers, totalQuestions, scorePercentage }
  }, 'FINISH_QUIZ_FAILED')
}
