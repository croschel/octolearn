import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { MODELS } from '@/lib/ai/client'
import { buildExplainerPrompt } from '@/lib/ai/prompts/explainer'
import { getQuizSessionWithQuestions, getQuestionById } from '@/lib/db/queries/quiz'

export async function POST(request: Request): Promise<Response> {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    typeof (body as Record<string, unknown>).questionId !== 'string' ||
    typeof (body as Record<string, unknown>).sessionId !== 'string' ||
    typeof (body as Record<string, unknown>).userId !== 'string'
  ) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { questionId, sessionId, userId } = body as {
    questionId: string
    sessionId: string
    userId: string
  }

  try {
    const [question, session] = await Promise.all([
      getQuestionById(questionId),
      getQuizSessionWithQuestions(sessionId),
    ])

    if (!question || !session) {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }

    if (session.user_id !== userId || question.session_id !== sessionId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subjectArea = session.subject_areas?.title ?? 'software engineering'

    const result = streamText({
      model: anthropic(MODELS.smart),
      prompt: buildExplainerPrompt({
        question: question.question,
        correctAnswer: question.correct_answer,
        preGeneratedExplanation: question.explanation,
        subjectArea,
      }),
      maxOutputTokens: 800,
    })

    return result.toTextStreamResponse()
  } catch (err) {
    console.error('[stream/route]', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
