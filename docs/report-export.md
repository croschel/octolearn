# Skill: Report Generation & Export

## Trigger
Activated when implementing the final quiz report, learning resume, references, PDF export, Notion export, or Drive export features.

## Context to Load
- `rules/ai-usage.md`
- `rules/database.md`
- `.mcp.json`
- `types/report.ts`

## Workflow

### Step 1 — Collect Session Data
After quiz completion, gather from Supabase:
- All questions and user answers from `quiz_questions`
- Session metadata from `quiz_sessions`
- Subject area title and topics list

### Step 2 — Generate Quiz Report via AI
Call `generateReport` using `claude-haiku-4-5`:
- Input: subject area, topics, questions, answers, attempt counts
- Output: structured report with score summary + struggling topics list
- Max tokens: 1200

### Step 3 — Generate Learning Resume & References via AI
This is a **separate AI call** from the report, using `claude-haiku-4-5`:
- Input: subject area, topics covered in the session
- Output: structured resume + tiered resource list
- Max tokens: 1500

#### Resume Prompt Template
```
You are a learning assistant helping a software engineer consolidate what they studied.

Subject area: {subjectArea}
Topics studied today: {topics}

Generate:
1. A concise learning resume (3-5 paragraphs) covering:
   - What each topic is and why it matters
   - How the topics connect to each other
   - Practical use cases a software engineer should know

2. A curated list of learning resources for these topics, ordered free → paid:
   - Free: official docs, YouTube (specific channel/video), freeCodeCamp, roadmap.sh, dev.to
   - Freemium: Coursera (audit mode), edX (audit), interactive playgrounds, GitHub repos
   - Paid: specific Udemy courses (name + author), Pluralsight paths, O'Reilly/Manning books, official certifications

Rules:
- Be specific — name exact courses, authors, channels. Never say "search YouTube for..."
- Only include resources that actually exist and are well-regarded
- Tailor resources to the exact topics, not the general subject area
- Return ONLY valid JSON

JSON format:
{
  "resume": "markdown string with the learning summary",
  "resources": [
    {
      "topic": "topic name",
      "free": [{ "title": "...", "url": "...", "type": "docs|video|article|repo" }],
      "freemium": [{ "title": "...", "url": "...", "type": "course|playground|repo" }],
      "paid": [{ "title": "...", "url": "...", "type": "course|book|certification", "price_range": "$|$$|$$$" }]
    }
  ]
}
```

### Step 4 — Save Report + Resume to DB
Insert into `reports` table with:
- Score percentage and question breakdown
- AI-generated quiz summary
- AI-generated learning resume (markdown)
- Serialized resources JSON
- Struggling topics list (questions with 3 attempts)
- Update `quiz_sessions.status` to `completed`

### Step 5 — Export Options
Present user with export options:

#### PDF Download
- Generate PDF client-side using `@react-pdf/renderer`
- Sections: Quiz Results → Score breakdown → Struggling areas → Learning Resume → References
- References rendered as clickable links in the PDF
- Trigger browser download directly

#### Notion Export
- Use `notion-mcp`:
  1. Find or create "OctoLearn" root page (🐙)
  2. Find or create sub-page for the subject area
  3. Create report page with:
     - Score callout block
     - Topics covered
     - Quiz summary
     - Toggle: Question breakdown
     - Divider
     - Learning Resume (as rich text)
     - References as bookmark blocks (Notion native link preview)
  4. Save `page_id` to `reports` table

#### Google Drive Export
- Use `google-drive-mcp`:
  1. Find or create "OctoLearn" folder
  2. Create Google Doc with full report + resume + references as hyperlinks
  3. Save `file_id` to `reports` table

## Full Report Structure
```
# {SubjectArea} — Quiz Report
**Date:** {date}
**Score:** {score}% ({correct}/{total} questions)
**Topics Covered:** {topics}

## Quiz Summary
{AI-generated paragraph summarizing quiz performance}

## Areas to Review
{Topics from 3-failure questions}

## Question Breakdown
{Table: question | your answer | correct answer | result}

---

## Learning Resume
{AI-generated multi-paragraph summary of what was studied}

## References & Resources
### {Topic 1}
**Free**
- [Resource name](url) — type
**Freemium**
- [Resource name](url) — type
**Paid**
- [Resource name](url) — $ / $$ / $$$

### {Topic 2}
...
```

## Error Cases
- Notion MCP not connected → show inline message with instructions to connect
- Drive MCP not connected → same
- PDF generation fails → fallback to JSON download
- Resume/references AI call fails → show report without resume, offer a retry button for that section only

