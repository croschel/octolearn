interface ReportGeneratorParams {
  subjectArea: string
  topics: string[]
  totalQuestions: number
  correctAnswers: number
  questions: Array<{
    question: string
    type: 'multiple-choice' | 'descriptive'
    correctAnswer: string
    userAnswer: string | null
    attemptCount: number
    isCorrect: boolean | null
  }>
}

export function buildReportGeneratorPrompt(params: ReportGeneratorParams): {
  system: string
  user: string
} {
  const { subjectArea, topics, totalQuestions, correctAnswers, questions } = params
  const scorePercent = Math.round((correctAnswers / totalQuestions) * 100)

  const system = `You are an expert learning coach generating quiz session reports. Return ONLY valid JSON with no markdown fences or extra text.

The JSON must match this exact shape:
{
  "summary": "<2-3 paragraphs of prose summarising the quiz session, what the user demonstrated knowledge of, and areas to improve>",
  "struggling_topics": ["<topic name>", ...]
}

Rules:
- summary: Write conversational, encouraging prose. Mention the score, topics covered, and specific strengths/weaknesses evident from the answers.
- struggling_topics: Include only the topic names (not question text) where the user had 3 or more failed attempts. Extract the topic from the question content. Return an empty array if none.`

  const questionSummary = questions
    .map((q, i) => {
      const result = q.isCorrect
        ? '✓'
        : `✗ (${q.attemptCount} attempt${q.attemptCount !== 1 ? 's' : ''})`
      return `Q${i + 1} [${q.type}]: ${q.question}\nCorrect: ${q.correctAnswer}\nUser: ${q.userAnswer ?? '(no answer)'} ${result}`
    })
    .join('\n\n')

  const user = `Subject area: ${subjectArea}
Topics studied: ${topics.join(', ')}
Score: ${correctAnswers}/${totalQuestions} (${scorePercent}%)

Questions and answers:
${questionSummary}`

  return { system, user }
}
