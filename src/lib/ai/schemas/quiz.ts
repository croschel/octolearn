import { z } from 'zod'

export const QuizQuestionSchema = z
  .object({
    id: z.string().min(1),
    type: z.enum(['multiple-choice', 'descriptive']),
    question: z.string().min(1),
    options: z.array(z.string()),
    correctAnswer: z.string().min(1),
    explanation: z.string().min(30, 'Explanation must be at least 30 characters'),
  })
  .superRefine((val, ctx) => {
    if (val.type === 'multiple-choice') {
      if (val.options.length !== 4) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Multiple-choice questions must have exactly 4 options',
          path: ['options'],
        })
      }
      if (!val.options.includes(val.correctAnswer)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'correctAnswer must exactly match one of the options',
          path: ['correctAnswer'],
        })
      }
    }
    if (val.type === 'descriptive' && val.options.length !== 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Descriptive questions must have an empty options array',
        path: ['options'],
      })
    }
  })

export const QuizResponseSchema = z.object({
  questions: z.array(QuizQuestionSchema).min(1, 'At least one question is required'),
})

export type QuizQuestion = z.infer<typeof QuizQuestionSchema>
export type QuizResponse = z.infer<typeof QuizResponseSchema>
