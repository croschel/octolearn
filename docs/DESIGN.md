# Design: Figma Specification & Workflow

## Purpose
This file defines the design system, screen inventory, and Figma workflow for OctoLearn. All UI decisions are settled here first — no screen gets coded without a corresponding Figma frame being reviewed.

## MCP Integration
When the Figma MCP is connected, Claude Code can read frame specs, extract tokens, and verify that component implementation matches the design. Add to `.mcp.json` when ready:
```json
"figma": {
  "type": "url",
  "url": "https://api.figma.com/mcp/v1",
  "name": "figma-mcp",
  "description": "Read Figma frames, extract design tokens, inspect components"
}
```

---

## Design System Foundation

### Grid & Layout
- Base grid: 8px (all spacing is a multiple of 8)
- Page max-width: 1280px
- Content max-width: 768px (reading), 1024px (dashboard)
- Gutters: 16px (mobile), 32px (tablet), 64px (desktop)
- Columns: 4 (mobile), 8 (tablet), 12 (desktop)

### Breakpoints
| Name | Width |
|---|---|
| mobile | 0–639px |
| tablet | 640–1023px |
| desktop | 1024px+ |

### Design Tokens (mirrors `styles/tokens.css`)
Figma styles must be named to exactly match CSS variable names so the Figma MCP can verify alignment:

**Colors**
- `brand/primary` → `--brand-primary`
- `brand/accent` → `--brand-accent`
- `background/default` → `--background`
- `background/surface` → `--surface`
- `background/surface-raised` → `--surface-raised`
- `text/primary` → `--text-primary`
- `text/secondary` → `--text-secondary`
- `status/success`, `status/warning`, `status/error`, `status/info`

**Typography styles** (match `styles/typography.css`)
- `heading/h1` through `heading/h4`
- `body/base`, `body/sm`, `body/xs`
- `label/md`, `label/sm`
- `mono/base`

**Effects**
- `shadow/sm`, `shadow/md`, `shadow/lg`

---

## Screen Inventory

### 1. Marketing (unauthenticated)

#### 1.1 Landing Page
**Route:** `/`
**Sections:**
- **Navbar** — Logo (octopus + OctoLearn wordmark), nav links, Sign In + Get Started CTA
- **Hero** — Headline, subheadline, primary CTA button, octopus mascot illustration (arms holding subject icons: AWS, Java, React, etc.), subtle animated gradient background
- **Problem Statement** — "You study hard. You forget fast." — 3 pain points with icons
- **How It Works** — 3-step horizontal flow: Input topics → Take quiz → Get report
- **Features Grid** — 6 cards: Quiz generation, Smart evaluation, Learning resume, References, Notion export, Drive export
- **Social Proof placeholder** — testimonial cards (can be fake for v1)
- **Pricing teaser** — simple free/pro comparison (for future, just a visual now)
- **Footer** — Logo, links, copyright

**Design notes:**
- Dark background (`--background`) with violet gradient blobs behind hero
- Octopus mascot is the hero centerpiece — illustrated style, not photographic
- Each arm of the octopus holds a tech logo badge

#### 1.2 Sign In / Sign Up
**Route:** `/sign-in`, `/sign-up`
**Owner:** Clerk hosted UI (match Clerk appearance to OctoLearn tokens)
- Override Clerk appearance with brand colors and font

---

### 2. Authenticated App

#### 2.1 Dashboard
**Route:** `/dashboard`
**Layout:** Sidebar (desktop) / Bottom nav (mobile)
**Content:**
- Welcome header with user name
- "Start a Quiz" CTA card (prominent, top)
- Subject Areas grid — cards showing area name, last quiz date, average score, quiz count
- Recent Activity — last 5 quiz sessions as a list
- Quick stats row: total quizzes, avg score, subjects studied, streak

**Design notes:**
- Each subject area card has a colored left border coded by performance: green ≥80%, yellow 60-79%, red <60%
- Empty state: friendly octopus illustration with "Start your first quiz" prompt

#### 2.2 New Quiz Setup
**Route:** `/quiz/new`
**Layout:** Centered single-column form, max-width 600px
**Steps:**
1. **Subject Area input** — text field with autocomplete from existing areas, or create new
2. **Topics input** — tag-style multi-input ("what did you study today?")
3. **Topic suggestions** — if topics field is empty, show AI-suggested topics as clickable chips
4. **Quiz config** — number of questions (default 10, range 5–20), slider or stepper
5. **Generate button** — triggers quiz creation, shows loading state with fun copy ("🐙 Thinking...")

**Design notes:**
- Single page, not a multi-step wizard — all fields visible at once
- Topic tags styled like badges: filled background, × to remove
- Suggestions appear as ghost/outlined chips below the input

#### 2.3 Active Quiz Session
**Route:** `/quiz/[id]`
**Layout:** Full screen focus mode — no sidebar, minimal chrome

**Header bar:**
- Progress bar (top, full width) — fills as questions are answered
- Question counter ("Question 3 of 10")
- Subject area label
- Score live counter

**Question card (center):**
- Question text (large, clear)
- **Multiple choice:** 4 option buttons, one per row. States: default / hover / selected / correct / incorrect
- **Descriptive:** Textarea with character hint, submit button

**Feedback area (below card):**
- First wrong attempt: subtle hint text in amber
- Second wrong attempt: stronger hint, attempt counter visible
- Third wrong attempt: full explanation card with violet border + 🐙 icon

**Design notes:**
- High contrast, no distractions — this is focus mode
- Wrong answer feedback animates in (slide up) — not a modal
- Correct answer: brief green flash on the option, then auto-advance after 1.2s
- Descriptive: no auto-advance — user must click "Next Question"

#### 2.4 Quiz Results & Report
**Route:** `/quiz/[id]/report`
**Layout:** Single scrollable page, max-width 768px

**Sections (top to bottom):**
1. **Score hero** — large score percentage + donut chart, pass/fail label, confetti if ≥80%
2. **Session metadata** — subject area, date, topics, duration
3. **Performance breakdown** — MC score vs Descriptive score side by side
4. **Areas to review** — topics from 3-failure questions, styled as warning cards
5. **Learning Resume** — prose section with AI summary, collapsible
6. **References** — accordion per topic, tiers: Free / Freemium / Paid with icons per resource type
7. **Export bar** — sticky bottom bar: Download PDF / Save to Notion / Save to Drive

**Design notes:**
- Score hero is the emotional anchor — make it celebratory or encouraging
- References section: Free tier is always expanded by default, paid is collapsed
- Export bar sticks to bottom on mobile, floats as a card on desktop

#### 2.5 Reports History
**Route:** `/reports`
**Layout:** List + filter

**Content:**
- Filter bar: by subject area, date range, score range
- Report list: date, subject area, score badge, topic count, export status icons (Notion/Drive checkmark if already exported)
- Click → opens the report page

#### 2.6 Settings
**Route:** `/settings`
**Sections:**
- Profile (name, email — read-only from Clerk)
- Connected integrations (Notion status, Google Drive status, connect/disconnect buttons)
- Preferences (default quiz length, dark/light mode toggle)
- Danger zone (delete account)

---

## Component Library (Figma frames needed)

Each component needs: Default, Hover, Focus, Disabled, and Dark mode variants.

| Component | Notes |
|---|---|
| `Button` | Primary, Secondary, Ghost, Destructive sizes: sm/md/lg |
| `Input` | Default, Focus, Error, Disabled |
| `Textarea` | Same states as Input |
| `Tag/Badge` | Subject area, score level (green/yellow/red), resource type |
| `Card` | Default, Hover, Selected |
| `QuizOption` | MC answer button — Default, Hover, Selected, Correct, Incorrect |
| `ProgressBar` | Thin (quiz header), Thick (dashboard stats) |
| `DonutChart` | Score visualization |
| `Accordion` | For references section |
| `ExportBar` | Sticky bottom bar for report actions |
| `EmptyState` | With octopus illustration, headline, CTA |
| `Sidebar` | Desktop nav |
| `BottomNav` | Mobile nav |
| `Avatar` | User avatar from Clerk |
| `Toast` | Success, Error, Info |

---

## Figma File Structure
```
OctoLearn Design
├── 🎨 Design System
│   ├── Colors
│   ├── Typography
│   ├── Spacing & Grid
│   ├── Icons
│   └── Illustrations (Octopus mascot states)
├── 🧩 Components
│   ├── Atoms (Button, Input, Badge, etc.)
│   ├── Molecules (QuizOption, ExportBar, etc.)
│   └── Organisms (Sidebar, QuizCard, ReportHero)
├── 📱 Mobile Frames (390px)
│   ├── Landing
│   ├── Dashboard
│   ├── New Quiz
│   ├── Active Quiz
│   └── Report
└── 🖥️ Desktop Frames (1440px)
    ├── Landing
    ├── Dashboard
    ├── New Quiz
    ├── Active Quiz
    └── Report
```

---

## Design → Code Workflow

1. Design screen in Figma (mobile first, then desktop)
2. Review tokens — ensure all colors/spacing reference named styles
3. When MCP is connected: Claude Code can inspect the frame directly to extract exact values
4. Implement component in code, referencing `rules/base-styles.md` for token mapping
5. Visual QA: screenshot comparison between Figma frame and browser render
6. Only after visual QA passes → commit

## Mascot Usage Guidelines
- The octopus is friendly and curious — not scary or aggressive
- Use full mascot on: landing hero, empty states, loading screens, 3-failure explanation cards
- Use octopus icon (head only) on: favicon, sidebar logo, report export headers
- Arms holding subject icons: used only on landing page hero
- Never stretch or distort the mascot — maintain aspect ratio
