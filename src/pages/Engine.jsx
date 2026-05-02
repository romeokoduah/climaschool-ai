import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Play, Wind, Droplets, Sun, Cloud, ArrowUpRight, GraduationCap, Users, Stethoscope } from "lucide-react";
import { Link } from "react-router-dom";
import { classify, presets, parseUpload } from "../lib/engine";
import { seasons } from "../data/seasons";

const districts = [
  "Greater Accra", "Ashanti · Kumasi", "Northern · Tamale",
  "Central · Cape Coast", "Upper East · Bolgatanga", "Volta · Ho"
];

export default function Engine() {
  const [input, setInput] = useState({ tempC: 32, humidity: 55, aqi: 60, rainfallMm: 0, schoolSize: 420, district: districts[0] });
  const [filename, setFilename] = useState("");
  const [parseError, setParseError] = useState("");
  const [running, setRunning] = useState(false);
  const fileRef = useRef(null);
  const dropRef = useRef(null);

  const out = useMemo(() => classify(input), [input]);

  useEffect(() => { document.body.dataset.season = out.season; }, [out.season]);

  const set = (k) => (v) => setInput((x) => ({ ...x, [k]: v }));

  const applyPreset = (k) => setInput((x) => ({ ...x, ...presets[k] }));

  const onFile = async (f) => {
    if (!f) return;
    setFilename(`${f.name} · ${(f.size / 1024).toFixed(1)} KB`);
    setParseError("");
    try {
      const text = await f.text();
      const parsed = parseUpload(f.name, text);
      setInput((x) => ({
        ...x,
        ...(parsed.tempC      != null ? { tempC: parsed.tempC } : {}),
        ...(parsed.humidity   != null ? { humidity: parsed.humidity } : {}),
        ...(parsed.aqi        != null ? { aqi: parsed.aqi } : {}),
        ...(parsed.rainfallMm != null ? { rainfallMm: parsed.rainfallMm } : {})
      }));
    } catch (err) {
      setParseError(`Parse error: ${err.message}`);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    dropRef.current?.classList.remove("ring-heat", "bg-heat/10");
    onFile(e.dataTransfer.files?.[0]);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 pt-12 pb-20">
      <div className="text-center">
        <span className="eyebrow">operations console</span>
        <h1 className="mt-2 font-display text-4xl font-semibold leading-tight md:text-6xl">
          The <em className="font-hand text-[1.2em] font-bold not-italic seasoned">Engine Room.</em>
        </h1>
        <p className="mx-auto mt-3 max-w-prose text-ink-2">
          Drop in a CSV or JSON of climate data — or move the sliders. Watch the AI re-classify the day, score the risk, and rewrite the dispatch in real time.
        </p>
        <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-2">
          <span className="font-display text-xs font-semibold uppercase tracking-widest text-ink-3">Quick presets</span>
          {Object.keys(presets).map((k) => (
            <button key={k} onClick={() => applyPreset(k)} className="chip">
              {k === "normal" ? "Normal day" :
               k === "harmattan" ? "Harmattan dust" :
               k === "dryheat" ? "Heat 41°C" :
               k === "firstrains" ? "Heavy rain 62mm" : "Wet harvest"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[400px_1fr]">

        {/* ─── INPUTS ─── */}
        <aside className="card flex flex-col gap-5 p-6">
          <Header n="01" title="Inputs" />

          <div
            ref={dropRef}
            onDragOver={(e) => { e.preventDefault(); dropRef.current?.classList.add("ring-heat", "bg-heat/10"); }}
            onDragLeave={() => dropRef.current?.classList.remove("ring-heat", "bg-heat/10")}
            onDrop={onDrop}
            className="rounded-xl3 border-[3px] border-dashed border-line-2 bg-cream-2 p-5 text-center ring-2 ring-transparent transition"
          >
            <input ref={fileRef} type="file" hidden accept=".csv,.json,application/json,text/csv" onChange={(e) => onFile(e.target.files?.[0])} />
            <button
              onClick={() => fileRef.current?.click()}
              className="flex w-full flex-col items-center gap-1.5"
            >
              <Upload className="h-8 w-8 text-heat" strokeWidth={2.2} />
              <b className="font-display">Drop a CSV or JSON file</b>
              <span className="text-xs text-ink-2">
                or click to choose · expects <code className="rounded border border-line-2 bg-paper px-1.5 py-0.5 font-mono text-[11px]">temp_c, humidity, aqi, rainfall_mm</code>
              </span>
            </button>
            {filename && <p className="mt-2 font-display text-xs font-semibold text-heat">Loaded: {filename}</p>}
            {parseError && <p className="mt-2 font-display text-xs font-semibold text-[#d8541e]">{parseError}</p>}
          </div>

          <Slider Icon={Sun}      label="Temperature"        unit="°C"      value={input.tempC}      onChange={set("tempC")}      min={15}  max={45}  step={0.5} scale={["15","30","45"]} />
          <Slider Icon={Droplets} label="Humidity"           unit="%"       value={input.humidity}   onChange={set("humidity")}   min={10}  max={100} step={1}   scale={["10","55","100"]} />
          <Slider Icon={Wind}     label="Air quality (AQI)"  unit=""        value={input.aqi}        onChange={set("aqi")}        min={0}   max={300} step={1}   scale={["0","150","300"]} />
          <Slider Icon={Cloud}    label="Rainfall (24h)"     unit="mm"      value={input.rainfallMm} onChange={set("rainfallMm")} min={0}   max={120} step={1}   scale={["0","60","120"]} />
          <Slider Icon={GraduationCap} label="Pilot school size" unit="pupils" value={input.schoolSize} onChange={set("schoolSize")} min={80} max={900} step={10} scale={["80","500","900"]} />

          <div>
            <label className="font-display text-sm font-semibold">District</label>
            <select
              value={input.district}
              onChange={(e) => set("district")(e.target.value)}
              className="mt-1 w-full rounded-full border-2 border-line-2 bg-paper px-4 py-2.5 font-body text-sm text-ink"
            >
              {districts.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>

          <button
            onClick={() => { setRunning(true); setTimeout(() => setRunning(false), 800); }}
            className={`btn-primary w-full ${running ? "scale-[.98] shadow-glow" : ""}`}
          >
            <Play className="h-4 w-4" /> Run engine
          </button>
        </aside>

        {/* ─── OUTPUT ─── */}
        <main className="flex flex-col gap-5">
          <Header n="02" title="Live output" pulse />

          <div className="grid items-center gap-6 rounded-xl3 border-2 seasoned-border seasoned-soft-bg p-6 md:grid-cols-[auto_1fr]">
            <div>
              <span className="font-display text-xs font-semibold uppercase tracking-widest text-ink-2">Risk score</span>
              <motion.div
                key={out.overall}
                initial={{ scale: 0.92 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className="mt-1 flex items-baseline gap-2"
              >
                <strong className="font-display text-7xl font-bold leading-none tracking-tight seasoned">{out.overall}</strong>
                <span className="font-display text-sm font-medium text-ink-3">/ 100</span>
              </motion.div>
              <div className="mt-3 h-3 overflow-hidden rounded-full border border-line bg-paper">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-leaf via-sun to-heat"
                  animate={{ width: `${out.overall}%` }}
                  transition={{ duration: 0.7, ease: [0.7, 0.1, 0.2, 1] }}
                />
              </div>
            </div>
            <div className="md:border-l-2 md:border-dashed md:border-paper md:pl-6">
              <span className="font-display text-xs font-semibold uppercase tracking-widest text-ink-2">Classified season</span>
              <h3 className="mt-1 font-display text-3xl font-semibold">{seasons[out.season].title}</h3>
              <p className="font-hand text-xl text-ink-2">{seasons[out.season].months}</p>
              <span className="mt-3 inline-block rounded-full seasoned-bg px-4 py-1.5 font-display text-xs font-bold uppercase tracking-wider text-white shadow-soft">
                {out.action}
              </span>
            </div>
          </div>

          <div className="card p-5">
            <h4 className="mb-3 flex items-center gap-2 font-display text-base font-semibold">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full seasoned-bg shadow-[0_0_10px_currentColor] seasoned" /> Triggers fired
            </h4>
            <ol className="flex flex-col gap-2">
              <AnimatePresence initial={false}>
                {out.fires.map(([t, b]) => (
                  <motion.li
                    key={t}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    className="rounded-xl2 border-l-4 seasoned-border border-y-2 border-r-2 border-dashed border-line-2 bg-cream-2 px-4 py-3"
                  >
                    <b className="block font-display font-bold">{t}</b>
                    <p className="text-sm text-ink-2">{b}</p>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ol>
          </div>

          <Reach overall={out.overall} />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="card p-5">
              <h4 className="mb-3 font-display text-base font-semibold">📱 Sample parent SMS</h4>
              <div className="rounded-[18px_18px_18px_6px] seasoned-bg p-4 text-white shadow-soft">
                <b className="block">{seasons[out.season].sms[0].title}</b>
                <span className="text-sm">{seasons[out.season].sms[0].body}</span>
                <span className="mt-1 block font-display text-[10px] opacity-80">{seasons[out.season].sms[0].ts}</span>
              </div>
            </div>
            <div className="card p-5">
              <h4 className="mb-3 font-display text-base font-semibold">⚠ Top risks</h4>
              <ul className="flex flex-col gap-2">
                {seasons[out.season].risks.slice(0, 3).map(([t, b]) => (
                  <li key={t} className="border-b border-dashed border-line pb-2 last:border-0">
                    <b className="font-bold">{t}</b>
                    <p className="text-sm text-ink-2">{b}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Link to="/advisory" className="btn-ghost self-start">
            Open the full advisory <ArrowUpRight className="h-4 w-4" />
          </Link>
        </main>
      </div>
    </div>
  );
}

function Header({ n, title, pulse }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-heat font-display text-sm font-bold text-white">{n}</span>
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      {pulse && (
        <span className="ml-auto inline-flex items-center gap-1.5 font-display text-[11px] font-bold uppercase tracking-wider text-leaf">
          <span className="h-2 w-2 animate-pulse rounded-full bg-leaf shadow-[0_0_10px_#5fc16f]" /> live
        </span>
      )}
    </div>
  );
}

function Slider({ Icon, label, unit, value, onChange, min, max, step, scale }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label className="inline-flex items-center gap-2 font-display text-sm font-semibold">
          <Icon className="h-4 w-4 text-heat" /> {label}
        </label>
        <span className="ml-auto font-display text-2xl font-bold text-heat">
          {value}
          {unit && <span className="ml-1 text-sm font-semibold text-ink-3">{unit}</span>}
        </span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
      <div className="flex justify-between font-display text-[11px] font-medium text-ink-3">
        {scale.map((s) => <span key={s}>{s}</span>)}
      </div>
    </div>
  );
}

function Reach({ overall }) {
  const schools = Math.min(12, Math.max(1, Math.round(overall / 8)));
  const parents = (schools * 410 + Math.round(overall * 7)).toLocaleString();
  const chws    = Math.max(1, Math.round(schools * 1.4));

  const cell = (Icon, cap, big, sub) => (
    <div className="flex flex-col gap-1 p-5 [&:not(:last-child)]:md:border-r-2 [&:not(:last-child)]:md:border-dashed [&:not(:last-child)]:md:border-line">
      <span className="inline-flex items-center gap-2 font-display text-xs font-semibold uppercase tracking-widest text-ink-3">
        <Icon className="h-3.5 w-3.5" /> {cap}
      </span>
      <strong className="font-display text-3xl font-bold leading-none seasoned">{big}</strong>
      <span className="text-sm text-ink-2">{sub}</span>
    </div>
  );

  return (
    <div className="grid grid-cols-1 overflow-hidden rounded-xl3 border-2 border-line bg-paper md:grid-cols-3">
      {cell(GraduationCap, "Schools", schools, "alerted in district")}
      {cell(Users,         "Parents", parents, "SMS dispatched")}
      {cell(Stethoscope,   "CHWs",    chws,    "field tasks queued")}
    </div>
  );
}
