export type ResourceItem = {
  title: string
  url: string
  type: 'docs' | 'video' | 'article' | 'repo' | 'course' | 'playground' | 'book' | 'certification'
  price_range?: '$' | '$$' | '$$$'
}

export type TopicResources = {
  topic: string
  free: ResourceItem[]
  freemium: ResourceItem[]
  paid: ResourceItem[]
}

export type ResourceList = TopicResources[]

export type Report = {
  id: string
  user_id: string
  session_id: string
  subject_area: string
  topics_covered: string[]
  score_percentage: number
  summary: string
  struggling_topics: string[] | null
  learning_resume: string | null
  resources: ResourceList | null
  notion_page_id: string | null
  drive_file_id: string | null
  created_at: string
}
