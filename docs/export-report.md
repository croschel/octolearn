# Command: /export-report

## Description
Scaffold or update the report export flow for a specific integration target.

## Usage
```
/export-report [target]
```
Where `[target]` is one of: `notion`, `drive`, `pdf`

## Examples
```
/export-report notion
/export-report pdf
```

## What This Does

### `/export-report notion`
1. Loads `agents/notion-integration.md`
2. Verifies `.mcp.json` has `notion-mcp` configured
3. Scaffolds or updates `actions/reports.ts` with `exportToNotion` server action
4. Creates `lib/integrations/notion.ts` helper if it doesn't exist

### `/export-report drive`
1. Loads `agents/drive-integration.md` (if exists)
2. Verifies `.mcp.json` has `google-drive-mcp` configured
3. Scaffolds or updates `actions/reports.ts` with `exportToDrive` server action
4. Creates `lib/integrations/drive.ts` helper if it doesn't exist

### `/export-report pdf`
1. Checks for `@react-pdf/renderer` in `package.json`
2. If missing: outputs install command to run manually
3. Scaffolds `components/quiz/QuizReportPDF.tsx` as a PDF document component
4. Updates `actions/reports.ts` with PDF generation logic

## Rules Applied
- `rules/ai-usage.md`
- `rules/typescript.md`
