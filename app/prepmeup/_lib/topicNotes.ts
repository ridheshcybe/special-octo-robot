import type { PmuNote, PmuTopic } from "./data";

/** Resolve existing content only. A missing lesson is not a license to invent one. */
export function resolveTopicNote(
  topic: PmuTopic,
  sampleNote: PmuNote | null,
  library: Readonly<Record<string, string>>,
): string | null {
  const libContent = library[topic.slug];
  if (libContent && libContent.trim()) {
    return libContent;
  }
  if (topic.is_sample && sampleNote?.topic_id === topic.id && sampleNote.content?.trim()) {
    return sampleNote.content;
  }
  return null;
}
