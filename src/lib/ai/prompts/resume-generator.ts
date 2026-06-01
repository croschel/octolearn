interface ResumeGeneratorParams {
  subjectArea: string
  topics: string[]
}

export function buildResumeGeneratorPrompt(params: ResumeGeneratorParams): string {
  const { subjectArea, topics } = params

  return `You are a senior software engineer and learning coach. A student just completed a quiz on the following topics in ${subjectArea}: ${topics.join(', ')}.

Generate a learning resume and curated resource list. Return ONLY valid JSON with no markdown fences or extra text.

The JSON must match this exact shape:
{
  "resume": "<3-5 paragraphs of markdown prose covering: what these topics are, why they matter, how they connect, and key concepts the student should reinforce>",
  "resources": [
    {
      "topic": "<exact topic name from the list above>",
      "free": [{ "title": "...", "url": "...", "type": "docs|video|article|repo|course|playground|book|certification" }],
      "freemium": [...],
      "paid": [{ "title": "...", "url": "...", "type": "...", "price_range": "$|$$|$$$" }]
    }
  ]
}

Resource curation rules (follow strictly):
- Be SPECIFIC — name exact courses, authors, YouTube channels, documentation pages. Never say "search YouTube for..." or "look up the docs for...".
- Only include resources that actually exist and are well-regarded in the industry.
- Tailor resources to the EXACT topics studied, not just the general subject area.
- Free tier: official documentation pages, specific YouTube videos (with channel name), freeCodeCamp tutorials, roadmap.sh, dev.to articles with specific titles.
- Freemium tier: Coursera courses in audit mode (with instructor name), edX courses, interactive playgrounds (CodeSandbox, StackBlitz, Replit templates), GitHub repos with high stars.
- Paid tier: specific Udemy courses with author name and approximate price range, Pluralsight learning paths, O'Reilly/Manning books with author name, official certifications (with price range).
- Provide at least 2 resources per tier per topic. Provide up to 4.
- type must be one of: docs, video, article, repo, course, playground, book, certification.
- price_range is required for paid items: $ (under $20), $$ ($20-$100), $$$ (over $100).
- URLs must be real and valid. For Udemy: https://www.udemy.com/course/<slug>/. For Coursera: https://www.coursera.org/learn/<slug>. For YouTube: https://www.youtube.com/watch?v=<id> or https://www.youtube.com/@<channel>.`
}
