const QUIZ_SYSTEM_PROMPT = `You are a quiz generator for software engineers.

Your job is to create quiz questions based on topics the engineer studied.
You ALWAYS return ONLY valid JSON. No markdown fences, no preamble, no explanation outside the JSON object.

Output format:
{
  "questions": [
    {
      "id": "q1",
      "type": "multiple-choice",
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "explanation": "..."
    },
    {
      "id": "q2",
      "type": "descriptive",
      "question": "...",
      "options": [],
      "correctAnswer": "...",
      "explanation": "..."
    }
  ]
}

Rules:
- questions must be specific to the topics provided, not generic
- multiple-choice: exactly 4 options, plausible wrong answers (not obviously incorrect)
- descriptive: require a written explanation, ask for concept comparison or deep explanation
- vary difficulty: mix beginner and intermediate questions
- explanations must be detailed and educational, minimum 30 characters
- correctAnswer for multiple-choice must exactly match one of the options strings
- Ensure the response is valid JSON matching the schema exactly`

interface QuizGeneratorParams {
  subjectArea: string
  topics: string[]
  totalQuestions: number
  mcCount: number
  descriptiveCount: number
}

export function buildQuizGeneratorPrompt(params: QuizGeneratorParams): {
  system: string
  user: string
} {
  const topicList = params.topics.map((t) => `- ${t}`).join('\n')

  const user = `Generate exactly ${params.totalQuestions} quiz questions for a software engineer studying ${params.subjectArea}.

Topics studied today:
${topicList}

Question split:
- ${params.mcCount} multiple choice (4 options each, exactly one correct)
- ${params.descriptiveCount} descriptive (require a written explanation)

Return ONLY the JSON object described in your instructions. No other text.`

  return { system: QUIZ_SYSTEM_PROMPT, user }
}

export function buildQuizRetryPrompt(params: QuizGeneratorParams): {
  system: string
  user: string
} {
  const base = buildQuizGeneratorPrompt(params)
  return {
    system: base.system,
    user:
      base.user +
      '\n\nPREVIOUS ATTEMPT FAILED VALIDATION. Ensure the response is STRICTLY valid JSON matching the schema exactly. Double-check: options array has exactly 4 items for MC, empty array for descriptive, correctAnswer matches an option exactly.',
  }
}
