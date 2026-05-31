/**
 * Shared chrome for legal/policy pages. Keeps Privacy + Terms consistent.
 * NOTE: the copy here is a good-faith starting template — have it reviewed by
 * counsel before commercial launch (tracked in PRODUCTION_CHECKLIST.md).
 */
export default function LegalPage({ eyebrow, title, updated, children }) {
  return (
    <article className="mx-auto max-w-3xl px-6 pt-14 pb-20">
      <span className="eyebrow">{eyebrow}</span>
      <h1 className="mt-2 font-display text-4xl font-semibold leading-tight md:text-5xl">{title}</h1>
      <p className="mt-2 font-display text-sm font-medium text-ink-3">Last updated: {updated}</p>
      <div className="legal-prose mt-8 flex flex-col gap-6 text-ink-2">{children}</div>
    </article>
  );
}

export function Section({ heading, children }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-display text-xl font-semibold text-ink">{heading}</h2>
      {children}
    </section>
  );
}
