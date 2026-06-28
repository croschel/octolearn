export interface SubjectAreaRow {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
}

export interface QuizSessionRow {
  id: string
  user_id: string
  subject_area_id: string | null
  topics: string[]
  total_questions: number
  correct_answers: number
  status: 'in_progress' | 'completed'
  started_at: string
  completed_at: string | null
}

export interface QuizQuestionRow {
  id: string
  session_id: string
  type: 'multiple-choice' | 'descriptive'
  question: string
  options: string[] | null
  correct_answer: string
  explanation: string
  attempt_count: number
  is_correct: boolean | null
  user_answer: string | null
  score: number | null
  position: number
}

export interface ReportRow {
  id: string
  user_id: string
  session_id: string
  subject_area: string
  topics_covered: string[]
  score_percentage: number
  summary: string
  struggling_topics: string[] | null
  learning_resume: string | null
  resources: import('@/types/report').ResourceList | null
  notion_page_id: string | null
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      subject_areas: {
        Row: SubjectAreaRow
        Insert: {
          id?: string
          user_id: string
          title: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<SubjectAreaRow>
        Relationships: []
      }
      quiz_sessions: {
        Row: QuizSessionRow
        Insert: {
          id?: string
          user_id: string
          subject_area_id?: string | null
          topics: string[]
          total_questions: number
          correct_answers?: number
          status?: 'in_progress' | 'completed'
          started_at?: string
          completed_at?: string | null
        }
        Update: Partial<QuizSessionRow>
        Relationships: []
      }
      quiz_questions: {
        Row: QuizQuestionRow
        Insert: {
          id?: string
          session_id: string
          type: 'multiple-choice' | 'descriptive'
          question: string
          options?: string[] | null
          correct_answer: string
          explanation: string
          attempt_count?: number
          is_correct?: boolean | null
          user_answer?: string | null
          score?: number | null
          position: number
        }
        Update: Partial<QuizQuestionRow>
        Relationships: []
      }
      reports: {
        Row: ReportRow
        Insert: {
          id?: string
          user_id: string
          session_id: string
          subject_area: string
          topics_covered: string[]
          score_percentage: number
          summary: string
          struggling_topics?: string[] | null
          learning_resume?: string | null
          resources?: import('@/types/report').ResourceList | null
          notion_page_id?: string | null
          created_at?: string
        }
        Update: Partial<ReportRow>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
