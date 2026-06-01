import type { Metadata } from 'next'
import { Inter, Syne } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import '@/styles/globals.css'

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
})

const syne = Syne({
  variable: '--font-heading',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'OctoLearn',
  description: 'Retain knowledge through AI-generated quizzes',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} ${syne.variable} dark h-full antialiased`}>
        <body className="min-h-full flex flex-col">{children}</body>
      </html>
    </ClerkProvider>
  )
}
