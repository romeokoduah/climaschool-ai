// Risk map — schools and health facilities plotted from the Observatory GeoJSON.
//
// Drawn as inline SVG on purpose. A mapping library would add a dependency, a
// tile server and an outbound network call to a console that has to run on a
// single self-contained host, for a pilot whose points all sit inside a few
// districts. A fitted equirectangular projection is accurate enough at that
// scale and costs nothing.
//
// The map is a second way of reading the data, never the only way: every feature
// also appears in the table below, and every marker carries a number that keys
// it to its row, so nothing here depends on seeing a colour.

import { useMemo } from "react";
import { MapPin } from "lucide-react";
import { useApi } from "../AuthContext.jsx";
import { api } from "../../lib/api";
import { Async, BAND_STYLE, BandChip, Card, EmptyState, ErrorNote, Loading, Table, formatDate } from "../ui.jsx";

// SVG needs literal colours; BAND_STYLE carries Tailwind class names, so the
// hexes are repeated here from tailwind.config.js. The band *labels* are taken
// from BAND_STYLE so the two never drift apart in wording.
const BAND_FILL = {
  GREEN: "#5fc16f",
  YELLOW: "#ffc94d",
  ORANGE: "#ff6a3d",
  RED: "#c62828"
};
const NO_BAND_FILL = "#d9cdb1";
const BAND_ORDER = ["RED", "ORANGE", "YELLOW", "GREEN"];

const VIEW = { w: 920, h: 620, pad: 56 };
// A single point, or several in one village, would otherwise divide by a zero
// span. Give the plot a floor of roughly five kilometres across.
const MIN_SPAN_DEG = 0.05;

function show(value) {
  return value === null || value === undefined || value === "" ? "—" : value;
}

/** Dimension keys arrive as column names; show them as a person would say them. */
function humanise(key) {
  if (!key) return "—";
  const words = String(key).replace(/_/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function isSchool(feature) {
  return feature?.properties?.kind === "school";
}

/**
 * Fit an equirectangular projection to the bounding box of the points.
 * Longitude degrees are narrowed by cos(latitude) so the shape is not stretched
 * east-west; the result is centred in the viewport.
 */
function buildProjection(points) {
  const lons = points.map((p) => p.lon);
  const lats = points.map((p) => p.lat);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  const midLat = (minLat + maxLat) / 2;
  const lonSpan = Math.max(maxLon - minLon, MIN_SPAN_DEG);
  const latSpan = Math.max(maxLat - minLat, MIN_SPAN_DEG);
  const cos = Math.max(Math.cos((midLat * Math.PI) / 180), 0.01);

  const innerW = VIEW.w - VIEW.pad * 2;
  const innerH = VIEW.h - VIEW.pad * 2;
  const scale = Math.min(innerW / (lonSpan * cos), innerH / latSpan);

  const offsetX = (innerW - lonSpan * cos * scale) / 2;
  const offsetY = (innerH - latSpan * scale) / 2;
  const midLon = (minLon + maxLon) / 2;

  return {
    bbox: { minLon, maxLon, minLat, maxLat },
    x: (lon) => VIEW.pad + offsetX + (lon - (midLon - lonSpan / 2)) * cos * scale,
    y: (lat) => VIEW.pad + offsetY + ((midLat + latSpan / 2) - lat) * scale
  };
}

function coord(value) {
  return typeof value === "number" && Number.isFinite(value) ? value.toFixed(4) : "—";
}

function LegendSwatch({ fill, shape }) {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0" aria-hidden="true" focusable="false">
      {shape === "square" ? (
        <rect x="2.5" y="2.5" width="11" height="11" fill={fill} stroke="#1a140a" strokeWidth="1.5" />
      ) : (
        <circle cx="8" cy="8" r="5.5" fill={fill} stroke="#1a140a" strokeWidth="1.5" />
      )}
    </svg>
  );
}

function MapFigure({ points }) {
  const projection = useMemo(() => buildProjection(points), [points]);
  const { bbox } = projection;

  const bandsPresent = BAND_ORDER.filter((b) => points.some((p) => p.band === b));
  const schools = points.filter((p) => p.kind === "school").length;
  const facilities = points.length - schools;

  const description =
    `Map of ${points.length} geolocated point${points.length === 1 ? "" : "s"}: ` +
    `${schools} school${schools === 1 ? "" : "s"} drawn as numbered circles and ` +
    `${facilities} health ${facilities === 1 ? "facility" : "facilities"} drawn as numbered squares, ` +
    `positioned between ${coord(bbox.minLat)} and ${coord(bbox.maxLat)} degrees latitude and ` +
    `${coord(bbox.minLon)} to ${coord(bbox.maxLon)} degrees longitude. ` +
    (bandsPresent.length
      ? `Risk bands present: ${bandsPresent.map((b) => `${b} (${BAND_STYLE[b].label})`).join(", ")}. `
      : "No point carries a current risk band. ") +
    "Every point is listed with its figures in the table below this map.";

  return (
    <figure className="m-0">
      <svg
        role="img"
        aria-label={description}
        viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
        className="h-auto w-full rounded-xl2 border-2 border-line bg-cream"
      >
        <title>Geolocated pilot schools and health facilities by risk band</title>
        <desc>{description}</desc>

        <rect
          x={VIEW.pad / 2}
          y={VIEW.pad / 2}
          width={VIEW.w - VIEW.pad}
          height={VIEW.h - VIEW.pad}
          fill="none"
          stroke="#ece4d2"
          strokeWidth="2"
          strokeDasharray="6 6"
        />

        {/* Corner references, so a reader can tell where on the earth this is. */}
        <text x={VIEW.pad / 2} y={VIEW.pad / 2 - 10} fontSize="13" fill="#95876c">
          {coord(bbox.maxLat)}°N
        </text>
        <text x={VIEW.pad / 2} y={VIEW.h - VIEW.pad / 2 + 20} fontSize="13" fill="#95876c">
          {coord(bbox.minLon)}°E · {coord(bbox.minLat)}°N
        </text>
        <text x={VIEW.w - VIEW.pad / 2} y={VIEW.h - VIEW.pad / 2 + 20} fontSize="13" fill="#95876c" textAnchor="end">
          {coord(bbox.maxLon)}°E
        </text>

        {points.map((p) => {
          const cx = projection.x(p.lon);
          const cy = projection.y(p.lat);
          const fill = BAND_FILL[p.band] ?? NO_BAND_FILL;
          return (
            <g key={`${p.kind}-${p.id}`}>
              <title>
                {`${p.index}. ${p.name} — ${p.kind === "school" ? "school" : "health facility"}, ${
                  p.district ?? "district not recorded"
                }, band ${p.band ?? "not recorded"}`}
              </title>
              {p.kind === "school" ? (
                <circle cx={cx} cy={cy} r="9" fill={fill} stroke="#1a140a" strokeWidth="2" />
              ) : (
                <rect x={cx - 8} y={cy - 8} width="16" height="16" fill={fill} stroke="#1a140a" strokeWidth="2" />
              )}
              <text x={cx + 13} y={cy + 5} fontSize="14" fontWeight="700" fill="#1a140a">
                {p.index}
              </text>
            </g>
          );
        })}
      </svg>

      <figcaption className="mt-4">
        <h3 className="font-display text-sm font-semibold">Legend</h3>
        <ul className="mt-2 grid gap-2 text-sm text-ink-2 sm:grid-cols-2">
          {BAND_ORDER.map((band) => (
            <li key={band} className="flex items-center gap-2">
              <LegendSwatch fill={BAND_FILL[band]} shape="circle" />
              <span>
                <strong className="font-display font-semibold text-ink">{band}</strong> — {BAND_STYLE[band].label}
              </span>
            </li>
          ))}
          <li className="flex items-center gap-2">
            <LegendSwatch fill={NO_BAND_FILL} shape="circle" />
            <span>No band recorded yet</span>
          </li>
          <li className="flex items-center gap-2">
            <LegendSwatch fill={NO_BAND_FILL} shape="square" />
            <span>Health facility — squares carry a readiness score, not a hazard band</span>
          </li>
        </ul>
        <p className="mt-3 text-xs text-ink-3">
          Circles are schools, squares are health facilities, and the number beside each marker is
          its row number in the table below. Positions come from the recorded coordinates only —
          nothing on this map is approximated.
        </p>
      </figcaption>
    </figure>
  );
}

function NotGeolocated({ schools, facilities }) {
  const rows = [
    ...(schools ?? [])
      .filter((s) => s.is_active && (s.latitude == null || s.longitude == null))
      .map((s) => ({ id: `school-${s.id}`, kind: "School", name: s.name, code: s.code, district: s.district })),
    ...(facilities ?? [])
      .filter((f) => f.is_active && (f.latitude == null || f.longitude == null))
      .map((f) => ({ id: `facility-${f.id}`, kind: "Health facility", name: f.name, code: f.code, district: f.district }))
  ];

  return (
    <Card title={`Not yet geolocated (${rows.length})`}>
      <p className="text-sm text-ink-2">
        These records have no latitude and longitude, so they cannot be plotted. They are listed
        rather than placed: an approximate position would put a marker somewhere no one surveyed.
      </p>
      {rows.length ? (
        <ul className="mt-4 divide-y divide-dashed divide-line text-sm">
          {rows.map((r) => (
            <li key={r.id} className="py-2">
              <span className="font-display font-semibold text-ink">{show(r.name)}</span>
              <span className="block text-xs text-ink-3">
                {r.kind} · {show(r.code)} · {show(r.district)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-ink-3">Every active record carries coordinates.</p>
      )}
    </Card>
  );
}

export default function RiskMap() {
  const mapState = useApi((token) => api.observatoryMap(token));
  const schoolState = useApi(() => api.listSchools({ limit: 500 }));
  const facilityState = useApi(() => api.listFacilities({ limit: 500 }));

  // Flatten GeoJSON into plain plot rows once, numbered so the marker and the
  // table row share an identifier that does not rely on colour.
  const points = useMemo(
    () =>
      (mapState.data?.features ?? [])
        .map((f) => {
          const [lon, lat] = f?.geometry?.coordinates ?? [];
          if (typeof lon !== "number" || typeof lat !== "number") return null;
          const p = f.properties ?? {};
          return {
            lon,
            lat,
            kind: p.kind,
            id: p.id,
            code: p.code,
            name: p.name,
            district: p.district,
            region: p.region,
            band: p.band,
            score: isSchool(f) ? p.resilience_score : p.readiness_score,
            biggest_gap: p.biggest_gap,
            people: isSchool(f) ? p.enrolment : p.catchment_population
          };
        })
        .filter(Boolean)
        .map((p, i) => ({ ...p, index: i + 1 })),
    [mapState.data]
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">Risk map</h1>
        <p className="mt-1 text-sm text-ink-2">
          Institution-level geometry only. Schools and health facilities are public
          infrastructure — no point on this map locates a person.
        </p>
      </header>

      <Async state={mapState}>
        {(data) => (
          <>
            <p className="text-xs text-ink-3">
              Generated {formatDate(data?.properties?.generated_at)} ·{" "}
              {points.length} geolocated point{points.length === 1 ? "" : "s"}
            </p>

            <div className="grid gap-6 xl:grid-cols-3">
              <Card title="Ghana pilot — schools and facilities" className="xl:col-span-2">
                {points.length ? (
                  <MapFigure points={points} />
                ) : (
                  <EmptyState message="No school or facility has coordinates recorded yet, so there is nothing to plot." />
                )}
              </Card>

              <div className="space-y-6">
                {schoolState.loading || facilityState.loading ? (
                  <Card title="Not yet geolocated">
                    <Loading label="Loading the registry…" />
                  </Card>
                ) : schoolState.error || facilityState.error ? (
                  <Card title="Not yet geolocated">
                    <ErrorNote
                      error={schoolState.error || facilityState.error}
                      onRetry={() => {
                        schoolState.reload();
                        facilityState.reload();
                      }}
                    />
                  </Card>
                ) : (
                  <NotGeolocated schools={schoolState.data} facilities={facilityState.data} />
                )}

                <Card title="What the map shows">
                  <p className="text-sm text-ink-2">
                    Band comes from each school&rsquo;s most recent risk assessment. Health
                    facilities carry a readiness score instead of a hazard band, so they are drawn
                    in the neutral fill and marked with the square.
                  </p>
                  <p className="mt-3 flex items-start gap-2 text-xs text-ink-3">
                    <MapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{show(data?.properties?.anonymisation)}</span>
                  </p>
                </Card>
              </div>
            </div>

            <Card title="All plotted features">
              <Table
                empty="No geolocated school or facility yet."
                rows={points.map((p) => ({ ...p, id: `${p.kind}-${p.id}` }))}
                columns={[
                  { key: "index", header: "#", render: (p) => p.index },
                  {
                    key: "name",
                    header: "Name",
                    render: (p) => (
                      <>
                        <span className="font-display font-semibold text-ink">{show(p.name)}</span>
                        <span className="block text-xs text-ink-3">{show(p.code)}</span>
                      </>
                    )
                  },
                  {
                    key: "kind",
                    header: "Type",
                    render: (p) => (p.kind === "school" ? "School" : "Health facility")
                  },
                  { key: "district", header: "District", render: (p) => show(p.district) },
                  { key: "region", header: "Region", render: (p) => show(p.region) },
                  { key: "band", header: "Band", render: (p) => (p.band ? <BandChip band={p.band} /> : "—") },
                  { key: "score", header: "Score", render: (p) => show(p.score) },
                  { key: "biggest_gap", header: "Biggest gap", render: (p) => humanise(p.biggest_gap) },
                  { key: "people", header: "Enrolment / catchment", render: (p) => show(p.people) },
                  {
                    key: "coords",
                    header: "Coordinates",
                    render: (p) => `${coord(p.lat)}, ${coord(p.lon)}`
                  }
                ]}
              />
            </Card>
          </>
        )}
      </Async>
    </div>
  );
}
