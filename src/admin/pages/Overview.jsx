// Overview — the landing screen of the operations console.
//
// One read: GET /observatory/overview. Everything below is that response,
// rearranged. Nothing is derived from anywhere else and nothing is invented: if
// the deployment is empty the page says so in words rather than drawing charts
// with no data behind them.

import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useApi } from "../AuthContext.jsx";
import { api } from "../../lib/api";
import {
  Async,
  BandChip,
  Card,
  EmptyState,
  Stat,
  StatusChip,
  Table,
  formatDate
} from "../ui.jsx";

// Severity order, so the band breakdown always reads worst-first regardless of
// the order the API happens to return the groups in.
const BAND_ORDER = ["RED", "ORANGE", "YELLOW", "GREEN"];

const QUICK_LINKS = [
  { to: "/admin/alerts", label: "Alert review", note: "Check, issue and close alerts" },
  { to: "/admin/reports", label: "Field reports", note: "Triage inbound CHW and SMS reports" },
  { to: "/admin/map", label: "Risk map", note: "Schools and facilities by band" },
  { to: "/admin/schools", label: "Schools", note: "Registry and resilience scoring" },
  { to: "/admin/facilities", label: "Health facilities", note: "Registry and readiness scoring" }
];

function num(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function show(value) {
  return value === null || value === undefined || value === "" ? "—" : value;
}

/** Reads as a label a person recognises, not a database column name. */
function humanise(key) {
  if (!key) return "—";
  const words = String(key).replace(/_/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function CountRow({ label, count }) {
  return (
    <li className="flex items-center justify-between gap-3 border-b border-dashed border-line py-2 last:border-0">
      {label}
      <strong className="font-display text-sm font-bold text-ink">{count}</strong>
    </li>
  );
}

function FreshDeployment() {
  return (
    <Card title="No operational data yet">
      <p className="text-sm text-ink-2">
        This deployment has no schools, alerts or field reports recorded, so there is
        nothing to summarise. That is the expected state of a fresh installation — it is
        not an error, and no figures have been estimated to fill the gap.
      </p>
      <h3 className="mt-5 font-display text-sm font-semibold">What will populate this screen</h3>
      <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-ink-2">
        <li>
          Register the pilot schools and health facilities, then record a resilience
          assessment for each — that fills the monitored and elevated-risk counts.
        </li>
        <li>
          Submit environmental readings, so the classifier can raise risk assessments and
          the district bands begin to move.
        </li>
        <li>
          Create and review alerts — the band and status breakdowns count alerts, so they
          stay empty until the first alert exists.
        </li>
        <li>
          Take in field reports from community health workers. Signal clusters are detected
          from the last 14 days of those reports, and need at least three related reports
          before anything is flagged.
        </li>
      </ol>
    </Card>
  );
}

export default function Overview() {
  const state = useApi((token) => api.observatory(token));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">Overview</h1>
        <p className="mt-1 text-sm text-ink-2">
          The current risk picture across the pilot. Aggregated and anonymised — no
          individual child, household or caregiver appears anywhere in this console.
        </p>
      </header>

      <Async state={state}>
        {(data) => {
          if (!data) return <EmptyState message="The Observatory returned no overview." />;

          const byBand = data.alerts_by_band ?? {};
          const byStatus = data.alerts_by_status ?? {};
          const elevated = data.schools_at_elevated_risk ?? [];
          const districts = data.districts_at_elevated_risk ?? [];
          const clusters = data.recent_signal_clusters ?? [];

          const totalAlerts = Object.values(byStatus).reduce((sum, n) => sum + num(n), 0);
          // "Fresh deployment" means genuinely nothing recorded — not merely a quiet day.
          const isEmpty =
            totalAlerts === 0 &&
            num(data.schools_monitored) === 0 &&
            elevated.length === 0 &&
            clusters.length === 0;

          const bands = BAND_ORDER.filter((b) => b in byBand);
          const statuses = Object.keys(byStatus).sort();

          return (
            <>
              <p className="text-xs text-ink-3">Generated {formatDate(data.generated_at)}</p>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Stat
                  label="Open alerts"
                  value={num(data.open_alerts)}
                  sub={`${totalAlerts} alert${totalAlerts === 1 ? "" : "s"} recorded in total`}
                />
                <Stat
                  label="Awaiting review"
                  value={num(data.alerts_awaiting_review)}
                  sub="Flagged for a named human before issue"
                  tone="text-[#c62828]"
                />
                <Stat
                  label="Schools monitored"
                  value={num(data.schools_monitored)}
                  sub="Active records in the registry"
                  tone="text-ink"
                />
                <Stat
                  label="Schools at elevated risk"
                  value={elevated.length}
                  sub="Latest assessment in band ORANGE or RED"
                  tone="text-heat"
                />
              </div>

              {isEmpty && <FreshDeployment />}

              <div className="grid gap-6 lg:grid-cols-2">
                <Card title="Alerts by band">
                  {bands.length ? (
                    <ul className="text-sm text-ink-2">
                      {bands.map((band) => (
                        <CountRow key={band} label={<BandChip band={band} />} count={num(byBand[band])} />
                      ))}
                    </ul>
                  ) : (
                    <EmptyState message="No alerts have been raised yet." />
                  )}
                </Card>

                <Card title="Alerts by status">
                  {statuses.length ? (
                    <ul className="text-sm text-ink-2">
                      {statuses.map((status) => (
                        <CountRow key={status} label={<StatusChip status={status} />} count={num(byStatus[status])} />
                      ))}
                    </ul>
                  ) : (
                    <EmptyState message="No alerts have been raised yet." />
                  )}
                </Card>
              </div>

              <Card
                title="Schools at elevated risk"
                action={
                  <Link
                    to="/admin/schools"
                    className="inline-flex items-center gap-1.5 font-display text-xs font-semibold text-ink-2 hover:text-heat"
                  >
                    School registry <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                  </Link>
                }
              >
                <Table
                  empty="No school is currently assessed in band ORANGE or RED."
                  rows={elevated}
                  columns={[
                    {
                      key: "school",
                      header: "School",
                      render: (r) => (
                        <>
                          <span className="font-display font-semibold text-ink">{show(r.school_name)}</span>
                          <span className="block text-xs text-ink-3">{show(r.school_code)}</span>
                        </>
                      )
                    },
                    { key: "district", header: "District", render: (r) => show(r.district) },
                    { key: "region", header: "Region", render: (r) => show(r.region) },
                    { key: "band", header: "Band", render: (r) => (r.band ? <BandChip band={r.band} /> : "—") },
                    {
                      key: "overall_risk",
                      header: "Risk",
                      render: (r) => (
                        <>
                          {show(r.overall_risk)}
                          <span className="block text-xs text-ink-3">
                            confidence {show(r.confidence)}
                          </span>
                        </>
                      )
                    },
                    {
                      key: "resilience_score",
                      header: "Resilience",
                      render: (r) => show(r.resilience_score)
                    },
                    { key: "biggest_gap", header: "Biggest gap", render: (r) => humanise(r.biggest_gap) }
                  ]}
                />
              </Card>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card title="Districts at elevated risk">
                  {districts.length ? (
                    <ul className="flex flex-wrap gap-2">
                      {districts.map((d) => (
                        <li
                          key={d}
                          className="rounded-full bg-cream-2 px-3 py-1.5 font-display text-xs font-semibold text-ink-2"
                        >
                          {d}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <EmptyState message="No district's latest assessment sits in band ORANGE or RED." />
                  )}
                </Card>

                <Card
                  title="Recent signal clusters"
                  action={
                    <Link
                      to="/admin/reports"
                      className="inline-flex items-center gap-1.5 font-display text-xs font-semibold text-ink-2 hover:text-heat"
                    >
                      Field reports <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                    </Link>
                  }
                >
                  {clusters.length ? (
                    <ul className="space-y-3">
                      {clusters.map((c, i) => (
                        <li
                          key={`${c.type}-${c.school_id ?? c.district}-${i}`}
                          className="rounded-xl2 border-2 border-line bg-cream px-4 py-3"
                        >
                          <h3 className="font-display text-sm font-semibold">
                            {humanise(c.type)} — {show(c.school_name ?? c.district)}
                          </h3>
                          <p className="mt-0.5 text-xs text-ink-3">
                            {num(c.report_count)} report{num(c.report_count) === 1 ? "" : "s"},{" "}
                            {num(c.cases_reported)} case{num(c.cases_reported) === 1 ? "" : "s"} · last report{" "}
                            {formatDate(c.last_report_at)}
                          </p>
                          {Array.isArray(c.evidence) && c.evidence.length > 0 && (
                            <ul className="mt-2 list-disc space-y-0.5 pl-5 text-xs text-ink-2">
                              {c.evidence.map((e, j) => (
                                <li key={j}>{e}</li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <EmptyState message="No cluster has met a detection threshold in the last 14 days." />
                  )}
                </Card>
              </div>

              <Card title="Go to">
                <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {QUICK_LINKS.map((link) => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        className="flex h-full items-center justify-between gap-3 rounded-xl2 border-2 border-line-2 bg-paper px-4 py-3 transition hover:border-heat"
                      >
                        <span>
                          <span className="block font-display text-sm font-semibold text-ink">{link.label}</span>
                          <span className="block text-xs text-ink-3">{link.note}</span>
                        </span>
                        <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-heat" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </Card>

              <div className="rounded-xl2 border-2 border-dashed border-line bg-cream px-4 py-3 text-xs text-ink-2">
                <p className="flex items-start gap-2">
                  <ShieldCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-leaf" />
                  <span>{show(data.anonymisation)}</span>
                </p>
                {data.recommendation && <p className="mt-2 pl-6">{data.recommendation}</p>}
              </div>
            </>
          );
        }}
      </Async>
    </div>
  );
}
