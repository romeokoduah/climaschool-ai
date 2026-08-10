// Alert review desk — the screen where the safety gate is actually operated.
//
// The API is the authority on what may happen next (backend/app/routers/alerts.py).
// The rules below are mirrored here only so the desk can explain, before a click,
// why a step is unavailable; every write still goes to the server and every
// refusal it sends back is shown verbatim.

import { useEffect, useRef, useState } from "react";
import { Send, ShieldAlert, ShieldCheck, X } from "lucide-react";
import { api } from "../../lib/api";
import { useApi, useAuth } from "../AuthContext.jsx";
import {
  Async,
  BandChip,
  Button,
  Card,
  EmptyState,
  ErrorNote,
  Field,
  formatDate,
  inputClass,
  Loading,
  Stat,
  StatusChip,
  Table
} from "../ui.jsx";

const STATUSES = [
  "created",
  "reviewed",
  "issued",
  "acknowledged",
  "action_started",
  "action_completed",
  "closed",
  "rejected"
];

const BANDS = ["GREEN", "YELLOW", "ORANGE", "RED"];

const HAZARDS = [
  { value: "heat", label: "Heat" },
  { value: "flood_wash", label: "Flood and WASH" },
  { value: "disease", label: "Disease" },
  { value: "air_quality", label: "Air quality" },
  { value: "nutrition", label: "Nutrition" },
  { value: "wellbeing", label: "Wellbeing" }
];

// Mirrors risk_engine.requires_human_review: ORANGE and RED never self-issue.
const GATED_BANDS = new Set(["ORANGE", "RED"]);

// Mirrors _TRANSITIONS in the alerts router, so the desk only offers steps the
// API will accept. Path segments are exactly the router's route suffixes.
const LIFECYCLE = [
  { stage: "acknowledge", label: "Acknowledge", from: ["issued"] },
  { stage: "action-started", label: "Action started", from: ["acknowledged"] },
  { stage: "action-completed", label: "Action completed", from: ["action_started"] },
  {
    stage: "close",
    label: "Close",
    from: ["reviewed", "issued", "acknowledged", "action_started", "action_completed", "rejected"]
  }
];

function gateApplies(alert) {
  return Boolean(alert?.requires_human_review) || GATED_BANDS.has(alert?.band);
}

function isReviewed(alert) {
  return alert?.status === "reviewed" && alert?.reviewed_by_id != null && alert?.reviewed_at != null;
}

function pretty(value) {
  return value == null || value === "" ? "—" : String(value).replace(/_/g, " ");
}

function num(value) {
  return typeof value === "number" && Number.isFinite(value) ? value.toLocaleString("en-GB") : "—";
}

function percent(value) {
  return typeof value === "number" && Number.isFinite(value) ? `${Math.round(value)}%` : "—";
}

export default function Alerts() {
  const { token } = useAuth();
  const [filters, setFilters] = useState({ status: "", band: "", district: "", hazard: "" });
  const [districtDraft, setDistrictDraft] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const panelRef = useRef(null);

  const alerts = useApi((t) => api.listAlerts({ ...filters, limit: 100 }, t), [
    filters.status,
    filters.band,
    filters.district,
    filters.hazard
  ]);
  const minutes = useApi((t) => api.minutesOfProtection(t), []);
  // Registry names are a courtesy, not the record: if the lookup fails the desk
  // still works and falls back to the school id.
  const schools = useApi(() => api.listSchools({ limit: 500 }).catch(() => []), []);
  const detail = useApi(
    (t) => (selectedId == null ? Promise.resolve(null) : api.getAlert(selectedId, t)),
    [selectedId]
  );

  useEffect(() => {
    if (selectedId != null) panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [selectedId]);

  const schoolName = (id) => {
    if (id == null) return "—";
    const match = Array.isArray(schools.data) ? schools.data.find((s) => s.id === id) : null;
    return match?.name ?? `School #${id}`;
  };

  function afterWrite() {
    detail.reload();
    alerts.reload();
    minutes.reload();
  }

  const columns = [
    { key: "band", header: "Band", render: (r) => <BandChip band={r.band} /> },
    {
      key: "title",
      header: "Alert",
      render: (r) => (
        <button
          type="button"
          onClick={() => setSelectedId(r.id)}
          aria-pressed={selectedId === r.id}
          className={`text-left font-display text-sm font-semibold underline-offset-2 hover:text-heat hover:underline ${
            selectedId === r.id ? "text-heat" : "text-ink"
          }`}
        >
          {r.title}
        </button>
      )
    },
    { key: "district", header: "District", render: (r) => pretty(r.district) },
    { key: "hazard", header: "Hazard", render: (r) => pretty(r.hazard) },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <span className="flex flex-col items-start gap-1">
          <StatusChip status={r.status} />
          {gateApplies(r) && !isReviewed(r) && r.status === "created" && (
            <span className="font-display text-[11px] font-bold uppercase tracking-wide text-heat">
              Awaiting review
            </span>
          )}
        </span>
      )
    },
    { key: "confidence", header: "Confidence", render: (r) => percent(r.confidence) },
    { key: "created_at", header: "Created", render: (r) => formatDate(r.created_at) }
  ];

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-2xl font-bold">Alert review</h1>
        <p className="mt-1 text-sm text-ink-2">
          Every ORANGE and RED alert needs a named reviewer before it can reach a school,
          a parent or a health facility.
        </p>
      </header>

      <MinutesCard state={minutes} />

      <Card title="Filters">
        <form
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"
          onSubmit={(e) => {
            e.preventDefault();
            setFilters((f) => ({ ...f, district: districtDraft.trim() }));
          }}
        >
          <Field id="filter-status" label="Status">
            <select
              id="filter-status"
              className={inputClass}
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            >
              <option value="">Any status</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {pretty(s)}
                </option>
              ))}
            </select>
          </Field>

          <Field id="filter-band" label="Band">
            <select
              id="filter-band"
              className={inputClass}
              value={filters.band}
              onChange={(e) => setFilters((f) => ({ ...f, band: e.target.value }))}
            >
              <option value="">Any band</option>
              {BANDS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </Field>

          <Field id="filter-hazard" label="Hazard">
            <select
              id="filter-hazard"
              className={inputClass}
              value={filters.hazard}
              onChange={(e) => setFilters((f) => ({ ...f, hazard: e.target.value }))}
            >
              <option value="">Any hazard</option>
              {HAZARDS.map((h) => (
                <option key={h.value} value={h.value}>
                  {h.label}
                </option>
              ))}
            </select>
          </Field>

          <Field id="filter-district" label="District" hint="Exact match. Press Enter to apply.">
            <input
              id="filter-district"
              type="search"
              className={inputClass}
              value={districtDraft}
              onChange={(e) => setDistrictDraft(e.target.value)}
              onBlur={() => setFilters((f) => ({ ...f, district: districtDraft.trim() }))}
            />
          </Field>

          <div className="flex items-end gap-2">
            <Button type="submit" variant="ghost">
              Apply
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setDistrictDraft("");
                setFilters({ status: "", band: "", district: "", hazard: "" });
              }}
            >
              Clear
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Alerts">
        <Async state={alerts}>
          {(rows) => (
            <div aria-live="polite">
              <Table columns={columns} rows={rows ?? []} empty="No alerts match these filters." />
            </div>
          )}
        </Async>
      </Card>

      <div ref={panelRef}>
        {selectedId == null ? (
          <Card title="Alert detail">
            <EmptyState message="Select an alert above to review it." />
          </Card>
        ) : (
          <Card
            title="Alert detail"
            action={
              <Button type="button" variant="ghost" onClick={() => setSelectedId(null)}>
                <X aria-hidden="true" className="h-4 w-4" /> Close
              </Button>
            }
          >
            {detail.loading && <Loading label="Loading alert…" />}
            {detail.error && <ErrorNote error={detail.error} onRetry={detail.reload} />}
            {!detail.loading && !detail.error && detail.data && (
              <AlertDetail
                key={detail.data.id}
                alert={detail.data}
                token={token}
                schoolName={schoolName}
                onChanged={afterWrite}
              />
            )}
          </Card>
        )}
      </div>
    </div>
  );
}

/** The signature metric. Nulls and an empty ledger are reported as such. */
function MinutesCard({ state }) {
  return (
    <Card title="Minutes of Protection">
      <Async state={state}>
        {(data) => {
          if (!data) return <EmptyState message="No data yet." />;
          if (!data.issued_alerts) {
            return (
              <div aria-live="polite">
                <EmptyState message="No alerts have been issued yet, so there are no minutes of protection to report." />
                <p className="text-xs text-ink-3">{data.definition}</p>
              </div>
            );
          }
          const noData = <span className="text-base font-semibold text-ink-3">No data yet</span>;
          return (
            <div aria-live="polite">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Stat
                  label="Alerts issued"
                  value={num(data.issued_alerts)}
                  sub={`${num(data.alerts_with_completed_action)} with a completed action`}
                />
                <Stat
                  label="Children reached"
                  value={data.children_reached_unique ? num(data.children_reached_unique) : noData}
                  sub={`${num(data.schools_reached)} schools`}
                  tone="text-ink"
                />
                <Stat
                  label="Median lead time"
                  value={
                    data.median_lead_time_hours == null ? noData : `${data.median_lead_time_hours} h`
                  }
                  sub={
                    data.mean_lead_time_hours == null
                      ? "Issue to completed action"
                      : `Mean ${data.mean_lead_time_hours} h`
                  }
                  tone="text-ink"
                />
                <Stat
                  label="Minutes of protection"
                  value={
                    data.total_minutes_of_protection == null
                      ? noData
                      : num(data.total_minutes_of_protection)
                  }
                  sub="Lead time × children reached"
                />
              </div>
              <p className="mt-4 text-xs text-ink-3">{data.definition}</p>
            </div>
          );
        }}
      </Async>
    </Card>
  );
}

function AlertDetail({ alert, token, schoolName, onChanged }) {
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);
  const [reviewNote, setReviewNote] = useState("");
  const [stepNote, setStepNote] = useState("");

  const gated = gateApplies(alert);
  const reviewed = isReviewed(alert);
  const showReview = gated && alert.status === "created";
  const issuable = alert.status === "created" || alert.status === "reviewed";
  const issueBlocked = gated && !reviewed;
  const nextSteps = LIFECYCLE.filter((s) => s.from.includes(alert.status));
  const events = [...(alert.events ?? [])].sort(
    (a, b) => new Date(a.occurred_at) - new Date(b.occurred_at) || a.id - b.id
  );
  const modules =
    alert.module_scores && typeof alert.module_scores === "object"
      ? Object.entries(alert.module_scores)
      : [];

  async function run(key, work) {
    setBusy(key);
    setError(null);
    try {
      await work();
      setReviewNote("");
      setStepNote("");
      onChanged();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <BandChip band={alert.band} />
          <StatusChip status={alert.status} />
          {gated && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-heat/10 px-2.5 py-1 font-display text-[11px] font-bold text-heat">
              <ShieldAlert aria-hidden="true" className="h-3.5 w-3.5" />
              Human review required
            </span>
          )}
        </div>
        <h3 className="mt-3 font-display text-lg font-bold">{alert.title}</h3>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
          <Detail term="District" value={pretty(alert.district)} />
          <Detail term="School" value={schoolName(alert.school_id)} />
          <Detail term="Hazard" value={pretty(alert.hazard)} />
          <Detail term="Confidence" value={percent(alert.confidence)} />
          <Detail term="Created" value={formatDate(alert.created_at)} />
          <Detail term="Reviewed" value={alert.reviewed_at ? formatDate(alert.reviewed_at) : "—"} />
          <Detail term="Issued" value={alert.issued_at ? formatDate(alert.issued_at) : "—"} />
          <Detail term="Closed" value={alert.closed_at ? formatDate(alert.closed_at) : "—"} />
        </dl>
      </div>

      <section>
        <h4 className="font-display text-sm font-bold uppercase tracking-widest text-ink-3">Message</h4>
        <p className="mt-2 whitespace-pre-line rounded-xl2 border-2 border-dashed border-line bg-cream px-4 py-3 text-sm text-ink">
          {alert.message || "—"}
        </p>
      </section>

      <section>
        <h4 className="font-display text-sm font-bold uppercase tracking-widest text-ink-3">Evidence</h4>
        {alert.evidence?.length ? (
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-2">
            {alert.evidence.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-ink-3">—</p>
        )}
      </section>

      {modules.length > 0 && (
        <section>
          <h4 className="font-display text-sm font-bold uppercase tracking-widest text-ink-3">
            Module scores
          </h4>
          <dl className="mt-2 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-3">
            {modules.map(([key, value]) => (
              <Detail
                key={key}
                term={pretty(key)}
                value={typeof value === "number" ? Math.round(value) : pretty(value)}
              />
            ))}
          </dl>
        </section>
      )}

      {alert.band_guidance && (
        <section>
          <h4 className="font-display text-sm font-bold uppercase tracking-widest text-ink-3">
            Band guidance
          </h4>
          <p className="mt-2 text-sm text-ink-2">{alert.band_guidance.meaning ?? "—"}</p>
          {alert.band_guidance.platform_action && (
            <p className="mt-1 text-sm text-ink-3">
              Platform action: {alert.band_guidance.platform_action}
            </p>
          )}
        </section>
      )}

      {error && <ErrorNote error={error} />}

      {showReview && (
        <section className="rounded-xl2 border-2 border-heat bg-heat/5 p-5">
          <h4 className="flex items-center gap-2 font-display text-base font-bold text-ink">
            <ShieldAlert aria-hidden="true" className="h-4 w-4 text-heat" />
            Human review required
          </h4>
          <p className="mt-1 text-sm text-ink-2">
            This is a {alert.band} alert. It cannot be distributed until you approve it under
            your own name. Rejecting it closes the alert and records why.
          </p>
          <div className="mt-4 flex flex-col gap-3">
            <Field
              id="review-note"
              label="Reviewer note"
              hint="Recorded against your name in the audit trail."
            >
              <textarea
                id="review-note"
                rows={3}
                className={inputClass}
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
              />
            </Field>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                disabled={busy !== null}
                onClick={() =>
                  run("approve", () =>
                    api.reviewAlert(alert.id, { approve: true, note: reviewNote.trim() || null }, token)
                  )
                }
              >
                <ShieldCheck aria-hidden="true" className="h-4 w-4" />
                {busy === "approve" ? "Approving…" : "Approve for issue"}
              </Button>
              <Button
                type="button"
                variant="danger"
                disabled={busy !== null}
                onClick={() =>
                  run("reject", () =>
                    api.reviewAlert(alert.id, { approve: false, note: reviewNote.trim() || null }, token)
                  )
                }
              >
                {busy === "reject" ? "Rejecting…" : "Reject"}
              </Button>
            </div>
          </div>
        </section>
      )}

      <section aria-live="polite">
        <h4 className="font-display text-sm font-bold uppercase tracking-widest text-ink-3">
          Lifecycle
        </h4>
        <div className="mt-3 flex flex-col gap-3">
          {issuable && (
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                disabled={issueBlocked || busy !== null}
                aria-describedby={issueBlocked ? "issue-blocked" : undefined}
                onClick={() => run("issue", () => api.issueAlert(alert.id, token))}
              >
                <Send aria-hidden="true" className="h-4 w-4" />
                {busy === "issue" ? "Issuing…" : "Issue alert"}
              </Button>
              {issueBlocked && (
                <p id="issue-blocked" className="text-sm text-ink-2">
                  Disabled: {alert.band} alerts need a named reviewer to approve them first. The
                  server refuses the request until then.
                </p>
              )}
              {!issueBlocked && reviewed && (
                <p className="text-sm text-ink-2">
                  Approved for issue. Issuing distributes it to the school, parents, CHW and
                  health facility.
                </p>
              )}
            </div>
          )}

          {nextSteps.length > 0 && (
            <div className="flex flex-col gap-3">
              <Field id="step-note" label="Step note" hint="Optional. Stored on the lifecycle event.">
                <textarea
                  id="step-note"
                  rows={2}
                  className={inputClass}
                  value={stepNote}
                  onChange={(e) => setStepNote(e.target.value)}
                />
              </Field>
              <div className="flex flex-wrap gap-3">
                {nextSteps.map((step) => (
                  <Button
                    key={step.stage}
                    type="button"
                    variant={step.stage === "close" ? "danger" : "ghost"}
                    disabled={busy !== null}
                    onClick={() =>
                      run(step.stage, () =>
                        api.advanceAlert(
                          alert.id,
                          step.stage,
                          { note: stepNote.trim() || null },
                          token
                        )
                      )
                    }
                  >
                    {busy === step.stage ? "Recording…" : step.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {!issuable && nextSteps.length === 0 && (
            <p className="text-sm text-ink-3">
              This alert has reached the end of its lifecycle. No further steps are available.
            </p>
          )}
        </div>
      </section>

      <section>
        <h4 className="font-display text-sm font-bold uppercase tracking-widest text-ink-3">
          Audit trail
        </h4>
        {events.length ? (
          <ol className="mt-3 flex flex-col gap-3">
            {events.map((event) => (
              <li
                key={event.id}
                className="rounded-xl2 border-2 border-dashed border-line bg-cream px-4 py-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <StatusChip status={event.status} />
                  <span className="text-xs text-ink-3">{formatDate(event.occurred_at)}</span>
                </div>
                <p className="mt-1 text-sm text-ink-2">
                  {pretty(event.actor_type)}
                  {event.actor_reference ? ` · ${event.actor_reference}` : ""}
                </p>
                {event.note && <p className="mt-1 text-sm text-ink">{event.note}</p>}
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-2 text-sm text-ink-3">No events recorded yet.</p>
        )}
      </section>
    </div>
  );
}

function Detail({ term, value }) {
  return (
    <div>
      <dt className="font-display text-[11px] font-bold uppercase tracking-widest text-ink-3">
        {term}
      </dt>
      <dd className="mt-0.5 text-sm text-ink">{value}</dd>
    </div>
  );
}
