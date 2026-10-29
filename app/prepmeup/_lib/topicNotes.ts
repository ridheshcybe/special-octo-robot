import type { PmuNote, PmuTopic } from "./data";

/** Resolve existing content only. A missing lesson is not a license to invent one. */
export function resolveTopicNote(
  topic: PmuTopic,
  sampleNote: PmuNote | null,
  library: Readonly<Record<string, string>>,
): string | null {
  if (topic.is_sample && sampleNote?.topic_id === topic.id && sampleNote.content?.trim()) {
    return sampleNote.content;
  }
  const content = library[topic.slug];
  return content?.trim() ? content : null;
}
