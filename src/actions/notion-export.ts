'use server'

import { auth } from '@clerk/nextjs/server'
import { getNotionClient, NotionNotConnectedError } from '@/lib/integrations/notion'
import { tryCatch } from '@/lib/utils/try-catch'
import { createServerClient } from '@/lib/db/client'
import type { Report } from '@/types/report'
import type { BlockObjectRequest } from '@notionhq/client/build/src/api-endpoints'

type ExportResult =
  | { success: true; pageUrl: string }
  | { error: 'notion_not_connected' | 'export_failed'; message?: string }

// ─── helpers ─────────────────────────────────────────────────────────────────

function para(text: string): BlockObjectRequest {
  return {
    type: 'paragraph',
    paragraph: { rich_text: [{ type: 'text', text: { content: text } }] },
  }
}

function h2(text: string): BlockObjectRequest {
  return {
    type: 'heading_2',
    heading_2: { rich_text: [{ type: 'text', text: { content: text } }] },
  }
}

function h3(text: string): BlockObjectRequest {
  return {
    type: 'heading_3',
    heading_3: { rich_text: [{ type: 'text', text: { content: text } }] },
  }
}

function bullet(text: string): BlockObjectRequest {
  return {
    type: 'bulleted_list_item',
    bulleted_list_item: { rich_text: [{ type: 'text', text: { content: text } }] },
  }
}

function divider(): BlockObjectRequest {
  return { type: 'divider', divider: {} }
}

function bookmark(url: string, caption: string): BlockObjectRequest {
  return {
    type: 'bookmark',
    bookmark: {
      url,
      caption: [{ type: 'text', text: { content: caption } }],
    },
  }
}

// Find or create a Notion page with a given title under a given parent
async function findOrCreatePage(
  notion: Awaited<ReturnType<typeof getNotionClient>>,
  title: string,
  parentId: string | null,
): Promise<string> {
  const query = await notion.search({
    query: title,
    filter: { property: 'object', value: 'page' },
  })

  const match = query.results.find((r) => {
    if (r.object !== 'page') return false
    const p = r as { properties?: { title?: { title?: Array<{ plain_text?: string }> } } }
    const pageTitle = p.properties?.title?.title?.[0]?.plain_text ?? ''
    return pageTitle.toLowerCase() === title.toLowerCase()
  })

  if (match) return match.id

  const parent = parentId
    ? ({ type: 'page_id', page_id: parentId } as const)
    : ({ type: 'workspace', workspace: true } as const)

  const created = await notion.pages.create({
    parent,
    properties: {
      title: { title: [{ type: 'text', text: { content: title } }] },
    },
  })

  return created.id
}

// Append blocks in batches of 100 (Notion API limit)
async function appendBlocks(
  notion: Awaited<ReturnType<typeof getNotionClient>>,
  pageId: string,
  blocks: BlockObjectRequest[],
): Promise<void> {
  const BATCH = 100
  for (let i = 0; i < blocks.length; i += BATCH) {
    await notion.blocks.children.append({
      block_id: pageId,
      // The SDK exposes two separate block union types for create vs append; our flat blocks satisfy both at runtime
      children: blocks.slice(i, i + BATCH) as unknown as Parameters<
        typeof notion.blocks.children.append
      >[0]['children'],
    })
  }
}

// ─── exportToNotion ───────────────────────────────────────────────────────────

export async function exportToNotion(reportId: string): Promise<ExportResult> {
  const { userId } = await auth()
  if (!userId) return { error: 'export_failed', message: 'Unauthorized' }

  const supabase = createServerClient()

  // Fetch report
  const { data: reportRow, error: reportError } = await supabase
    .from('reports')
    .select('*')
    .eq('id', reportId)
    .single()

  if (reportError || !reportRow) return { error: 'export_failed', message: 'Report not found' }
  const report = reportRow as unknown as Report
  if (report.user_id !== userId) return { error: 'export_failed', message: 'Unauthorized' }

  // If already exported, return existing URL
  if (report.notion_page_id) {
    return {
      success: true,
      pageUrl: `https://notion.so/${report.notion_page_id.replace(/-/g, '')}`,
    }
  }

  // Fetch questions for the breakdown
  const { data: questionRows } = await supabase
    .from('quiz_questions')
    .select('question, type, correct_answer, user_answer, is_correct')
    .eq('session_id', report.session_id)
    .order('position', { ascending: true })

  type QRow = {
    question: string
    type: string
    correct_answer: string
    user_answer: string | null
    is_correct: boolean | null
  }
  const questions = (questionRows ?? []) as QRow[]

  // Get Notion client
  let notion: Awaited<ReturnType<typeof getNotionClient>>
  try {
    notion = await getNotionClient(userId)
  } catch (err) {
    if (err instanceof NotionNotConnectedError) return { error: 'notion_not_connected' }
    return { error: 'export_failed', message: String(err) }
  }

  const notionResult = await tryCatch(async () => {
    // Find or create root "OctoLearn 🐙" page
    const rootPageId = await findOrCreatePage(notion, 'OctoLearn 🐙', null)

    // Find or create subject area child page
    const areaPageId = await findOrCreatePage(notion, report.subject_area, rootPageId)

    // Compose score label
    const scoreLabel =
      report.score_percentage >= 90
        ? 'Excellent result'
        : report.score_percentage >= 80
          ? 'Great result'
          : report.score_percentage >= 60
            ? 'Good effort'
            : 'Keep practicing'

    const dateStr = new Date(report.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    // Create the report page with initial blocks
    const reportPageTitle = `${report.subject_area} Quiz — ${dateStr}`

    const topBlocks: BlockObjectRequest[] = [
      {
        type: 'callout',
        callout: {
          icon: { type: 'emoji', emoji: '🎯' },
          rich_text: [
            {
              type: 'text',
              text: { content: `${report.score_percentage}% — ${scoreLabel}` },
            },
          ],
        },
      },
      para(`📅 ${dateStr}   |   Topics: ${report.topics_covered.join(', ')}`),
      h2('Quiz Summary'),
      para(report.summary),
    ]

    const struggling = report.struggling_topics ?? []
    if (struggling.length > 0) {
      topBlocks.push(h2('Areas to Review'))
      struggling.forEach((t) => topBlocks.push(bullet(t)))
    }

    const reportPage = await notion.pages.create({
      parent: { type: 'page_id', page_id: areaPageId },
      properties: {
        title: { title: [{ type: 'text', text: { content: reportPageTitle } }] },
      },
      children: topBlocks,
    })

    // Build question breakdown blocks
    // Note: toggle block with inline children requires BlockObjectRequestWithoutChildren[] which is
    // a different SDK type from BlockObjectRequest[]. We use a headerless toggle and append items
    // after page creation to avoid the type collision.
    const qBlocks: BlockObjectRequest[] = [
      h2('Question Breakdown'),
      ...questions.map((q) =>
        bullet(
          `[${q.type === 'multiple-choice' ? 'MC' : 'Desc'}] ${q.question} | Your: ${q.user_answer ?? '—'} | Correct: ${q.correct_answer} ${q.is_correct ? '✓' : '✗'}`,
        ),
      ),
      divider(),
    ]

    // Learning resume
    if (report.learning_resume) {
      qBlocks.push(h2('Learning Resume'))
      const paras = report.learning_resume.split(/\n\n+/)
      paras.forEach((p) => qBlocks.push(para(p)))
    }

    // References
    if (report.resources && report.resources.length > 0) {
      qBlocks.push(h2('References & Resources'))
      for (const tr of report.resources) {
        qBlocks.push(h3(tr.topic))
        if (tr.free.length > 0) {
          qBlocks.push(bullet('Free'))
          tr.free.forEach((r) => qBlocks.push(bookmark(r.url, r.title)))
        }
        if (tr.freemium.length > 0) {
          qBlocks.push(bullet('Freemium'))
          tr.freemium.forEach((r) => qBlocks.push(bookmark(r.url, r.title)))
        }
        if (tr.paid.length > 0) {
          qBlocks.push(bullet(`Paid ${tr.paid[0]?.price_range ?? ''}`))
          tr.paid.forEach((r) => qBlocks.push(bookmark(r.url, r.title)))
        }
      }
    }

    // Append remaining blocks in batches
    await appendBlocks(notion, reportPage.id, qBlocks)

    // Save notion_page_id to reports row
    await supabase.from('reports').update({ notion_page_id: reportPage.id }).eq('id', reportId)

    return reportPage.id
  }, 'NOTION_EXPORT_FAILED')

  if (notionResult.error) {
    console.error('[notion-export]', notionResult.error)
    return { error: 'export_failed', message: notionResult.error.message }
  }

  return {
    success: true,
    pageUrl: `https://notion.so/${notionResult.data.replace(/-/g, '')}`,
  }
}
