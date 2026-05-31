export function buildTopicSuggesterPrompt(subjectArea: string): string {
  return `You are a software engineering study advisor.

For a developer studying "${subjectArea}", suggest exactly 6 specific, relevant study topics that are commonly tested in technical interviews or certifications.

Return ONLY a JSON array of 6 strings. No markdown, no explanation.

Example format:
["Topic One", "Topic Two", "Topic Three", "Topic Four", "Topic Five", "Topic Six"]

Topics must be specific (e.g. "Lambda cold starts and concurrency limits" not "Lambda") and actionable for a study session.`
}
