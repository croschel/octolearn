export default function QuizLoading() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-5">
      <svg
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-16 h-16 animate-pulse"
      >
        <ellipse cx="40" cy="35" rx="20" ry="22" fill="hsl(var(--brand-primary))" opacity="0.6" />
        <circle cx="33" cy="30" r="4" fill="white" opacity="0.9" />
        <circle cx="47" cy="30" r="4" fill="white" opacity="0.9" />
        <path
          d="M25 48 Q22 55 24 60"
          stroke="hsl(var(--brand-primary))"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
          opacity="0.4"
        />
        <path
          d="M32 52 Q30 59 31 63"
          stroke="hsl(var(--brand-primary))"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
          opacity="0.4"
        />
        <path
          d="M40 53 Q40 60 39 64"
          stroke="hsl(var(--brand-primary))"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
          opacity="0.4"
        />
        <path
          d="M48 52 Q50 59 49 63"
          stroke="hsl(var(--brand-primary))"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
          opacity="0.4"
        />
        <path
          d="M55 48 Q58 55 56 60"
          stroke="hsl(var(--brand-primary))"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
          opacity="0.4"
        />
      </svg>
      <p className="text-[14px] text-text-secondary">Loading your quiz...</p>
    </div>
  )
}
