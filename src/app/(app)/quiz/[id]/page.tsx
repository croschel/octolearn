import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { QuizSession } from '@/components/quiz/quiz-session'
import { getQuizSession } from '@/actions/quiz'

interface QuizPageProps {
  params: Promise<{ id: string }>
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const result = await getQuizSession(id, userId)

  if (result.error || !result.data) {
    redirect('/dashboard')
  }

  const session = result.data

  if (session.status === 'completed') {
    redirect(`/quiz/${id}/report`)
  }

  return <QuizSession session={session} />
}
