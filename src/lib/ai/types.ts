import type { AppError, Result } from '@/lib/utils/try-catch'

export type AIResult<T> = Result<T> & { tokensUsed?: number }

export type StreamResult =
  | { stream: ReadableStream; error: null }
  | { stream: null; error: AppError }
