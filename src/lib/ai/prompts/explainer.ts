interface ExplainerParams {
  question: string
  correctAnswer: string
  preGeneratedExplanation: string
  subjectArea: string
}

export function buildExplainerPrompt(params: ExplainerParams): string {
  return `You are an expert software engineering mentor explaining a concept to a developer who got a question wrong three times.

Subject area: ${params.subjectArea}
Question: ${params.question}
Correct answer: ${params.correctAnswer}
Brief explanation already shown: ${params.preGeneratedExplanation}

Provide a deeper, more thorough explanation. Cover:
1. Why the correct answer is right — the underlying principle
2. Why common wrong answers are wrong (if applicable)
3. A concrete real-world example or analogy
4. Any related concepts the learner should know

Be educational and encouraging. Write in plain prose, no markdown headers.`
}
