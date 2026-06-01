'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Minus, Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TopicTag } from '@/components/quiz/topic-tag'
import { suggestTopics, createQuiz } from '@/actions/quiz'

interface QuizSetupFormProps {
  initialArea?: string
}

export function QuizSetupForm({ initialArea = '' }: QuizSetupFormProps) {
  const router = useRouter()
  const { user } = useUser()

  const [subjectArea, setSubjectArea] = useState(initialArea)
  const [topics, setTopics] = useState<string[]>([])
  const [topicInput, setTopicInput] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [questionCount, setQuestionCount] = useState(10)
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const tagInputRef = useRef<HTMLInputElement>(null)

  const mcCount = Math.round(questionCount * 0.7)
  const descCount = questionCount - mcCount

  function addTopic(value: string) {
    const trimmed = value.trim()
    if (trimmed && !topics.includes(trimmed)) {
      setTopics((prev) => [...prev, trimmed])
    }
    setTopicInput('')
  }

  function removeTopic(index: number) {
    setTopics((prev) => prev.filter((_, i) => i !== index))
  }

  function handleTagKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTopic(topicInput)
    } else if (e.key === 'Backspace' && topicInput === '' && topics.length > 0) {
      setTopics((prev) => prev.slice(0, -1))
    }
  }

  async function handleAreaBlur() {
    if (!subjectArea.trim() || topics.length > 0) return
    setIsLoadingSuggestions(true)
    const result = await suggestTopics(subjectArea)
    if (result.data) setSuggestions(result.data)
    setIsLoadingSuggestions(false)
  }

  function addSuggestion(topic: string) {
    if (!topics.includes(topic)) setTopics((prev) => [...prev, topic])
    setSuggestions((prev) => prev.filter((s) => s !== topic))
  }

  async function handleGenerate() {
    if (!user?.id || !subjectArea.trim() || topics.length === 0) return
    setIsGenerating(true)
    setError(null)

    const result = await createQuiz({
      userId: user.id,
      subjectArea: subjectArea.trim(),
      topics,
      totalQuestions: questionCount,
    })

    if (result.error) {
      setError(result.error.message)
      setIsGenerating(false)
      return
    }

    router.push(`/quiz/${result.data?.sessionId}`)
  }

  const canGenerate = subjectArea.trim().length > 0 && topics.length > 0 && !isGenerating

  return (
    <div className="w-full max-w-[580px] flex flex-col gap-6">
      {/* Subject area */}
      <div className="flex flex-col gap-2">
        <label className="text-[12px] font-medium text-text-secondary tracking-wide">
          Subject area{' '}
          <span className="text-text-disabled font-normal ml-1.5">e.g. AWS, TypeScript</span>
        </label>
        <input
          type="text"
          value={subjectArea}
          onChange={(e) => setSubjectArea(e.target.value)}
          onBlur={handleAreaBlur}
          placeholder="What are you studying?"
          className="w-full bg-surface border border-brand/20 rounded-xl px-4 py-3.5 text-[14px] text-foreground placeholder:text-text-disabled outline-none focus:border-brand/60 transition-colors"
        />
      </div>

      {/* Topics tag input */}
      <div className="flex flex-col gap-2">
        <label className="text-[12px] font-medium text-text-secondary tracking-wide">
          Topics studied today
          <span className="text-text-disabled font-normal ml-1.5">Press Enter or comma to add</span>
        </label>
        <div
          className="bg-surface border border-brand/35 rounded-xl px-3 py-2.5 flex flex-wrap gap-2 items-center min-h-[52px] cursor-text"
          onClick={() => tagInputRef.current?.focus()}
        >
          {topics.map((topic, i) => (
            <TopicTag key={topic} label={topic} onRemove={() => removeTopic(i)} />
          ))}
          <input
            ref={tagInputRef}
            type="text"
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder={topics.length === 0 ? 'IAM policies, EC2 auto scaling...' : ''}
            className="bg-transparent border-none outline-none text-[13px] text-foreground placeholder:text-text-disabled min-w-[160px] flex-1"
          />
        </div>
        <p className="text-[11px] text-text-disabled">Hit Enter after each topic</p>
      </div>

      {/* AI suggestions */}
      {(suggestions.length > 0 || isLoadingSuggestions) && (
        <div>
          <p className="text-[11px] text-text-secondary mb-2">
            {isLoadingSuggestions
              ? 'Fetching suggestions...'
              : `Suggested topics for ${subjectArea} — click to add`}
          </p>
          {!isLoadingSuggestions && (
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addSuggestion(s)}
                  className="inline-flex items-center gap-1.5 bg-brand/5 border border-brand/20 rounded-md px-2.5 py-1 text-[12px] text-text-secondary hover:bg-brand/12 hover:border-brand/40 hover:text-foreground transition-all"
                >
                  <Plus className="size-3 text-brand/60" />
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Question count */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface border border-border/50 rounded-xl p-4">
          <p className="text-[12px] text-text-secondary mb-3">Number of questions</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQuestionCount((v) => Math.max(5, v - 1))}
              className="w-8 h-8 rounded-lg bg-surface-raised border border-border/50 flex items-center justify-center text-text-secondary hover:text-foreground hover:border-brand/30 transition-all"
            >
              <Minus className="size-4" />
            </button>
            <span className="font-heading text-2xl font-bold text-foreground w-8 text-center">
              {questionCount}
            </span>
            <button
              type="button"
              onClick={() => setQuestionCount((v) => Math.min(20, v + 1))}
              className="w-8 h-8 rounded-lg bg-surface-raised border border-border/50 flex items-center justify-center text-text-secondary hover:text-foreground hover:border-brand/30 transition-all"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>

        <div className="bg-surface border border-border/50 rounded-xl p-4">
          <p className="text-[12px] text-text-secondary mb-3">Question mix</p>
          <div className="h-2 bg-border/30 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-brand rounded-full" style={{ width: '70%' }} />
          </div>
          <p className="text-[11px] text-text-disabled">
            {mcCount} multiple choice · {descCount} descriptive
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-[13px] text-error bg-error/10 border border-error/20 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {/* Generate */}
      <Button
        onClick={handleGenerate}
        disabled={!canGenerate}
        size="lg"
        className="w-full justify-center"
      >
        {isGenerating ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            🐙 Thinking...
          </>
        ) : (
          'Generate quiz'
        )}
      </Button>
    </div>
  )
}
