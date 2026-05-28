import { describe, expect, it } from 'vitest'
import { tryCatch } from './try-catch'

describe('tryCatch', () => {
  it('returns data and null error on success', async () => {
    const { data, error } = await tryCatch(() => Promise.resolve(42))
    expect(data).toBe(42)
    expect(error).toBeNull()
  })

  it('returns null data and AppError on failure', async () => {
    const { data, error } = await tryCatch(
      () => Promise.reject(new Error('something went wrong')),
      'TEST_ERROR',
    )
    expect(data).toBeNull()
    expect(error).not.toBeNull()
    expect(error?.message).toBe('something went wrong')
    expect(error?.code).toBe('TEST_ERROR')
  })

  it('uses UNKNOWN_ERROR code when none provided', async () => {
    const { error } = await tryCatch(() => Promise.reject(new Error('boom')))
    expect(error?.code).toBe('UNKNOWN_ERROR')
  })

  it('handles non-Error thrown values', async () => {
    const { data, error } = await tryCatch(() => Promise.reject('plain string'))
    expect(data).toBeNull()
    expect(error?.message).toBe('An unexpected error occurred')
    expect(error?.cause).toBe('plain string')
  })
})
