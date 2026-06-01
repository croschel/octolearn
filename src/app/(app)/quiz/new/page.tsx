import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { QuizSetupForm } from '@/components/quiz/quiz-setup-form'

interface QuizNewPageProps {
  searchParams: Promise<{ area?: string }>
}

export default async function QuizNewPage({ searchParams }: QuizNewPageProps) {
  const params = await searchParams
  const initialArea = params.area ?? ''

  return (
    <div className="p-6 md:p-10 flex flex-col items-center">
      <div className="w-full max-w-[580px]">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-[12px] text-text-disabled hover:text-text-secondary transition-colors mb-5"
        >
          <ArrowLeft className="size-3.5" />
          Back to dashboard
        </Link>

        <div className="mb-8">
          <h1 className="font-heading text-[26px] font-bold tracking-tight text-foreground mb-1.5">
            New quiz
          </h1>
          <p className="text-[14px] text-text-secondary font-light">
            Tell us what you studied and we&apos;ll build a personalized quiz.
          </p>
        </div>

        <QuizSetupForm initialArea={initialArea} />
      </div>
    </div>
  )
}
