# Rule: UI & Styling

## Stack
- Tailwind CSS for all styling
- shadcn/ui for component primitives
- No custom CSS files unless absolutely necessary (animations that Tailwind can't handle)

## Design Language
OctoLearn has a playful but focused identity. The octopus mascot suggests intelligence, curiosity, and multi-tasking.

**Color palette (Tailwind tokens):**
- Primary: `violet-600` / `violet-500` (hover)
- Background: `slate-950` (dark), `white` (light)
- Surface: `slate-900` / `slate-100`
- Accent: `teal-400` (highlights, progress bars)
- Error: `red-500`
- Success: `emerald-500`
- Warning: `amber-400`

**Typography:**
- Font: Inter (system fallback stack)
- Headings: `font-bold`, tight tracking (`tracking-tight`)
- Body: `text-base`, `leading-relaxed`

## Dark Mode
- Dark mode is the **default** for the authenticated app area
- The landing page supports both light and dark
- Use Tailwind's `dark:` prefix — never use CSS variables for theme switching

## Component Rules
- Use shadcn/ui primitives (`Button`, `Card`, `Input`, `Badge`, etc.) before writing custom ones
- Never use inline styles (`style={{ }}`) — always Tailwind classes
- Responsive by default: mobile-first, use `sm:`, `md:`, `lg:` breakpoints
- Animations: prefer Tailwind `transition-*` and `animate-*` — keep them subtle

## Landing Page
The marketing landing page must have:
1. Hero section with octopus mascot illustration and clear value proposition
2. "How it works" — 3-step visual flow
3. Feature highlights (quiz types, Notion/Drive export, knowledge base)
4. CTA to sign up
No complex animations — clean, fast, focused.

## Quiz UI
- Progress bar showing question N of total
- Clear visual distinction between multiple-choice and descriptive questions
- Wrong answer feedback appears inline below the question (not a modal)
- After 3 failures: explanation appears in a highlighted card (`violet` border)
- Score summary at the end uses a large number + donut chart
