// Health facility registry and Facility Climate Resilience Score.
//
// The school catchment and the health post that serves it are the same
// protective system, so this page mirrors Schools: public registry reads,
// reviewer-only scoring, admin-only create and edit.

import { useState } from "react";
import { ArrowLeft, Pencil, Plus } from "lucide-react";
import { useApi, useAuth } from "../AuthContext.jsx";
import { API_BASE, api } from "../../lib/api";
import {
  Async,
  Button,
  Card,
  EmptyState,
  ErrorNote,
  Field,
  Loading,
  Table,
  formatDate,
  inputClass
} from "../ui.jsx";

// The five WHO dimensions, in the published weighting order from
// backend/app/services/scoring.py. Each is 0-100 where 100 is best; hazard
// exposure is *managed* exposure, so a facility that has mapped and planned for
// its dominant hazards scores high whatever the raw hazard level.
const DIMENSIONS = [
  { key: "infrastructure_resilience", label: "Infrastructure resilience", weight: 0.25, hint: "Water, power, drainage and cooling" },
  { key: "service_continuity", label: "Health service continuity", weight: 0.25, hint: "Staffing rota, referral contacts, communications" },
  { key: "supply_readiness", label: "Supply readiness", weight: 0.20, hint: "ORS, malaria commodities, essential medicines" },
  { key: "hazard_exposure", label: "Climate hazard exposure", weight: 0.15, hint: "Dominant hazards mapped with trigger thresholds" },
  { key: "preparedness", label: "Preparedness", weight: 0.15, hint: "Emergency plan, drills and surge arrangements" }
];

const LABEL_BY_KEY = Object.fromEntries(DIMENSIONS.map((d) => [d.key, d.label]));

const BLANK_FACILITY = {
  code: "",
  name: "",
  facility_type: "",
  district: "",
  region: "",
  latitude: "",
  longitude: "",
  catchment_population: "",
  daily_consultation_capacity: "",
  is_active: true
};

function show(value) {
  return value === null || value === undefined || value === "" ? "—" : value;
}

/** "" → null so an untouched optional field is omitted rather than sent as 0. */
function numOrNull(value) {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

// GET /facilities/{id} and GET /facilities/{id}/resilience are public reads that
// the shared api client does not expose, and that client is a fixed contract we
// must not edit. Reading them here keeps the detail view honest without changing it.
async function getJson(path) {
  const res = await fetch(`${API_BASE}${path}`, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Could not load ${path} (${res.status}).`);
  return res.json();
}

/** A dimension score as a labelled bar. The number is always shown — never colour alone. */
function DimensionBar({ label, value, weight }) {
  const pct = typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : null;
  return (
    <li className="py-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-display text-sm font-semibold text-ink">{label}</span>
        <span className="text-sm text-ink-2">
          {pct === null ? "—" : pct}
          {weight ? <span className="ml-2 text-xs text-ink-3">weight {weight.toFixed(2)}</span> : null}
        </span>
      </div>
      <div className="mt-1.5 h-2 rounded-full bg-cream-2">
        <div className="h-2 rounded-full bg-heat" style={{ width: `${pct ?? 0}%` }} aria-hidden="true" />
      </div>
    </li>
  );
}

function ScoreResult({ score, heading = "Latest assessment" }) {
  if (!score) return <EmptyState message="No readiness assessment has been recorded for this facility yet." />;
  return (
    <>
      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
        <p>
          <span className="block font-display text-[11px] font-semibold uppercase tracking-widest text-ink-3">
            {heading} — overall
          </span>
          <strong className="font-display text-3xl font-bold text-heat">{show(score.overall)}</strong>
          <span className="ml-1 text-sm text-ink-3">/ 100</span>
        </p>
        <p>
          <span className="block font-display text-[11px] font-semibold uppercase tracking-widest text-ink-3">
            Biggest gap
          </span>
          <strong className="font-display text-sm font-semibold text-ink">
            {show(LABEL_BY_KEY[score.biggest_gap] ?? score.biggest_gap)}
          </strong>
        </p>
        <p className="text-xs text-ink-3">Recorded {formatDate(score.created_at)}</p>
      </div>
      {score.priority_action && (
        <p className="mt-3 rounded-xl2 border-2 border-dashed border-line bg-cream px-4 py-3 text-sm text-ink-2">
          <strong className="font-display font-semibold text-ink">Priority action: </strong>
          {score.priority_action}
        </p>
      )}
      <ul className="mt-4 divide-y divide-dashed divide-line">
        {DIMENSIONS.map((d) => (
          <DimensionBar key={d.key} label={d.label} value={score[d.key]} weight={d.weight} />
        ))}
      </ul>
    </>
  );
}

function AssessmentForm({ facilityId, onRecorded }) {
  const { token } = useAuth();
  const [values, setValues] = useState(() => Object.fromEntries(DIMENSIONS.map((d) => [d.key, ""])));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  async function submit(event) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const body = Object.fromEntries(DIMENSIONS.map((d) => [d.key, Number(values[d.key])]));
      const created = await api.scoreFacility(facilityId, body, token);
      setResult(created);
      setValues(Object.fromEntries(DIMENSIONS.map((d) => [d.key, ""])));
      onRecorded();
    } catch (err) {
      setError(err);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-sm text-ink-2">
        Score each of the five WHO dimensions from 0 to 100, where 100 is best. Climate hazard
        exposure is scored as <em>managed</em> exposure. Assessments are appended, never
        overwritten, so an improvement can be evidenced and a poor assessment stays visible.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {DIMENSIONS.map((d) => (
          <Field key={d.key} id={`fdim-${d.key}`} label={`${d.label} (weight ${d.weight.toFixed(2)})`} hint={d.hint}>
            <input
              id={`fdim-${d.key}`}
              className={inputClass}
              type="number"
              min="0"
              max="100"
              step="0.1"
              required
              value={values[d.key]}
              onChange={(e) => setValues((v) => ({ ...v, [d.key]: e.target.value }))}
            />
          </Field>
        ))}
      </div>
      <ErrorNote error={error} />
      <Button type="submit" disabled={pending}>
        {pending ? "Recording…" : "Record assessment"}
      </Button>
      {result && (
        <div className="rounded-xl2 border-2 border-leaf bg-leaf/10 p-4" role="status">
          <h3 className="font-display text-sm font-semibold">Assessment recorded</h3>
          <ScoreResult score={result} heading="This assessment" />
        </div>
      )}
    </form>
  );
}

function FacilityForm({ initial, onSubmit, submitLabel, onCancel, pending, error, withCode = false }) {
  const [form, setForm] = useState(initial);
  const set = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {withCode && (
          <Field id="facility-code" label="Code" hint="Unique registry code, 2–40 characters">
            <input id="facility-code" className={inputClass} required minLength={2} maxLength={40} value={form.code} onChange={set("code")} />
          </Field>
        )}
        <Field id="facility-name" label="Name">
          <input id="facility-name" className={inputClass} required minLength={2} maxLength={200} value={form.name} onChange={set("name")} />
        </Field>
        <Field id="facility-type" label="Facility type" hint="Optional, e.g. CHPS compound, health centre">
          <input id="facility-type" className={inputClass} maxLength={80} value={form.facility_type ?? ""} onChange={set("facility_type")} />
        </Field>
        <Field id="facility-district" label="District">
          <input id="facility-district" className={inputClass} required minLength={2} maxLength={120} value={form.district} onChange={set("district")} />
        </Field>
        <Field id="facility-region" label="Region">
          <input id="facility-region" className={inputClass} required minLength={2} maxLength={120} value={form.region} onChange={set("region")} />
        </Field>
        <Field id="facility-lat" label="Latitude" hint="Optional, −90 to 90. Blank leaves the facility off the risk map.">
          <input id="facility-lat" className={inputClass} type="number" min="-90" max="90" step="any" value={form.latitude ?? ""} onChange={set("latitude")} />
        </Field>
        <Field id="facility-lon" label="Longitude" hint="Optional, −180 to 180">
          <input id="facility-lon" className={inputClass} type="number" min="-180" max="180" step="any" value={form.longitude ?? ""} onChange={set("longitude")} />
        </Field>
        <Field id="facility-catchment" label="Catchment population" hint="Optional. Leave blank if not known — do not estimate.">
          <input id="facility-catchment" className={inputClass} type="number" min="0" step="1" value={form.catchment_population ?? ""} onChange={set("catchment_population")} />
        </Field>
        <Field id="facility-capacity" label="Daily consultation capacity" hint="Optional. Demand forecasting refuses to run without it.">
          <input id="facility-capacity" className={inputClass} type="number" min="0" step="1" value={form.daily_consultation_capacity ?? ""} onChange={set("daily_consultation_capacity")} />
        </Field>
      </div>

      <label className="flex items-center gap-2 font-display text-sm font-semibold">
        <input type="checkbox" className="h-4 w-4" checked={Boolean(form.is_active)} onChange={set("is_active")} />
        Active
      </label>

      <ErrorNote error={error} />

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

/** Thin wrapper: turns the facility record into form state and injects the token. */
function EditFacilityForm({ facility, onSubmit, onCancel, pending, error }) {
  const { token } = useAuth();
  return (
    <FacilityForm
      initial={Object.fromEntries(
        Object.keys(BLANK_FACILITY).map((key) => [key, facility[key] ?? BLANK_FACILITY[key]])
      )}
      submitLabel="Save changes"
      pending={pending}
      error={error}
      onCancel={onCancel}
      onSubmit={(form) => onSubmit(form, token)}
    />
  );
}

function FacilityDetail({ facilityId, onBack, onChanged }) {
  const { role } = useAuth();
  const canEdit = role === "admin";
  const canScore = role === "admin" || role === "reviewer";

  const state = useApi(
    () =>
      Promise.all([
        getJson(`/facilities/${facilityId}`),
        getJson(`/facilities/${facilityId}/resilience?limit=50`)
      ]),
    [facilityId]
  );

  const [editing, setEditing] = useState(false);
  const [savePending, setSavePending] = useState(false);
  const [saveError, setSaveError] = useState(null);

  async function saveEdit(form, token) {
    setSavePending(true);
    setSaveError(null);
    try {
      await api.updateFacility(
        facilityId,
        {
          name: form.name,
          facility_type: form.facility_type || null,
          district: form.district,
          region: form.region,
          latitude: numOrNull(form.latitude),
          longitude: numOrNull(form.longitude),
          catchment_population: numOrNull(form.catchment_population),
          daily_consultation_capacity: numOrNull(form.daily_consultation_capacity),
          is_active: Boolean(form.is_active)
        },
        token
      );
      setEditing(false);
      state.reload();
      onChanged();
    } catch (err) {
      setSaveError(err);
    } finally {
      setSavePending(false);
    }
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeft aria-hidden="true" className="h-4 w-4" /> All facilities
      </Button>

      <Async state={state}>
        {([facility, history]) => (
          <>
            <header>
              <h2 className="font-display text-xl font-bold">{show(facility.name)}</h2>
              <p className="mt-1 text-sm text-ink-2">
                {show(facility.code)} · {show(facility.district)} · {show(facility.region)}
                {facility.facility_type ? ` · ${facility.facility_type}` : ""}
                {facility.is_active ? "" : " · inactive"}
              </p>
            </header>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card title="Record" className="lg:col-span-1">
                <dl className="space-y-2 text-sm">
                  {[
                    ["Facility type", show(facility.facility_type)],
                    ["Catchment population", show(facility.catchment_population)],
                    ["Daily consultation capacity", show(facility.daily_consultation_capacity)],
                    [
                      "Coordinates",
                      facility.latitude != null && facility.longitude != null
                        ? `${facility.latitude}, ${facility.longitude}`
                        : "Not yet geolocated"
                    ],
                    ["Registered", formatDate(facility.created_at)],
                    ["Last updated", formatDate(facility.updated_at)]
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-3 border-b border-dashed border-line pb-2 last:border-0">
                      <dt className="text-ink-3">{label}</dt>
                      <dd className="text-right font-display font-semibold text-ink">{value}</dd>
                    </div>
                  ))}
                </dl>
                {canEdit && !editing && (
                  <Button variant="ghost" className="mt-4" onClick={() => setEditing(true)}>
                    <Pencil aria-hidden="true" className="h-4 w-4" /> Edit facility
                  </Button>
                )}
              </Card>

              <Card title="Readiness dimensions" className="lg:col-span-2">
                <ScoreResult score={facility.latest_score} />
              </Card>
            </div>

            {canEdit && editing && (
              <Card title={`Edit ${facility.name}`}>
                <EditFacilityForm
                  facility={facility}
                  pending={savePending}
                  error={saveError}
                  onCancel={() => {
                    setEditing(false);
                    setSaveError(null);
                  }}
                  onSubmit={saveEdit}
                />
              </Card>
            )}

            <Card title="Score history">
              <Table
                empty="No assessment has been recorded for this facility yet."
                rows={history ?? []}
                columns={[
                  { key: "created_at", header: "Recorded", render: (r) => formatDate(r.created_at) },
                  { key: "overall", header: "Overall", render: (r) => show(r.overall) },
                  {
                    key: "biggest_gap",
                    header: "Biggest gap",
                    render: (r) => show(LABEL_BY_KEY[r.biggest_gap] ?? r.biggest_gap)
                  },
                  ...DIMENSIONS.map((d) => ({
                    key: d.key,
                    header: d.label,
                    render: (r) => show(r[d.key])
                  }))
                ]}
              />
            </Card>

            <Card title="New readiness assessment">
              {canScore ? (
                <AssessmentForm
                  facilityId={facilityId}
                  onRecorded={() => {
                    state.reload();
                    onChanged();
                  }}
                />
              ) : (
                <p className="text-sm text-ink-2">
                  Recording an assessment requires a reviewer or admin account. Your account is
                  signed in as <strong>{show(role)}</strong>, so the form is not shown.
                </p>
              )}
            </Card>
          </>
        )}
      </Async>
    </div>
  );
}

export default function Facilities() {
  const { role, token } = useAuth();
  const canEdit = role === "admin";

  const [selectedId, setSelectedId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [createPending, setCreatePending] = useState(false);
  const [createError, setCreateError] = useState(null);

  const list = useApi(() => api.listFacilities({ limit: 500 }));

  // The registry read carries no score, so the Observatory rollup supplies the
  // readiness figure. It is enrichment, not the page: if the account may not read
  // it, the table still renders and the column shows "—".
  const rollup = useApi((t) =>
    api.observatoryFacilities(t).catch((err) => {
      if (err?.status === 401) throw err; // let useApi sign the stale session out
      return null;
    })
  );

  const scoreById = new Map((rollup.data?.facilities ?? []).map((f) => [f.facility_id, f]));

  async function createFacility(form) {
    setCreatePending(true);
    setCreateError(null);
    try {
      await api.createFacility(
        {
          code: form.code,
          name: form.name,
          facility_type: form.facility_type || null,
          district: form.district,
          region: form.region,
          latitude: numOrNull(form.latitude),
          longitude: numOrNull(form.longitude),
          catchment_population: numOrNull(form.catchment_population),
          daily_consultation_capacity: numOrNull(form.daily_consultation_capacity),
          is_active: Boolean(form.is_active)
        },
        token
      );
      setCreating(false);
      list.reload();
      rollup.reload();
    } catch (err) {
      setCreateError(err);
    } finally {
      setCreatePending(false);
    }
  }

  if (selectedId !== null) {
    return (
      <FacilityDetail
        facilityId={selectedId}
        onBack={() => setSelectedId(null)}
        onChanged={() => {
          list.reload();
          rollup.reload();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Health facilities</h1>
          <p className="mt-1 text-sm text-ink-2">
            The facilities serving the pilot school catchments, and their readiness against the
            five WHO climate-resilience dimensions. Nothing here is a clinical instrument.
          </p>
        </div>
        {canEdit && !creating && (
          <Button onClick={() => setCreating(true)}>
            <Plus aria-hidden="true" className="h-4 w-4" /> Register a facility
          </Button>
        )}
      </header>

      {canEdit && creating && (
        <Card title="Register a health facility">
          <FacilityForm
            initial={BLANK_FACILITY}
            withCode
            submitLabel="Create facility"
            pending={createPending}
            error={createError}
            onCancel={() => {
              setCreating(false);
              setCreateError(null);
            }}
            onSubmit={createFacility}
          />
        </Card>
      )}

      <Card title="Registry">
        {rollup.loading && <Loading label="Loading readiness scores…" />}
        <Async state={list} empty="No health facility has been registered yet.">
          {(facilities) => (
            <Table
              rows={facilities}
              empty="No health facility has been registered yet."
              columns={[
                {
                  key: "name",
                  header: "Facility",
                  render: (f) => (
                    <button
                      type="button"
                      onClick={() => setSelectedId(f.id)}
                      className="text-left font-display font-semibold text-ink underline decoration-line-2 underline-offset-4 hover:text-heat"
                    >
                      {show(f.name)}
                      <span className="block text-xs font-normal text-ink-3 no-underline">{show(f.code)}</span>
                    </button>
                  )
                },
                { key: "facility_type", header: "Type", render: (f) => show(f.facility_type) },
                { key: "district", header: "District", render: (f) => show(f.district) },
                { key: "region", header: "Region", render: (f) => show(f.region) },
                { key: "catchment_population", header: "Catchment", render: (f) => show(f.catchment_population) },
                {
                  key: "daily_consultation_capacity",
                  header: "Daily capacity",
                  render: (f) => show(f.daily_consultation_capacity)
                },
                {
                  key: "readiness",
                  header: "Latest score",
                  render: (f) => show(scoreById.get(f.id)?.readiness_score)
                },
                { key: "active", header: "Status", render: (f) => (f.is_active ? "Active" : "Inactive") }
              ]}
            />
          )}
        </Async>
        {rollup.data === null && !rollup.loading && !rollup.error && (
          <p className="mt-4 text-xs text-ink-3">
            Readiness scores could not be read with this account, so that column shows “—”.
            Open a facility to see its recorded assessments.
          </p>
        )}
      </Card>
    </div>
  );
}
