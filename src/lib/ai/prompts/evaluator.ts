interface HintPromptParams {
  questionText: string
  correctAnswer: string
  userAnswer: string
  attemptCount: number
}

export function buildHintPrompt(params: HintPromptParams): string {
  return `The user answered a quiz question incorrectly (attempt ${params.attemptCount + 1}).

Question: ${params.questionText}
Correct answer: ${params.correctAnswer}
User's answer: ${params.userAnswer}

Give a single short hint (1-2 sentences) that guides them toward the correct answer without revealing it directly. Do not explain the full answer yet.`
}

interface DescriptiveEvalParams {
  questionText: string
  correctAnswer: string
  userAnswer: string
}

export function buildDescriptiveEvalPrompt(params: DescriptiveEvalParams): string {
  return `Evaluate this answer to a software engineering question.

Question: ${params.questionText}
Expected answer: ${params.correctAnswer}
User's answer: ${params.userAnswer}

Return JSON only:
{
  "isCorrect": boolean,
  "score": 0 | 0.5 | 1,
  "feedback": "one sentence of specific feedback"
}

Score guide: 1 = fully correct, 0.5 = partially correct or missing key details, 0 = incorrect or irrelevant.`
}
