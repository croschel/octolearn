'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { QuizProgressBar } from '@/components/quiz/quiz-progress-bar'
import { QuizHeader } from '@/components/quiz/quiz-header'
import { MultipleChoiceQuestion } from '@/components/quiz/multiple-choice-question'
import { DescriptiveQuestion } from '@/components/quiz/descriptive-question'
import { QuizNextButton } from '@/components/quiz/quiz-next-button'
import { submitAnswer, finishQuiz } from '@/actions/quiz'
import type { QuizSessionState, EvaluationResult } from '@/types/quiz'

interface QuizSessionProps {
  session: QuizSessionState
}

export function QuizSession({ session }: QuizSessionProps) {
  const router = useRouter()
  const { user } = useUser()

  const [currentIndex, setCurrentIndex] = useState(session.currentQuestionIndex)
  const [answers, setAnswers] = useState<Record<string, EvaluationResult>>(
    Object.fromEntries(
      Object.entries(session.answers).map(([qId, a]) => [
        qId,
        {
          isCorrect: a.isCorrect,
          score: a.score,
          feedback: '',
          showExplanation: a.attemptCount >= 3 && !a.isCorrect,
          attemptCount: a.attemptCount,
        },
      ]),
    ),
  )
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [streamedExplanations, setStreamedExplanations] = useState<Record<string, string>>({})
  const [streamingQuestions, setStreamingQuestions] = useState<Set<string>>(new Set())

  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const currentIndexRef = useRef(currentIndex)

  useEffect(() => {
    currentIndexRef.current = currentIndex
  })

  const questions = session.questions
  const currentQuestion = questions[currentIndex]
  const totalQuestions = questions.length
  const correctCount = Object.values(answers).filter((a) => a.isCorrect).length
  const currentEval = currentQuestion ? answers[currentQuestion.id] : undefined
  const isLast = currentIndex === totalQuestions - 1

  const showNextButton =
    currentQuestion !== undefined &&
    currentEval !== undefined &&
    (currentQuestion.type === 'descriptive' ||
      !currentEval.isCorrect ||
      currentEval.showExplanation)

  useEffect(() => {
    return () => {
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current)
    }
  }, [])

  async function streamExplanation(questionId: string) {
    if (!user?.id) return
    setStreamingQuestions((prev) => new Set(prev).add(questionId))
    try {
      const res = await fetch('/api/quiz/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          sessionId: session.sessionId,
          userId: user.id,
        }),
      })
      if (!res.ok || !res.body) return
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let streamed = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        streamed += decoder.decode(value, { stream: true })
        setStreamedExplanations((prev) => ({ ...prev, [questionId]: streamed }))
      }
    } finally {
      setStreamingQuestions((prev) => {
        const next = new Set(prev)
        next.delete(questionId)
        return next
      })
    }
  }

  async function handleNext() {
    if (autoAdvanceTimer.current) {
      clearTimeout(autoAdvanceTimer.current)
      autoAdvanceTimer.current = null
    }
    const idx = currentIndexRef.current
    const last = idx === totalQuestions - 1
    if (last) {
      if (!user?.id) return
      await finishQuiz(session.sessionId, user.id)
      router.push(`/quiz/${session.sessionId}/report`)
      return
    }
    setCurrentIndex((i) => i + 1)
  }

  async function handleAnswer(answer: string) {
    if (!currentQuestion || !user?.id || isEvaluating || answers[currentQuestion.id]) return
    setIsEvaluating(true)
    setSelectedAnswers((prev) => ({ ...prev, [currentQuestion.id]: answer }))

    const result = await submitAnswer({
      sessionId: session.sessionId,
      questionId: currentQuestion.id,
      userId: user.id,
      userAnswer: answer,
    })

    setIsEvaluating(false)
    if (result.error || !result.data) return

    const evaluation = result.data
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: evaluation }))

    if (evaluation.showExplanation) {
      void streamExplanation(currentQuestion.id)
    }

    if (currentQuestion.type === 'multiple-choice' && evaluation.isCorrect) {
      autoAdvanceTimer.current = setTimeout(() => {
        void handleNext()
      }, 1200)
    }
  }

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center h-64 text-text-secondary text-sm">
        Loading quiz...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <QuizProgressBar current={currentIndex} total={totalQuestions} />
      <QuizHeader
        subjectArea={session.subjectArea}
        currentIndex={currentIndex}
        totalQuestions={totalQuestions}
        correctCount={correctCount}
        sessionId={session.sessionId}
      />

      <div className="flex-1 px-6 py-10 max-w-[680px] mx-auto w-full">
        <p className="text-[11px] font-medium uppercase tracking-[1.5px] text-brand/70 mb-3">
          {currentQuestion.type === 'multiple-choice' ? 'Multiple choice' : 'Descriptive'}
        </p>

        {currentQuestion.type === 'multiple-choice' ? (
          <MultipleChoiceQuestion
            question={currentQuestion}
            onAnswer={handleAnswer}
            evaluation={currentEval}
            isEvaluating={isEvaluating}
            selectedAnswer={selectedAnswers[currentQuestion.id]}
            streamedExplanation={streamedExplanations[currentQuestion.id]}
            isStreaming={streamingQuestions.has(currentQuestion.id)}
          />
        ) : (
          <DescriptiveQuestion
            question={currentQuestion}
            onSubmit={handleAnswer}
            evaluation={currentEval}
            isEvaluating={isEvaluating}
            streamedExplanation={streamedExplanations[currentQuestion.id]}
            isStreaming={streamingQuestions.has(currentQuestion.id)}
          />
        )}

        {showNextButton && <QuizNextButton isLast={isLast} onNext={handleNext} />}
      </div>
    </div>
  )
}
