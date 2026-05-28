# Agent: Quiz Evaluator

## Purpose
Handles the answer evaluation loop during an active quiz session. This agent runs in isolated context per question — it does not carry the full quiz history, only the current question and answer.

## Model
`claude-haiku-4-5` (evaluation)
`claude-sonnet-4-6` (explanation after 3 failures)

## Activation
Triggered on each `submitAnswer` Server Action call.

## Inputs
```ts
{
  questionId: string
  questionText: string
  questionType: 'multiple-choice' | 'descriptive'
  correctAnswer: string
  userAnswer: string
  attemptCount: number       // how many times user has attempted this question
  explanation: string        // the pre-generated explanation (used at attempt 3)
}
```

## Behavior

### Multiple Choice
- Compare `userAnswer` against `correctAnswer` (exact match, case-insensitive)
- No AI call needed for evaluation — it's deterministic
- If wrong and `attemptCount < 3`: return a short hint (AI call, max 100 tokens)
- If wrong and `attemptCount === 3`: return the full explanation

### Descriptive
- AI evaluates semantic similarity between `userAnswer` and `correctAnswer`
- Returns: `{ isCorrect: boolean, feedback: string, score: 0 | 0.5 | 1 }`
- Partial credit (0.5) is possible for descriptive questions
- If `attemptCount === 3`: return the full explanation regardless of score

## Hint Prompt (Haiku)
```
The user answered a quiz question incorrectly.

Question: {questionText}
Correct answer: {correctAnswer}
User's answer: {userAnswer}

Give a single short hint (1-2 sentences) that guides them toward the correct answer
without revealing it directly. Do not explain the full answer yet.
```

## Evaluation Prompt for Descriptive (Haiku)
```
Evaluate this answer to a software engineering question.

Question: {questionText}
Expected answer: {correctAnswer}
User's answer: {userAnswer}

Return JSON only:
{
  "isCorrect": boolean,
  "score": 0 | 0.5 | 1,
  "feedback": "one sentence of specific feedback"
}

Score guide: 1 = fully correct, 0.5 = partially correct or missing key details, 0 = incorrect or irrelevant.
```

## Output
```ts
{
  isCorrect: boolean
  score: number           // 0 | 0.5 | 1
  feedback: string        // hint or explanation depending on attempt count
  showExplanation: boolean // true only when attemptCount === 3
  explanation?: string    // the full explanation, only when showExplanation is true
}
```

## State Update
After each evaluation, update `quiz_questions` in Supabase:
- Increment `attempt_count`
- Set `is_correct` when answer is accepted
- Set `user_answer` to the latest answer
