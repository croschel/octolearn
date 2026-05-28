export interface SubjectArea {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
}

export interface QuizSession {
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

export interface QuizQuestion {
  id: string
  session_id: string
  type: 'multiple-choice' | 'descriptive'
  question: string
  options: Record<string, string> | null
  correct_answer: string
  explanation: string
  attempt_count: number
  is_correct: boolean | null
  user_answer: string | null
  position: number
}

export interface Report {
  id: string
  user_id: string
  session_id: string
  subject_area: string
  topics_covered: string[]
  score_percentage: number
  summary: string
  struggling_topics: string[] | null
  notion_page_id: string | null
  drive_file_id: string | null
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      subject_areas: {
        Row: SubjectArea
        Insert: Omit<SubjectArea, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<SubjectArea, 'id'>>
      }
      quiz_sessions: {
        Row: QuizSession
        Insert: Omit<QuizSession, 'id' | 'started_at' | 'correct_answers'>
        Update: Partial<Omit<QuizSession, 'id'>>
      }
      quiz_questions: {
        Row: QuizQuestion
        Insert: Omit<QuizQuestion, 'id' | 'attempt_count' | 'is_correct' | 'user_answer'>
        Update: Partial<Omit<QuizQuestion, 'id'>>
      }
      reports: {
        Row: Report
        Insert: Omit<Report, 'id' | 'created_at'>
        Update: Partial<Omit<Report, 'id'>>
      }
    }
  }
}
