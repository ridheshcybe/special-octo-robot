/** Minimum items per half so the loop stays wider than ultra-wide viewports. */
const MIN_HALF_ITEMS = 10;

/**
 * The word list is rendered as two identical halves and the track translates
 * -50%, so one pass is seamless. Each half is padded to at least 10 entries,
 * which keeps it wider than the viewport on ultra-wide screens.
 */
export function Marquee({ words }: { words: string[] }) {
  const base = words.length ? words : ["Ship Fast"];
  const half: string[] = [];
  while (half.length < MIN_HALF_ITEMS) half.push(...base);

  const items = [...half, ...half];

  return (
    <section className="marquee" aria-label="Operating principles">
      <div className="marquee-track">
        {items.map((word, i) => (
          <span className="marquee-item" key={`${word}-${i}`}>
            {word}
            <span className="marquee-dot" aria-hidden="true" />
          </span>
        ))}
      </div>
    </section>
  );
}
