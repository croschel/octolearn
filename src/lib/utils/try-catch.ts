export type Result<T> = { data: T; error: null } | { data: null; error: AppError }

export interface AppError {
  message: string
  code: string
  cause?: unknown
}

export async function tryCatch<T>(
  fn: () => Promise<T>,
  errorCode = 'UNKNOWN_ERROR',
): Promise<Result<T>> {
  try {
    const data = await fn()
    return { data, error: null }
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : 'An unexpected error occurred'
    return {
      data: null,
      error: { message, code: errorCode, cause },
    }
  }
}
