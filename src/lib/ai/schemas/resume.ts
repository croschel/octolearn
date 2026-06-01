import { z } from 'zod'

const ResourceItemSchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
  type: z.enum([
    'docs',
    'video',
    'article',
    'repo',
    'course',
    'playground',
    'book',
    'certification',
  ]),
  price_range: z.enum(['$', '$$', '$$$']).optional(),
})

const TopicResourcesSchema = z.object({
  topic: z.string().min(1),
  free: z.array(ResourceItemSchema),
  freemium: z.array(ResourceItemSchema),
  paid: z.array(ResourceItemSchema),
})

export const ResumeResponseSchema = z.object({
  resume: z.string().min(50),
  resources: z.array(TopicResourcesSchema),
})

export type ResumeResponse = z.infer<typeof ResumeResponseSchema>
