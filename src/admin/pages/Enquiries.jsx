// Inbox for the public site's contact and partnership form.
//
// Enquiries are people waiting for a reply, so the page opens on the ones nobody
// has dealt with yet and keeps a running count of that backlog in view.

import { useState } from "react";
import { CheckCircle2, Mail } from "lucide-react";
import { api } from "../../lib/api";
import { useApi, useAuth } from "../AuthContext.jsx";
import { Async, Button, Card, ErrorNote, Field, Stat, formatDate, inputClass } from "../ui.jsx";

// The API caps a page at 500. Asking for the ceiling means the backlog figure is
// exact until it is genuinely enormous, and honest ("500+") after that.
const LIMIT = 500;

const FILTERS = {
  unhandled: { label: "Unhandled", params: { handled: false } },
  handled: { label: "Handled", params: { handled: true } },
  all: { label: "All enquiries", params: {} }
};

const dash = (value) => (value === null || value === undefined || value === "" ? "—" : value);

export default function Enquiries() {
  const { token } = useAuth();
  const [filter, setFilter] = useState("unhandled");

  const list = useApi((t) => api.listEnquiries({ ...FILTERS[filter].params, limit: LIMIT }, t), [filter]);
  // Separate from the list so the backlog figure stays true while you browse
  // handled enquiries or the full archive.
  const backlog = useApi((t) => api.listEnquiries({ handled: false, limit: LIMIT }, t), []);

  const [updated, setUpdated] = useState({});
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [notice, setNotice] = useState("");

  async function markHandled(enquiry) {
    setBusyId(enquiry.id);
    setActionError(null);
    setNotice("");
    try {
      const record = await api.markEnquiryHandled(enquiry.id, token);
      // Patch the row rather than refetching the list: under the default filter a
      // reload would make the enquiry vanish the instant you acted on it, which
      // reads as a bug rather than a confirmation.
      setUpdated((prev) => ({ ...prev, [record.id]: record }));
      setNotice(`Enquiry from ${enquiry.name} marked as handled.`);
      backlog.reload();
    } catch (err) {
      setActionError(err);
    } finally {
      setBusyId(null);
    }
  }

  const backlogCount = backlog.loading
    ? "…"
    : backlog.error || !backlog.data
      ? "—"
      : backlog.data.length >= LIMIT
        ? `${LIMIT}+`
        : backlog.data.length;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-2xl font-bold">Enquiries</h1>
        <p className="mt-1 text-sm text-ink-2">
          Messages sent through the contact and partnership form on the public site.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Awaiting a reply" value={backlogCount} sub="Enquiries not yet marked as handled" />
      </div>

      {backlog.error && <ErrorNote error={backlog.error} onRetry={backlog.reload} />}

      <Card
        title="Inbox"
        action={
          <div className="w-56">
            <Field id="enquiry-filter" label="Show">
              <select
                id="enquiry-filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className={inputClass}
              >
                {Object.entries(FILTERS).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </Field>
          </div>
        }
      >
        <div aria-live="polite" className="empty:hidden">
          {notice && (
            <p className="mb-4 rounded-xl2 border-2 border-leaf bg-leaf/10 px-4 py-2.5 text-sm text-ink">
              {notice}
            </p>
          )}
        </div>

        {actionError && (
          <div className="mb-4">
            <ErrorNote error={actionError} />
          </div>
        )}

        <Async state={list} empty="No enquiries match this filter.">
          {(data) => (
            <ul className="flex flex-col gap-4">
              {(data ?? []).map((raw) => {
                const enquiry = updated[raw.id] ?? raw;
                return (
                  <li key={enquiry.id}>
                    <article className="rounded-xl2 border-2 border-line bg-cream/50 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-display text-base font-semibold">{enquiry.name}</h3>
                          <p className="mt-0.5 text-sm">
                            <a
                              href={`mailto:${enquiry.email}`}
                              className="inline-flex items-center gap-1.5 text-heat underline underline-offset-2"
                            >
                              <Mail aria-hidden="true" className="h-3.5 w-3.5" />
                              {enquiry.email}
                            </a>
                          </p>
                        </div>
                        {enquiry.handled ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-leaf/15 px-3 py-1 font-display text-[11px] font-bold text-leaf">
                            <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />
                            Handled
                          </span>
                        ) : (
                          <Button
                            variant="ghost"
                            onClick={() => markHandled(enquiry)}
                            disabled={busyId === enquiry.id}
                          >
                            {busyId === enquiry.id ? "Marking…" : "Mark handled"}
                          </Button>
                        )}
                      </div>

                      <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-3">
                        <div>
                          <dt className="font-display text-[11px] font-bold uppercase tracking-widest text-ink-3">Organisation</dt>
                          <dd className="text-ink-2">{dash(enquiry.organisation)}</dd>
                        </div>
                        <div>
                          <dt className="font-display text-[11px] font-bold uppercase tracking-widest text-ink-3">Topic</dt>
                          <dd className="text-ink-2">{dash(enquiry.topic)}</dd>
                        </div>
                        <div>
                          <dt className="font-display text-[11px] font-bold uppercase tracking-widest text-ink-3">Received</dt>
                          <dd className="text-ink-2">{formatDate(enquiry.created_at)}</dd>
                        </div>
                      </dl>

                      <p className="mt-3 whitespace-pre-wrap border-t-2 border-dashed border-line pt-3 text-sm text-ink-2">
                        {dash(enquiry.message)}
                      </p>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
        </Async>
      </Card>
    </div>
  );
}
