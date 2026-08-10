// School registry and School Climate Resilience Score.
//
// Registry reads are public (a school is a place, not a child), so the list and
// the detail render without a token. Scoring needs a reviewer; creating and
// editing a school needs an admin. The controls follow those rules so the
// console never offers an action the API will refuse.

import { useState } from "react";
import { ArrowLeft, Pencil, Plus } from "lucide-react";
import { useApi, useAuth } from "../AuthContext.jsx";
import { API_BASE, api } from "../../lib/api";
import {
  Async,
  BandChip,
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

// The eight dimensions, in the published weighting order from
// backend/app/services/scoring.py. Every one is 0-100 where 100 is best: the
// four named "exposure" are scored as *managed* exposure, which the hint says
// out loud so an assessor does not invert them.
const DIMENSIONS = [
  { key: "heat_exposure", label: "Heat exposure", weight: 0.15, hint: "Shade, ventilation and heat timetabling in place" },
  { key: "flood_exposure", label: "Flood exposure", weight: 0.15, hint: "Drainage, siting and flood preparation in place" },
  { key: "wash_readiness", label: "WASH readiness", weight: 0.15, hint: "Water, sanitation, handwashing and ORS stock" },
  { key: "health_service_access", label: "Health service access", weight: 0.13, hint: "Referral route, distance and CHW cover" },
  { key: "infrastructure_resilience", label: "Infrastructure resilience", weight: 0.12, hint: "Roofing, rainwater capture and barriers" },
  { key: "nutrition_resilience", label: "Nutrition resilience", weight: 0.10, hint: "Feeding coverage and safe food storage" },
  { key: "air_quality_exposure", label: "Air quality exposure", weight: 0.10, hint: "Dust and smoke ingress managed" },
  { key: "early_warning_readiness", label: "Early warning readiness", weight: 0.10, hint: "Connectivity and alert acknowledgement" }
];

const LABEL_BY_KEY = Object.fromEntries(DIMENSIONS.map((d) => [d.key, d.label]));

const BLANK_SCHOOL = {
  code: "",
  name: "",
  district: "",
  region: "",
  pilot_zone: "",
  latitude: "",
  longitude: "",
  enrolment: "",
  building_type: "",
  distance_to_facility_km: "",
  flood_zone_proximity_m: "",
  has_school_feeding: false,
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

// The score-history endpoint (GET /schools/{id}/resilience) is a public read that
// the shared api client does not expose, and that client is a fixed contract we
// must not edit. Fetching it here keeps the history on screen without changing it.
async function fetchScoreHistory(schoolId) {
  const res = await fetch(`${API_BASE}/schools/${schoolId}/resilience?limit=50`, {
    headers: { Accept: "application/json" }
  });
  if (!res.ok) throw new Error(`Could not load the score history (${res.status}).`);
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
        <div
          className="h-2 rounded-full bg-heat"
          style={{ width: `${pct ?? 0}%` }}
          aria-hidden="true"
        />
      </div>
    </li>
  );
}

function ScoreResult({ score, heading = "Latest assessment" }) {
  if (!score) return <EmptyState message="No resilience assessment has been recorded for this school yet." />;
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

function AssessmentForm({ schoolId, onRecorded }) {
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
      const created = await api.scoreSchool(schoolId, body, token);
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
        Score each dimension from 0 to 100, where 100 is best. The four exposure dimensions
        are scored as <em>managed</em> exposure: a school with shade, ventilation and a heat
        timetable scores high on heat exposure. Assessments are appended, never overwritten.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {DIMENSIONS.map((d) => (
          <Field key={d.key} id={`dim-${d.key}`} label={`${d.label} (weight ${d.weight.toFixed(2)})`} hint={d.hint}>
            <input
              id={`dim-${d.key}`}
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

function SchoolForm({ initial, onSubmit, submitLabel, onCancel, pending, error, withCode = false }) {
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
          <Field id="school-code" label="Code" hint="Unique registry code, 2–40 characters">
            <input id="school-code" className={inputClass} required minLength={2} maxLength={40} value={form.code} onChange={set("code")} />
          </Field>
        )}
        <Field id="school-name" label="Name">
          <input id="school-name" className={inputClass} required minLength={2} maxLength={200} value={form.name} onChange={set("name")} />
        </Field>
        <Field id="school-district" label="District">
          <input id="school-district" className={inputClass} required minLength={2} maxLength={120} value={form.district} onChange={set("district")} />
        </Field>
        <Field id="school-region" label="Region">
          <input id="school-region" className={inputClass} required minLength={2} maxLength={120} value={form.region} onChange={set("region")} />
        </Field>
        <Field id="school-zone" label="Pilot zone" hint="Optional">
          <input id="school-zone" className={inputClass} maxLength={120} value={form.pilot_zone ?? ""} onChange={set("pilot_zone")} />
        </Field>
        <Field id="school-enrolment" label="Enrolment" hint="Optional. Leave blank if not known — do not estimate.">
          <input id="school-enrolment" className={inputClass} type="number" min="0" step="1" value={form.enrolment ?? ""} onChange={set("enrolment")} />
        </Field>
        <Field id="school-building" label="Building type" hint="Optional">
          <input id="school-building" className={inputClass} maxLength={80} value={form.building_type ?? ""} onChange={set("building_type")} />
        </Field>
        <Field id="school-lat" label="Latitude" hint="Optional, −90 to 90. Blank leaves the school off the risk map.">
          <input id="school-lat" className={inputClass} type="number" min="-90" max="90" step="any" value={form.latitude ?? ""} onChange={set("latitude")} />
        </Field>
        <Field id="school-lon" label="Longitude" hint="Optional, −180 to 180">
          <input id="school-lon" className={inputClass} type="number" min="-180" max="180" step="any" value={form.longitude ?? ""} onChange={set("longitude")} />
        </Field>
        <Field id="school-distance" label="Distance to health facility (km)" hint="Optional">
          <input id="school-distance" className={inputClass} type="number" min="0" step="0.1" value={form.distance_to_facility_km ?? ""} onChange={set("distance_to_facility_km")} />
        </Field>
        <Field id="school-flood" label="Distance to flood zone (m)" hint="Optional">
          <input id="school-flood" className={inputClass} type="number" min="0" step="1" value={form.flood_zone_proximity_m ?? ""} onChange={set("flood_zone_proximity_m")} />
        </Field>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 font-display text-sm font-semibold">
          <input type="checkbox" className="h-4 w-4" checked={Boolean(form.has_school_feeding)} onChange={set("has_school_feeding")} />
          School feeding programme
        </label>
        <label className="flex items-center gap-2 font-display text-sm font-semibold">
          <input type="checkbox" className="h-4 w-4" checked={Boolean(form.is_active)} onChange={set("is_active")} />
          Active
        </label>
      </div>

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

function SchoolDetail({ schoolId, onBack, onChanged }) {
  const { role } = useAuth();
  const canEdit = role === "admin";
  const canScore = role === "admin" || role === "reviewer";

  const state = useApi(
    () => Promise.all([api.getSchool(schoolId), fetchScoreHistory(schoolId)]),
    [schoolId]
  );

  const [editing, setEditing] = useState(false);
  const [savePending, setSavePending] = useState(false);
  const [saveError, setSaveError] = useState(null);

  async function saveEdit(form, token) {
    setSavePending(true);
    setSaveError(null);
    try {
      await api.updateSchool(
        schoolId,
        {
          name: form.name,
          district: form.district,
          region: form.region,
          pilot_zone: form.pilot_zone || null,
          latitude: numOrNull(form.latitude),
          longitude: numOrNull(form.longitude),
          enrolment: numOrNull(form.enrolment),
          building_type: form.building_type || null,
          distance_to_facility_km: numOrNull(form.distance_to_facility_km),
          flood_zone_proximity_m: numOrNull(form.flood_zone_proximity_m),
          has_school_feeding: Boolean(form.has_school_feeding),
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
        <ArrowLeft aria-hidden="true" className="h-4 w-4" /> All schools
      </Button>

      <Async state={state}>
        {([school, history]) => (
          <>
            <header>
              <h2 className="font-display text-xl font-bold">{show(school.name)}</h2>
              <p className="mt-1 text-sm text-ink-2">
                {show(school.code)} · {show(school.district)} · {show(school.region)}
                {school.pilot_zone ? ` · ${school.pilot_zone}` : ""}
                {school.is_active ? "" : " · inactive"}
              </p>
            </header>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card title="Record" className="lg:col-span-1">
                <dl className="space-y-2 text-sm">
                  {[
                    ["Enrolment", show(school.enrolment)],
                    ["Building type", show(school.building_type)],
                    ["School feeding", school.has_school_feeding ? "Yes" : "No"],
                    ["Distance to facility", school.distance_to_facility_km ? `${school.distance_to_facility_km} km` : "—"],
                    ["Distance to flood zone", school.flood_zone_proximity_m ? `${school.flood_zone_proximity_m} m` : "—"],
                    ["Coordinates", school.latitude != null && school.longitude != null ? `${school.latitude}, ${school.longitude}` : "Not yet geolocated"],
                    ["Registered", formatDate(school.created_at)],
                    ["Last updated", formatDate(school.updated_at)]
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-3 border-b border-dashed border-line pb-2 last:border-0">
                      <dt className="text-ink-3">{label}</dt>
                      <dd className="text-right font-display font-semibold text-ink">{value}</dd>
                    </div>
                  ))}
                </dl>
                {canEdit && !editing && (
                  <Button variant="ghost" className="mt-4" onClick={() => setEditing(true)}>
                    <Pencil aria-hidden="true" className="h-4 w-4" /> Edit school
                  </Button>
                )}
              </Card>

              <Card title="Resilience dimensions" className="lg:col-span-2">
                <ScoreResult score={school.latest_score} />
              </Card>
            </div>

            {canEdit && editing && (
              <Card title={`Edit ${school.name}`}>
                <EditSchoolForm
                  school={school}
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
                empty="No assessment has been recorded for this school yet."
                rows={history ?? []}
                columns={[
                  { key: "created_at", header: "Recorded", render: (r) => formatDate(r.created_at) },
                  { key: "overall", header: "Overall", render: (r) => show(r.overall) },
                  { key: "biggest_gap", header: "Biggest gap", render: (r) => show(LABEL_BY_KEY[r.biggest_gap] ?? r.biggest_gap) },
                  ...DIMENSIONS.map((d) => ({
                    key: d.key,
                    header: d.label,
                    render: (r) => show(r[d.key])
                  }))
                ]}
              />
            </Card>

            <Card title="New resilience assessment">
              {canScore ? (
                <AssessmentForm
                  schoolId={schoolId}
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

/** Thin wrapper: turns the school record into form state and injects the token. */
function EditSchoolForm({ school, onSubmit, onCancel, pending, error }) {
  const { token } = useAuth();
  return (
    <SchoolForm
      initial={Object.fromEntries(
        Object.keys(BLANK_SCHOOL).map((key) => [key, school[key] ?? BLANK_SCHOOL[key]])
      )}
      submitLabel="Save changes"
      pending={pending}
      error={error}
      onCancel={onCancel}
      onSubmit={(form) => onSubmit(form, token)}
    />
  );
}

export default function Schools() {
  const { role, token } = useAuth();
  const canEdit = role === "admin";

  const [selectedId, setSelectedId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [createPending, setCreatePending] = useState(false);
  const [createError, setCreateError] = useState(null);

  const list = useApi(() => api.listSchools({ limit: 500 }));

  // The registry read carries no score, so the Observatory rollup supplies the
  // latest score and band. It is enrichment, not the page: if the account may not
  // read it, the table still renders and the score column shows "—".
  const rollup = useApi((t) =>
    api
      .observatorySchools(t)
      .catch((err) => {
        if (err?.status === 401) throw err; // let useApi sign the stale session out
        return null;
      })
  );

  const scoreById = new Map(
    (rollup.data?.schools ?? []).map((s) => [s.school_id, s])
  );

  async function createSchool(form) {
    setCreatePending(true);
    setCreateError(null);
    try {
      await api.createSchool(
        {
          code: form.code,
          name: form.name,
          district: form.district,
          region: form.region,
          pilot_zone: form.pilot_zone || null,
          latitude: numOrNull(form.latitude),
          longitude: numOrNull(form.longitude),
          enrolment: numOrNull(form.enrolment),
          building_type: form.building_type || null,
          distance_to_facility_km: numOrNull(form.distance_to_facility_km),
          flood_zone_proximity_m: numOrNull(form.flood_zone_proximity_m),
          has_school_feeding: Boolean(form.has_school_feeding),
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
      <SchoolDetail
        schoolId={selectedId}
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
          <h1 className="font-display text-2xl font-bold">Schools</h1>
          <p className="mt-1 text-sm text-ink-2">
            The pilot school registry and its Climate Resilience Scores. A school is a place,
            not a child: nothing on this page identifies a pupil.
          </p>
        </div>
        {canEdit && !creating && (
          <Button onClick={() => setCreating(true)}>
            <Plus aria-hidden="true" className="h-4 w-4" /> Register a school
          </Button>
        )}
      </header>

      {canEdit && creating && (
        <Card title="Register a school">
          <SchoolForm
            initial={BLANK_SCHOOL}
            withCode
            submitLabel="Create school"
            pending={createPending}
            error={createError}
            onCancel={() => {
              setCreating(false);
              setCreateError(null);
            }}
            onSubmit={createSchool}
          />
        </Card>
      )}

      <Card title="Registry">
        {rollup.loading && <Loading label="Loading resilience scores…" />}
        <Async state={list} empty="No school has been registered yet.">
          {(schools) => (
            <Table
              rows={schools}
              empty="No school has been registered yet."
              columns={[
                {
                  key: "name",
                  header: "School",
                  render: (s) => (
                    <button
                      type="button"
                      onClick={() => setSelectedId(s.id)}
                      className="text-left font-display font-semibold text-ink underline decoration-line-2 underline-offset-4 hover:text-heat"
                    >
                      {show(s.name)}
                      <span className="block text-xs font-normal text-ink-3 no-underline">{show(s.code)}</span>
                    </button>
                  )
                },
                { key: "district", header: "District", render: (s) => show(s.district) },
                { key: "region", header: "Region", render: (s) => show(s.region) },
                { key: "pilot_zone", header: "Pilot zone", render: (s) => show(s.pilot_zone) },
                { key: "enrolment", header: "Enrolment", render: (s) => show(s.enrolment) },
                {
                  key: "resilience",
                  header: "Latest score",
                  render: (s) => show(scoreById.get(s.id)?.resilience_score)
                },
                {
                  key: "band",
                  header: "Current band",
                  render: (s) => {
                    const band = scoreById.get(s.id)?.current_band;
                    return band ? <BandChip band={band} /> : "—";
                  }
                },
                {
                  key: "active",
                  header: "Status",
                  render: (s) => (s.is_active ? "Active" : "Inactive")
                }
              ]}
            />
          )}
        </Async>
        {rollup.data === null && !rollup.loading && !rollup.error && (
          <p className="mt-4 text-xs text-ink-3">
            Resilience scores and bands could not be read with this account, so those columns
            show “—”. Open a school to see its recorded assessments.
          </p>
        )}
      </Card>
    </div>
  );
}
