# Agent: Notion Integration

## Purpose
Handles all interactions with the user's Notion workspace via the Notion MCP server. Runs in isolated context — only receives the report data it needs to create/update pages.

## Model
`claude-haiku-4-5`

## MCP Server
`notion-mcp` (configured in `.mcp.json`)

## Activation
Triggered by the `exportToNotion` Server Action after a report is generated.

## Inputs
```ts
{
  userId: string
  report: {
    subjectArea: string
    date: string
    scorePercentage: number
    correctAnswers: number
    totalQuestions: number
    topicsCovered: string[]
    summary: string
    strugglingTopics: string[]
    questions: Array<{
      question: string
      type: string
      userAnswer: string
      correctAnswer: string
      isCorrect: boolean
    }>
  }
}
```

## Page Structure in Notion
```
OctoLearn (root page — created once)
└── {SubjectArea} (section page — created if not exists)
    └── {Date} — Quiz Report (child page — created per report)
```

## Workflow

### 1. Find or Create Root Page
- Search for a page titled "OctoLearn" in the workspace
- If not found: create it with a brief description and the octopus emoji (🐙) as cover icon

### 2. Find or Create Subject Area Page
- Search for a child page of OctoLearn matching the subject area title
- If not found: create it

### 3. Create Report Page
- Create a new child page under the subject area with:
  - Title: `{date} — {subjectArea} Quiz`
  - Icon: score-based emoji (🟢 ≥80%, 🟡 60–79%, 🔴 <60%)
  - Content blocks:
    - Score callout block
    - Topics covered (bulleted list)
    - Summary paragraph
    - Areas to review (if any struggling topics)
    - Question breakdown (toggle blocks, one per question)

## Error Handling
- Notion not connected: return `{ error: 'notion_not_connected' }` — client shows connection instructions
- Page creation fails: return `{ error: 'notion_write_failed', message }` — client shows retry option
- Always return the created `page_id` on success for storage in `reports` table
