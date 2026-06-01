'use client'

import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface QuizNextButtonProps {
  isLast: boolean
  onNext: () => void
}

export function QuizNextButton({ isLast, onNext }: QuizNextButtonProps) {
  return (
    <div className="mt-6 flex justify-end">
      <Button size="default" onClick={onNext}>
        {isLast ? 'Finish quiz' : 'Next question'}
        <ArrowRight className="size-4" />
      </Button>
    </div>
  )
}
