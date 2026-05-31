import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export const MODELS = {
  fast: 'claude-haiku-4-5',
  smart: 'claude-sonnet-4-6',
} as const

export type ModelKey = keyof typeof MODELS

export function createCachedSystemPrompt(content: string): Anthropic.TextBlockParam {
  return {
    type: 'text',
    text: content,
    cache_control: { type: 'ephemeral' },
  }
}
