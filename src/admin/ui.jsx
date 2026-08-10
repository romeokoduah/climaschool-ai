// Shared primitives for the operations console.
//
// The console is a working tool, not a marketing page: denser, calmer and more
// tabular than the public site, but built from the same tokens so it still reads
// as ClimaSchool.

import { AlertTriangle, Inbox, Loader2 } from "lucide-react";

export const BAND_STYLE = {
  GREEN:  { dot: "bg-leaf",      text: "text-leaf",      chip: "bg-leaf/15 text-leaf",           label: "Normal" },
  YELLOW: { dot: "bg-sun",       text: "text-[#8a6500]", chip: "bg-sun/20 text-[#8a6500]",       label: "Watch" },
  ORANGE: { dot: "bg-heat",      text: "text-heat",      chip: "bg-heat/15 text-heat",           label: "Prepare" },
  RED:    { dot: "bg-[#c62828]", text: "text-[#c62828]", chip: "bg-[#c62828]/15 text-[#c62828]", label: "Act" }
};

export function Card({ title, action, children, className = "" }) {
  return (
    <section className={`rounded-xl3 border-2 border-line bg-paper shadow-soft ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 border-b-2 border-dashed border-line px-5 py-3.5">
          {title && <h2 className="font-display text-base font-semibold">{title}</h2>}
          {action}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Stat({ label, value, sub, tone = "text-heat" }) {
  return (
    <div className="rounded-xl3 border-2 border-line bg-paper p-5 shadow-soft">
      <span className="font-display text-[11px] font-semibold uppercase tracking-widest text-ink-3">{label}</span>
      <strong className={`mt-1 block font-display text-3xl font-bold leading-none ${tone}`}>{value}</strong>
      {sub && <span className="mt-1 block text-xs text-ink-2">{sub}</span>}
    </div>
  );
}

/** Risk band chip. Always carries the text label — never colour alone. */
export function BandChip({ band }) {
  const s = BAND_STYLE[band] ?? BAND_STYLE.GREEN;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-display text-[11px] font-bold ${s.chip}`}>
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {band} — {s.label}
    </span>
  );
}

export function StatusChip({ status }) {
  const pretty = String(status ?? "").replace(/_/g, " ");
  return (
    <span className="inline-block rounded-full bg-cream-2 px-2.5 py-1 font-display text-[11px] font-semibold uppercase tracking-wide text-ink-2">
      {pretty}
    </span>
  );
}

export function Button({ children, variant = "primary", className = "", ...rest }) {
  const styles = {
    primary: "bg-heat text-white hover:brightness-105",
    ghost: "border-2 border-line-2 bg-paper text-ink hover:border-heat hover:text-heat",
    danger: "border-2 border-[#c62828] bg-paper text-[#c62828] hover:bg-[#c62828] hover:text-white"
  };
  return (
    <button
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-display text-[13px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Field({ id, label, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-display text-sm font-semibold">{label}</label>
      {children}
      {hint && <span className="text-xs text-ink-3">{hint}</span>}
    </div>
  );
}

export const inputClass =
  "rounded-xl2 border-2 border-line-2 bg-cream px-3.5 py-2 text-sm text-ink focus:border-heat focus:outline-none";

export function Table({ columns, rows, empty = "Nothing here yet." }) {
  if (!rows?.length) return <EmptyState message={empty} />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                className="border-b-2 border-line px-3 py-2 font-display text-[11px] font-bold uppercase tracking-widest text-ink-3"
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id ?? i} className="border-b border-dashed border-line last:border-0 hover:bg-cream-2/60">
              {columns.map((c) => (
                <td key={c.key} className="px-3 py-3 align-top text-ink-2">
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center">
      <Inbox aria-hidden="true" className="h-7 w-7 text-line-2" />
      <p className="text-sm text-ink-3">{message}</p>
    </div>
  );
}

export function Loading({ label = "Loading…" }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-ink-3" role="status">
      <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function ErrorNote({ error, onRetry }) {
  if (!error) return null;
  return (
    <div role="alert" className="flex flex-wrap items-center gap-3 rounded-xl2 border-2 border-heat bg-heat/10 px-4 py-3">
      <AlertTriangle aria-hidden="true" className="h-4 w-4 shrink-0 text-heat" />
      <span className="text-sm text-ink">{error.message || "Something went wrong."}</span>
      {onRetry && <Button variant="ghost" onClick={onRetry} className="ml-auto">Retry</Button>}
    </div>
  );
}

/** Wraps a page body: shows spinner, error or content, so pages don't repeat it. */
export function Async({ state, children, empty }) {
  if (state.loading) return <Loading />;
  if (state.error) return <ErrorNote error={state.error} onRetry={state.reload} />;
  if (empty && (!state.data || (Array.isArray(state.data) && state.data.length === 0)))
    return <EmptyState message={empty} />;
  return children(state.data);
}

export function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
