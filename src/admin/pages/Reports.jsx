// Field intelligence — the school → CHW → facility signal chain.
//
// The clusters below are prompts for verification, never findings. The
// recommendation text is rendered exactly as the API sends it: rewording it into
// an assertion would breach the platform's clinical scope boundary
// (see SIGNAL_RECOMMENDATION in backend/app/routers/reports.py).

import { useState } from "react";
import { CheckCircle2, Radio } from "lucide-react";
import { api } from "../../lib/api";
import { useApi, useAuth } from "../AuthContext.jsx";
import {
  Async,
  Button,
  Card,
  EmptyState,
  ErrorNote,
  Field,
  formatDate,
  inputClass,
  Table
} from "../ui.jsx";

function pretty(value) {
  return value == null || value === "" ? "—" : String(value).replace(/_/g, " ");
}

function num(value) {
  return typeof value === "number" && Number.isFinite(value) ? value.toLocaleString("en-GB") : "—";
}

export default function Reports() {
  const { token } = useAuth();
  const [filters, setFilters] = useState({ district: "", triaged: "" });
  const [districtDraft, setDistrictDraft] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [writeError, setWriteError] = useState(null);
  const [notice, setNotice] = useState("");

  const signals = useApi((t) => api.signals(t), []);
  const reports = useApi(
    (t) => api.listReports({ ...filters, limit: 100 }, t),
    [filters.district, filters.triaged]
  );
  // Names are a courtesy on top of the record; a failed lookup must not blank the page.
  const schools = useApi(() => api.listSchools({ limit: 500 }).catch(() => []), []);

  const schoolName = (id) => {
    if (id == null) return "—";
    const match = Array.isArray(schools.data) ? schools.data.find((s) => s.id === id) : null;
    return match?.name ?? `School #${id}`;
  };

  async function triage(report) {
    setBusyId(report.id);
    setWriteError(null);
    setNotice("");
    try {
      await api.triageReport(report.id, token);
      setNotice(`Report #${report.id} marked as triaged.`);
      reports.reload();
    } catch (err) {
      setWriteError(err);
    } finally {
      setBusyId(null);
    }
  }

  const columns = [
    { key: "district", header: "District", render: (r) => pretty(r.district) },
    { key: "school", header: "School", render: (r) => schoolName(r.school_id) },
    {
      key: "reporter",
      header: "Reporter",
      render: (r) => (
        <span className="flex flex-col">
          <span>{pretty(r.reporter_type)}</span>
          <span className="text-xs text-ink-3">{pretty(r.channel)}</span>
        </span>
      )
    },
    {
      key: "keywords",
      header: "Keywords",
      render: (r) =>
        r.keywords?.length ? (
          <span className="flex flex-wrap gap-1.5">
            {r.keywords.map((k) => (
              <span
                key={k}
                className="rounded-full bg-cream-2 px-2.5 py-1 font-display text-[11px] font-semibold uppercase tracking-wide text-ink-2"
              >
                {k}
              </span>
            ))}
          </span>
        ) : (
          "—"
        )
    },
    { key: "cases_reported", header: "Cases", render: (r) => num(r.cases_reported) },
    { key: "absences_reported", header: "Absences", render: (r) => num(r.absences_reported) },
    { key: "created_at", header: "Submitted", render: (r) => formatDate(r.created_at) },
    {
      key: "triaged",
      header: "Triage",
      render: (r) =>
        r.triaged ? (
          <span className="inline-flex items-center gap-1.5 font-display text-[13px] font-semibold text-leaf">
            <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
            Triaged
          </span>
        ) : (
          <Button
            type="button"
            variant="ghost"
            disabled={busyId !== null}
            onClick={() => triage(r)}
          >
            {busyId === r.id ? "Triaging…" : "Triage"}
          </Button>
        )
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-2xl font-bold">Field reports</h1>
        <p className="mt-1 text-sm text-ink-2">
          Counts and symptom codes from teachers, school nurses and community health workers.
          Never names.
        </p>
      </header>

      <Card title="Signal clusters">
        <Async state={signals}>
          {(data) => {
            if (!data) return <EmptyState message="No signals available." />;
            const clusters = data.clusters ?? [];
            return (
              <div className="flex flex-col gap-5">
                <p className="text-xs text-ink-3">
                  {num(data.cluster_count)} cluster{data.cluster_count === 1 ? "" : "s"} over the
                  last {num(data.lookback_days)} days · generated {formatDate(data.generated_at)}
                </p>
                {data.disclaimer && (
                  <p className="rounded-xl2 border-2 border-dashed border-line bg-cream px-4 py-3 text-sm text-ink-2">
                    {data.disclaimer}
                  </p>
                )}
                {clusters.length === 0 ? (
                  <EmptyState message="No clusters detected in this window." />
                ) : (
                  <ul className="flex flex-col gap-4">
                    {clusters.map((cluster, i) => (
                      <li key={`${cluster.type}-${cluster.school_id ?? cluster.district}-${i}`}>
                        <Cluster cluster={cluster} schoolName={schoolName} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          }}
        </Async>
      </Card>

      <Card title="Recent reports">
        <form
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          onSubmit={(e) => {
            e.preventDefault();
            setFilters((f) => ({ ...f, district: districtDraft.trim() }));
          }}
        >
          <Field id="report-district" label="District" hint="Exact match. Press Enter to apply.">
            <input
              id="report-district"
              type="search"
              className={inputClass}
              value={districtDraft}
              onChange={(e) => setDistrictDraft(e.target.value)}
              onBlur={() => setFilters((f) => ({ ...f, district: districtDraft.trim() }))}
            />
          </Field>

          <Field id="report-triaged" label="Triage state">
            <select
              id="report-triaged"
              className={inputClass}
              value={filters.triaged}
              onChange={(e) => setFilters((f) => ({ ...f, triaged: e.target.value }))}
            >
              <option value="">Any state</option>
              <option value="false">Awaiting triage</option>
              <option value="true">Triaged</option>
            </select>
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
                setFilters({ district: "", triaged: "" });
              }}
            >
              Clear
            </Button>
          </div>
        </form>

        <div className="mt-5 flex flex-col gap-3">
          {writeError && <ErrorNote error={writeError} />}
          <p aria-live="polite" className="text-sm text-leaf">
            {notice}
          </p>
          <Async state={reports}>
            {(rows) => (
              <Table columns={columns} rows={rows ?? []} empty="No reports match these filters." />
            )}
          </Async>
        </div>
      </Card>
    </div>
  );
}

function Cluster({ cluster, schoolName }) {
  const place =
    cluster.scope === "school"
      ? cluster.school_name ?? schoolName(cluster.school_id)
      : pretty(cluster.district);

  return (
    <article className="rounded-xl2 border-2 border-line bg-cream px-5 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-heat/15 px-2.5 py-1 font-display text-[11px] font-bold uppercase tracking-wide text-heat">
          <Radio aria-hidden="true" className="h-3.5 w-3.5" />
          {pretty(cluster.type)}
        </span>
        <span className="rounded-full bg-cream-2 px-2.5 py-1 font-display text-[11px] font-semibold uppercase tracking-wide text-ink-2">
          {pretty(cluster.scope)}
        </span>
      </div>

      <h3 className="mt-2 font-display text-base font-bold">{place}</h3>
      <p className="text-sm text-ink-2">
        {pretty(cluster.district)} · {num(cluster.report_count)} reports ·{" "}
        {num(cluster.cases_reported)} cases · {num(cluster.window_hours)}h window
      </p>
      <p className="mt-1 text-xs text-ink-3">
        First {formatDate(cluster.first_report_at)} · latest {formatDate(cluster.last_report_at)}
      </p>

      <h4 className="mt-4 font-display text-[11px] font-bold uppercase tracking-widest text-ink-3">
        Evidence
      </h4>
      {cluster.evidence?.length ? (
        <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-ink-2">
          {cluster.evidence.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-1.5 text-sm text-ink-3">—</p>
      )}

      <h4 className="mt-4 font-display text-[11px] font-bold uppercase tracking-widest text-ink-3">
        Recommendation
      </h4>
      <p className="mt-1.5 rounded-xl2 border-2 border-line-2 bg-paper px-4 py-3 text-sm text-ink">
        {cluster.recommendation}
      </p>
    </article>
  );
}
