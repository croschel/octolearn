import { z } from 'zod'

export const ReportSummarySchema = z.object({
  summary: z.string().min(20),
  struggling_topics: z.array(z.string()),
})

export type ReportSummary = z.infer<typeof ReportSummarySchema>
