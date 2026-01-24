const formatTitles = (titles: string[]) =>
  titles.map((title, index) => `${index + 1}. ${title}`).join("\n");

export const baselinePrompt = (
  titles: string[],
) => `You label ONE scientific topic cluster from paper titles.

Output constraints:
- 3–8 words, noun phrase (no verbs), no trailing punctuation
- sentence case (not Title Case), output must always begin with a capital letter
- always keep proper names (second names, geographical names) capitalized
- always use all upper cases for acronyms
- avoid generic/meta words: research, study, advances, progress, review, overview, recent
- avoid vague umbrella terms (method, approach, framework, application) unless they are the actual topic
- no years, no journal names, no author names

Coherence / noise decision (critical):
First decide whether this cluster is coherent.

Output english = "Mixed or noisy cluster" if ANY of the following are true:
- There are 2+ unrelated topics of similar weight.
- Titles span clearly different scientific domains (e.g., chemistry + nursing + economics).
- The titles are mostly editorial/administrative/meta (retractions, publication statistics, milestones, introductions).
- Many titles are non-scientific/organizational boilerplate.
- The shared theme is too abstract to label without guessing (no stable shared noun phrase).

If coherent:
- Produce the most specific shared topic label supported by the titles.
- Prefer established terms (e.g., "hepcidin regulation" not "iron control mechanisms").
- If a geographic qualifier appears in most titles, include it; otherwise omit it.

Self-check before answering:
- Can you point to at least 5 titles that match your label without stretching? If not, return "Mixed or noisy cluster".
- If your label exceeds 8 words, shorten it.

Titles:
${formatTitles(titles)}`;
