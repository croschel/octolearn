'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Download, FileText, HardDrive, Loader2, CheckCircle, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getPdfData, type PdfData } from '@/actions/reports'
import { exportToNotion } from '@/actions/notion-export'
import type { ResourceList } from '@/types/report'
import type { QuizQuestionRow } from '@/types/database'

// PDF renderer is client-only — dynamic import prevents SSR
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((m) => m.PDFDownloadLink),
  { ssr: false },
)
const QuizReportPDF = dynamic(
  () => import('@/components/quiz/QuizReportPDF').then((m) => m.QuizReportPDF),
  { ssr: false },
)

interface ReportExportBarProps {
  sessionId: string
  reportId: string
  notionPageId: string | null
  subjectArea: string
  completedAt: string
  report: PdfData['report']
  questions: QuizQuestionRow[]
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function ReportExportBar({
  reportId,
  notionPageId,
  subjectArea,
  completedAt,
}: ReportExportBarProps) {
  const [pdfData, setPdfData] = useState<PdfData | null>(null)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfReady, setPdfReady] = useState(false)

  const [notionLoading, setNotionLoading] = useState(false)
  const [notionSaved, setNotionSaved] = useState(!!notionPageId)
  const [notionPageUrl, setNotionPageUrl] = useState<string | null>(
    notionPageId ? `https://notion.so/${notionPageId.replace(/-/g, '')}` : null,
  )
  const [notionError, setNotionError] = useState<string | null>(null)

  const dateSlug = new Date(completedAt).toISOString().slice(0, 10)
  const pdfFileName = `octolearn-${slugify(subjectArea)}-${dateSlug}.pdf`

  async function handlePdfClick() {
    if (pdfReady) return
    setPdfLoading(true)
    const result = await getPdfData(reportId)
    setPdfLoading(false)
    if (result.error || !result.data) return
    setPdfData(result.data)
    setPdfReady(true)
  }

  async function handleNotionExport() {
    if (notionSaved) return
    setNotionLoading(true)
    setNotionError(null)
    const result = await exportToNotion(reportId)
    setNotionLoading(false)
    if ('error' in result) {
      setNotionError(result.error === 'notion_not_connected' ? 'notion_not_connected' : 'failed')
      return
    }
    setNotionSaved(true)
    setNotionPageUrl(result.pageUrl)
  }

  return (
    <div className="sticky bottom-0 bg-background/95 backdrop-blur border-t border-border/50 px-5 py-3 flex flex-col gap-2">
      {notionError === 'notion_not_connected' && (
        <div className="text-[12px] text-warning flex items-center gap-1.5">
          Connect your Notion account in{' '}
          <Link href="/settings" className="underline text-brand">
            Settings
          </Link>
        </div>
      )}
      {notionError === 'failed' && (
        <p className="text-[12px] text-error">Export failed. Please try again.</p>
      )}

      <div className="flex items-center justify-between gap-4">
        <p className="text-[13px] text-text-secondary font-medium hidden sm:block">
          Save this report
        </p>
        <div className="flex items-center gap-2 ml-auto">
          {/* PDF */}
          {pdfReady && pdfData ? (
            <PDFDownloadLink
              document={<QuizReportPDF report={pdfData.report} questions={pdfData.questions} />}
              fileName={pdfFileName}
            >
              {({ loading: pdfRenderLoading }) =>
                pdfRenderLoading ? (
                  <Button variant="outline" size="sm" disabled>
                    <Loader2 className="size-3.5 animate-spin" />
                    Preparing...
                  </Button>
                ) : (
                  <Button variant="outline" size="sm">
                    <Download className="size-3.5" />
                    Download PDF
                  </Button>
                )
              }
            </PDFDownloadLink>
          ) : (
            <Button variant="outline" size="sm" onClick={handlePdfClick} disabled={pdfLoading}>
              {pdfLoading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Preparing...
                </>
              ) : (
                <>
                  <Download className="size-3.5" />
                  Download PDF
                </>
              )}
            </Button>
          )}

          {/* Notion */}
          {notionSaved ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled
                className="text-success border-success/30"
              >
                <CheckCircle className="size-3.5 text-success" />
                Saved to Notion ✓
              </Button>
              {notionPageUrl && (
                <a href={notionPageUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="size-3.5" />
                    Open
                  </Button>
                </a>
              )}
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleNotionExport}
              disabled={notionLoading}
            >
              {notionLoading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FileText className="size-3.5" />
                  Save to Notion
                </>
              )}
            </Button>
          )}

          {/* Google Drive — visible but disabled until future phase */}
          <div title="Coming soon">
            <Button size="sm" disabled>
              <HardDrive className="size-3.5" />
              Save to Drive
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export type { ResourceList }
