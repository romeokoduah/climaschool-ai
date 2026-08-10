import PageHero from "../components/PageHero.jsx";
import { photos } from "../lib/photos";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDown,
  Siren,
  MessageSquare,
  ShieldCheck,
  Info,
  Zap,
  CircleDot
} from "lucide-react";
import {
  chainIntro,
  chainAlert,
  earlyActionChain,
  schoolScoreIntro,
  schoolDimensions,
  schoolScoreExample,
  emergencyModeIntro,
  emergencyHazards,
  signalChainIntro,
  signalChain,
  facilityIntro,
  facilityDimensions,
  facilityExample,
  aprraCycle,
  demandForecast,
  observerIntro,
  institutionalUsers,
  reviewDeskIntro,
  reviewDeskActions,
  sampleNote
} from "../data/earlyAction";

/* Literal class strings so Tailwind's scanner keeps them. */
const accents = {
  heat:  { text: "text-heat",      border: "border-heat",  bg: "bg-heat",  fg: "text-white" },
  sky:   { text: "text-[#2f6fd0]", border: "border-sky",   bg: "bg-sky",   fg: "text-white" },
  leaf:  { text: "text-[#2e7d3c]", border: "border-leaf",  bg: "bg-leaf",  fg: "text-white" },
  sun:   { text: "text-[#8a6100]", border: "border-sun",   bg: "bg-sun",   fg: "text-ink" },
  coral: { text: "text-[#c9436d]", border: "border-coral", bg: "bg-coral", fg: "text-white" },
  plum:  { text: "text-[#5b3fd6]", border: "border-plum",  bg: "bg-plum",  fg: "text-white" }
};
const acc = (k) => accents[k] || accents.heat;

/* Risk wording carries the meaning; colour is decoration only. */
const riskTone = {
  High:     { dot: "bg-[#c62828]", text: "text-[#c62828]", ring: "border-[#c62828]" },
  Moderate: { dot: "bg-sun",       text: "text-[#8a6100]", ring: "border-sun" },
  Low:      { dot: "bg-leaf",      text: "text-[#2e7d3c]", ring: "border-leaf" }
};
const tone = (l) => riskTone[l] || riskTone.Moderate;

function SampleNote({ light = false }) {
  return (
    <p className={`mt-4 font-display text-xs font-medium ${light ? "text-white/70" : "text-ink-3"}`}>
      {sampleNote}
    </p>
  );
}

function SectionHead({ eyebrow, title, em, sub, id }) {
  return (
    <header className="max-w-3xl">
      <span className="eyebrow">{eyebrow}</span>
      <h2 id={id} className="mt-2 font-display text-3xl font-semibold leading-tight md:text-4xl">
        {title}{" "}
        {em && <em className="font-hand text-[1.2em] font-bold not-italic text-heat">{em}</em>}
      </h2>
      {sub && <p className="mt-3 text-ink-2">{sub}</p>}
    </header>
  );
}

function ScoreBar({ label, value, outOf = 100, status, barClass = "bg-gradient-to-r from-leaf via-sun to-heat" }) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-display text-sm font-semibold">{label}</span>
        <span className="font-display text-sm font-bold text-ink-2">
          {value}% <span className="font-medium text-ink-3">· {status}</span>
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={outOf}
        aria-label={`${label}: ${value} out of ${outOf} — ${status}`}
        className="mt-1.5 h-2.5 overflow-hidden rounded-full border border-line bg-cream-2"
      >
        <div className={`h-full rounded-full ${barClass}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default function EarlyAction() {
  return (
    <>
      <PageHero
        eyebrow="the early action chain"
        title="The alert is not the innovation."
        em="The action is."
        sub={chainIntro.claim}
        photo={photos.community}
        alt="African women and children gathered together under a tree"
      />

      {/* ── 1 · The Early Action Chain ──────────────────────────────── */}
      <section aria-labelledby="chain-h" className="mx-auto max-w-7xl px-6 py-12">
        <SectionHead
          id="chain-h"
          eyebrow="01 · early action chain"
          title="One alert."
          em="Five actors. Five jobs. Same minute."
          sub={chainIntro.note}
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="mt-8 overflow-hidden rounded-xl4 border-2 border-heat bg-gradient-to-b from-heat/15 to-paper shadow-big"
        >
          <div className="flex flex-wrap items-center gap-3 border-b-2 border-dashed border-heat/40 px-6 py-4 md:px-8">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-heat text-white shadow-soft">
              <Siren className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <span className="font-display text-[11px] font-bold uppercase tracking-widest text-ink-3">
                Worked example
              </span>
              <h3 className="font-display text-2xl font-semibold leading-tight md:text-3xl">
                {chainAlert.hazard} · {chainAlert.risk} · {chainAlert.level}
              </h3>
            </div>
            <span className="ml-auto rounded-full border-2 border-heat bg-paper px-4 py-1.5 font-display text-xs font-bold uppercase tracking-wider text-heat">
              {chainAlert.level}
            </span>
          </div>

          <div className="grid gap-2 px-6 py-4 md:grid-cols-2 md:px-8">
            <p className="text-sm text-ink-2">
              <b className="font-display font-semibold text-ink">What orange means: </b>
              {chainAlert.levelMeaning}
            </p>
            <p className="text-sm text-ink-2 md:text-right">
              <b className="font-display font-semibold text-ink">Dispatch: </b>
              {chainAlert.timing}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 pb-2 font-hand text-2xl font-bold text-heat">
            <ArrowDown className="h-5 w-5" aria-hidden="true" />
            everyone moves at once
            <ArrowDown className="h-5 w-5" aria-hidden="true" />
          </div>

          <ol className="grid gap-4 p-6 md:grid-cols-2 md:p-8 lg:grid-cols-5">
            {earlyActionChain.map((a, i) => {
              const c = acc(a.accent);
              return (
                <motion.li
                  key={a.actor}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className={`flex flex-col rounded-xl3 border-2 ${c.border} bg-paper p-5 shadow-soft`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`grid h-9 w-9 place-items-center rounded-full ${c.bg} ${c.fg}`}>
                      <a.Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className={`font-display text-[11px] font-bold uppercase tracking-widest ${c.text}`}>
                      Actor {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h4 className="mt-3 font-display text-lg font-bold leading-tight">{a.actor}</h4>
                  <p className="mt-1 text-xs text-ink-3">{a.who}</p>

                  {a.actions && (
                    <ul className="mt-3 flex flex-col">
                      {a.actions.map((t) => (
                        <li key={t} className="grid grid-cols-[18px_1fr] gap-2 border-t border-dashed border-line py-2 text-sm text-ink-2">
                          <span className={`mt-1 h-2 w-2 rounded-full ${c.bg}`} aria-hidden="true" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {a.sms && (
                    <div className="mt-3">
                      <div className="rounded-[18px_18px_18px_6px] bg-[#2f6fd0] p-4 text-white shadow-soft">
                        <span className="flex items-center gap-1.5 font-display text-[10px] font-bold uppercase tracking-widest opacity-90">
                          <MessageSquare className="h-3 w-3" aria-hidden="true" /> SMS to parent
                        </span>
                        <p className="mt-1.5 text-[13px] leading-snug">{a.sms}</p>
                      </div>
                      <p className="mt-2 font-display text-[10px] font-semibold uppercase tracking-wider text-ink-3">
                        {a.smsMeta}
                      </p>
                    </div>
                  )}
                </motion.li>
              );
            })}
          </ol>

          <div className="px-6 pb-6 md:px-8">
            <SampleNote />
          </div>
        </motion.div>
      </section>

      {/* ── 2 · School Climate Resilience Score ─────────────────────── */}
      <section aria-labelledby="score-h" className="border-t-2 border-dashed border-line-2 bg-cream-2/50 py-14">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHead
            id="score-h"
            eyebrow="02 · schools"
            title="School Climate"
            em="Resilience Score."
            sub={schoolScoreIntro}
          />

          <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {schoolDimensions.map((d, i) => (
              <motion.li
                key={d.dimension}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 4) * 0.06 }}
                whileHover={{ y: -4 }}
                className="rounded-xl3 border-2 border-line bg-paper p-5 shadow-soft transition hover:border-heat"
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-cream-2 text-heat">
                  <d.Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <h3 className="mt-3 font-display text-lg font-bold leading-tight">{d.dimension}</h3>
                <ul className="mt-2">
                  {d.indicators.map((ind) => (
                    <li key={ind} className="border-t border-dashed border-line py-1.5 text-sm text-ink-2">
                      {ind}
                    </li>
                  ))}
                </ul>
              </motion.li>
            ))}
          </ul>

          {/* Worked example */}
          <div className="mt-10 overflow-hidden rounded-xl4 border-2 border-line-2 bg-paper shadow-big">
            <div className="flex flex-wrap items-center gap-3 border-b-2 border-dashed border-line bg-cream-2 px-6 py-4 md:px-8">
              <span className="font-display text-[11px] font-bold uppercase tracking-widest text-ink-3">
                Worked example
              </span>
              <h3 className="font-display text-xl font-semibold">{schoolScoreExample.school}</h3>
            </div>

            <div className="grid gap-8 p-6 md:grid-cols-[1fr_1.3fr] md:p-8">
              <div>
                <span className="font-display text-xs font-semibold uppercase tracking-widest text-ink-3">
                  Overall score
                </span>
                <p className="mt-1 font-display text-6xl font-bold text-heat">
                  {schoolScoreExample.score}
                  <span className="font-display text-2xl font-semibold text-ink-3">
                    /{schoolScoreExample.outOf}
                  </span>
                </p>
                <p className="mt-1 font-hand text-2xl font-bold text-ink-2">{schoolScoreExample.band}</p>
                <div className="mt-4">
                  <ScoreBar
                    label="Overall resilience"
                    value={schoolScoreExample.score}
                    outOf={schoolScoreExample.outOf}
                    status={schoolScoreExample.band}
                  />
                </div>
                <div className="mt-6">
                  <ScoreBar
                    label={`Biggest gap — ${schoolScoreExample.biggestGap.dimension}`}
                    value={schoolScoreExample.biggestGap.score}
                    outOf={schoolScoreExample.biggestGap.outOf}
                    status="Weakest dimension"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="rounded-xl3 border-2 border-heat bg-gradient-to-b from-heat/10 to-paper p-5">
                  <span className="font-display text-xs font-semibold uppercase tracking-widest text-ink-3">
                    Priority action
                  </span>
                  <p className="mt-1 font-display text-xl font-bold">{schoolScoreExample.priorityAction}</p>
                  <p className="mt-1 text-sm text-ink-2">{schoolScoreExample.expectedGain}</p>
                </div>

                <div className="rounded-xl3 border-2 border-line bg-paper p-5 shadow-soft">
                  <span className="font-display text-xs font-semibold uppercase tracking-widest text-ink-3">
                    {schoolScoreExample.costingLabel}
                  </span>
                  <p className="mt-1 text-sm text-ink-2">{schoolScoreExample.costingNote}</p>
                  <table className="mt-3 w-full text-sm">
                    <caption className="sr-only">
                      School-level costing for the priority action at {schoolScoreExample.school}
                    </caption>
                    <tbody>
                      {schoolScoreExample.costing.map((r) => (
                        <tr key={r.item}>
                          <th scope="row" className="border-t border-dashed border-line py-2 text-left font-normal text-ink-2">
                            {r.item}
                          </th>
                          <td className="border-t border-dashed border-line py-2 text-right font-display font-semibold">
                            {r.cost}
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <th scope="row" className="border-t-2 border-line-2 py-2 text-left font-display font-bold">
                          Total
                        </th>
                        <td className="border-t-2 border-line-2 py-2 text-right font-display font-bold text-heat">
                          {schoolScoreExample.costingTotal}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="mt-3 border-t border-dashed border-line pt-3 font-display text-sm font-semibold text-leaf">
                    {schoolScoreExample.riskReduction}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 md:px-8">
              <SampleNote />
            </div>
          </div>
        </div>
      </section>

      {/* ── 3 · Emergency Mode ──────────────────────────────────────── */}
      <section aria-labelledby="emergency-h" className="mx-auto max-w-7xl px-6 py-14">
        <SectionHead
          id="emergency-h"
          eyebrow="03 · emergency mode"
          title="One button."
          em="A full response workflow."
          sub={emergencyModeIntro.body}
        />

        <div className="mt-8 grid items-center gap-8 rounded-xl4 border-2 border-line-2 bg-gradient-to-b from-heat/10 to-paper p-6 shadow-lift md:grid-cols-[minmax(0,340px)_1fr] md:p-8">
          <div className="text-center">
            <span className="btn-primary cursor-default text-lg">
              <Zap className="h-5 w-5" aria-hidden="true" />
              {emergencyModeIntro.button}
            </span>
            <p className="mt-3 font-display text-xs font-medium uppercase tracking-widest text-ink-3">
              Illustrative interface
            </p>
          </div>
          <p className="font-display text-2xl font-semibold leading-snug md:text-3xl">
            {emergencyModeIntro.headline}{" "}
            <span className="font-hand text-[1.15em] font-bold text-heat">
              The head teacher picks the hazard — the platform writes the rest.
            </span>
          </p>
        </div>

        <ul className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {emergencyHazards.map((h, i) => {
            const c = acc(h.accent);
            return (
              <motion.li
                key={h.hazard}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 3) * 0.07 }}
                whileHover={{ y: -4 }}
                className={`rounded-xl3 border-2 ${c.border} bg-paper p-6 shadow-soft`}
              >
                <div className="flex items-center gap-3">
                  <span className={`grid h-10 w-10 place-items-center rounded-full ${c.bg} ${c.fg}`}>
                    <h.Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-bold leading-tight">{h.hazard}</h3>
                    <span className={`font-display text-xs font-semibold uppercase tracking-wider ${c.text}`}>
                      {h.summary}
                    </span>
                  </div>
                </div>
                <ol className="mt-4">
                  {h.steps.map((s, n) => (
                    <li key={s} className="grid grid-cols-[26px_1fr] gap-2 border-t border-dashed border-line py-2 text-sm text-ink-2">
                      <span className="font-display text-xs font-bold text-ink-3">
                        {String(n + 1).padStart(2, "0")}
                      </span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
              </motion.li>
            );
          })}
        </ul>
      </section>

      {/* ── 4 · Signal chain ────────────────────────────────────────── */}
      <section aria-labelledby="signal-h" className="border-y-2 border-dashed border-line-2 bg-cream-2/50 py-14">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHead
            id="signal-h"
            eyebrow="04 · signal chain"
            title="School to CHW to"
            em="health facility."
            sub={signalChainIntro}
          />

          <ol className="mt-8 flex flex-col">
            {signalChain.map((s, i) => (
              <motion.li
                key={s.stage}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="grid grid-cols-[46px_1fr] gap-4 md:grid-cols-[46px_240px_1fr]"
              >
                <div className="flex flex-col items-center">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-heat font-display text-sm font-bold text-white shadow-soft">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {i < signalChain.length - 1 && (
                    <span aria-hidden="true" className="my-1 w-0.5 flex-1 bg-line-2" />
                  )}
                </div>
                <div className="pb-6">
                  <h3 className="font-display text-lg font-bold leading-tight">{s.stage}</h3>
                  <span className="font-display text-xs font-semibold uppercase tracking-wider text-ink-3">
                    {s.actor}
                  </span>
                </div>
                <p className="pb-6 text-ink-2 md:pt-1">{s.what}</p>
              </motion.li>
            ))}
          </ol>

          <SampleNote />
        </div>
      </section>

      {/* ── 5 · Health facilities ───────────────────────────────────── */}
      <section aria-labelledby="facility-h" className="mx-auto max-w-7xl px-6 py-14">
        <SectionHead
          id="facility-h"
          eyebrow="05 · health facilities"
          title="ClimaSchool AI for"
          em="health facilities."
          sub={facilityIntro.body}
        />
        <p className="mt-4 inline-flex items-center gap-2 rounded-full border-2 border-line-2 bg-paper px-4 py-2 font-display text-xs font-semibold text-ink-2">
          <ShieldCheck className="h-4 w-4 text-leaf" aria-hidden="true" />
          Grounded in the {facilityIntro.framework}
        </p>

        <h3 className="mt-10 font-display text-2xl font-semibold">Facility Climate Resilience Score</h3>
        <ul className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {facilityDimensions.map((d, i) => (
            <motion.li
              key={d.dimension}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 3) * 0.07 }}
              whileHover={{ y: -4 }}
              className="rounded-xl3 border-2 border-line bg-paper p-5 shadow-soft transition hover:border-heat"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-cream-2 text-heat">
                <d.Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <h4 className="mt-3 font-display text-lg font-bold leading-tight">{d.dimension}</h4>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {d.indicators.map((ind) => (
                  <li
                    key={ind}
                    className="rounded-full border border-line bg-cream-2 px-2.5 py-1 text-xs text-ink-2"
                  >
                    {ind}
                  </li>
                ))}
              </ul>
            </motion.li>
          ))}
        </ul>

        {/* Facility dashboard example */}
        <div className="mt-10 overflow-hidden rounded-xl4 border-2 border-line-2 bg-paper shadow-big">
          <div className="flex flex-wrap items-center gap-2 border-b-2 border-dashed border-line bg-cream-2 px-6 py-3 font-display text-xs font-medium text-ink-2 md:px-8">
            <span aria-hidden="true" className="h-3 w-3 rounded-full bg-[#ff8470] ring-2 ring-black/5" />
            <span aria-hidden="true" className="h-3 w-3 rounded-full bg-[#ffd060] ring-2 ring-black/5" />
            <span aria-hidden="true" className="h-3 w-3 rounded-full bg-[#6fd48a] ring-2 ring-black/5" />
            <span className="ml-3 font-semibold">climaschool · facility dashboard · example</span>
          </div>

          <div className="grid gap-8 p-6 md:grid-cols-3 md:p-8">
            <div>
              <h4 className="font-display text-xl font-bold leading-tight">{facilityExample.facility}</h4>
              <span className="mt-3 block font-display text-xs font-semibold uppercase tracking-widest text-ink-3">
                Facility Climate Resilience Score
              </span>
              <p className="font-display text-5xl font-bold text-heat">
                {facilityExample.score}
                <span className="font-display text-xl font-semibold text-ink-3">/{facilityExample.outOf}</span>
              </p>
              <div className="mt-3">
                <ScoreBar
                  label="Facility resilience"
                  value={facilityExample.score}
                  outOf={facilityExample.outOf}
                  status="Moderate readiness"
                />
              </div>

              <span className="mt-6 block font-display text-xs font-semibold uppercase tracking-widest text-ink-3">
                Current risk levels
              </span>
              <ul className="mt-2 flex flex-col">
                {facilityExample.risks.map((r) => {
                  const t = tone(r.level);
                  return (
                    <li
                      key={r.name}
                      className="flex items-center justify-between border-b border-dashed border-line py-2 text-sm"
                    >
                      <span className="text-ink-2">{r.name}</span>
                      <span className={`inline-flex items-center gap-1.5 font-display font-bold ${t.text}`}>
                        <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${t.dot}`} />
                        {r.level}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <span className="font-display text-xs font-semibold uppercase tracking-widest text-ink-3">
                Supply readiness
              </span>
              <div className="mt-3 flex flex-col gap-4">
                {facilityExample.supplies.map((s) => (
                  <ScoreBar
                    key={s.name}
                    label={s.name}
                    value={s.pct}
                    status={s.status}
                    barClass={s.status === "Below threshold" ? "bg-[#c62828]" : "bg-leaf"}
                  />
                ))}
              </div>
            </div>

            <div>
              <span className="font-display text-xs font-semibold uppercase tracking-widest text-ink-3">
                {facilityExample.actionsLabel}
              </span>
              <ol className="mt-3 flex flex-col gap-2">
                {facilityExample.actions.map((a, i) => (
                  <li
                    key={a}
                    className="grid grid-cols-[26px_1fr] gap-2 rounded-xl2 border-2 border-line bg-cream-2/60 p-3 text-sm"
                  >
                    <span className="font-display text-xs font-bold text-heat">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-ink-2">{a}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="px-6 pb-6 md:px-8">
            <SampleNote />
          </div>
        </div>

        {/* APRRA cycle */}
        <h3 className="mt-14 font-display text-2xl font-semibold">
          Anticipate · Prepare · Respond · Recover · Adapt
        </h3>
        <p className="mt-2 max-w-3xl text-ink-2">
          The facility module follows the WHO cycle end to end, so each phase produces the input the
          next one needs.
        </p>
        <ol className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {aprraCycle.map((p, i) => (
            <motion.li
              key={p.phase}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="relative rounded-xl3 border-2 border-line bg-paper p-5 shadow-soft"
            >
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-sky text-white">
                  <p.Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="font-display text-[11px] font-bold uppercase tracking-widest text-ink-3">
                  Phase {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h4 className="mt-3 font-display text-lg font-bold leading-tight">{p.phase}</h4>
              <p className="mt-1.5 text-sm text-ink-2">{p.fn}</p>
            </motion.li>
          ))}
        </ol>

        {/* Demand forecasting */}
        <div className="mt-14 grid gap-6 md:grid-cols-[1.2fr_1fr]">
          <div className="rounded-xl4 border-2 border-line-2 bg-paper p-6 shadow-soft md:p-8">
            <h3 className="font-display text-2xl font-semibold">Health facility demand forecasting</h3>
            <p className="mt-2 text-ink-2">{demandForecast.intro}</p>
            <dl className="mt-5">
              {demandForecast.rows.map((r) => (
                <div key={r.key} className="border-t border-dashed border-line py-3">
                  <dt className="font-display text-sm font-semibold uppercase tracking-wide text-ink-3">
                    {r.key}
                  </dt>
                  <dd className="mt-0.5">
                    <b className="font-display text-lg font-bold text-heat">{r.value}</b>
                    <p className="text-sm text-ink-2">{r.note}</p>
                  </dd>
                </div>
              ))}
            </dl>
            <SampleNote />
          </div>

          <aside className="rounded-xl4 border-2 border-[#c62828] bg-[#fff0e8] p-6 shadow-soft md:p-8">
            <span className="inline-flex items-center gap-2 font-display text-xs font-bold uppercase tracking-widest text-[#c62828]">
              <Info className="h-4 w-4" aria-hidden="true" /> Important
            </span>
            <p className="mt-3 font-display text-lg font-semibold leading-snug text-ink">
              {demandForecast.caveat}
            </p>
            <p className="mt-3 text-sm text-ink-2">
              ClimaSchool AI never diagnoses, never prescribes, and never replaces a clinician. It
              gives facility staff earlier notice of what may be coming through the door.
            </p>
          </aside>
        </div>
      </section>

      {/* ── 6 · Institutional Observer ──────────────────────────────── */}
      <section aria-labelledby="observer-h" className="border-t-2 border-dashed border-line-2 bg-cream-2/50 py-14">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHead
            id="observer-h"
            eyebrow="06 · institutional observer"
            title="Read-only."
            em="No system integration required."
            sub={observerIntro.body}
          />

          <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {institutionalUsers.map((u, i) => {
              const c = acc(u.accent);
              return (
                <motion.li
                  key={u.user}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % 3) * 0.07 }}
                  whileHover={{ y: -4 }}
                  className={`rounded-xl3 border-2 ${c.border} bg-paper p-6 shadow-soft`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${c.bg} ${c.fg}`}>
                      <u.Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h3 className="font-display text-lg font-bold leading-tight">{u.user}</h3>
                  </div>
                  <span className={`mt-4 block font-display text-[11px] font-bold uppercase tracking-widest ${c.text}`}>
                    What they see
                  </span>
                  <ul className="mt-1">
                    {u.sees.map((s) => (
                      <li key={s} className="grid grid-cols-[18px_1fr] gap-2 border-t border-dashed border-line py-2 text-sm text-ink-2">
                        <span aria-hidden="true" className={`mt-1.5 h-2 w-2 rounded-full ${c.bg}`} />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </motion.li>
              );
            })}
          </ul>

          <div className="mt-10 rounded-xl4 border-2 border-line-2 bg-paper p-6 shadow-soft md:p-8">
            <h3 className="font-display text-2xl font-semibold">Institutional review desk</h3>
            <p className="mt-2 max-w-3xl text-ink-2">{reviewDeskIntro}</p>
            <ul className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-5">
              {reviewDeskActions.map((a) => (
                <li key={a.action} className="rounded-xl3 border-2 border-line bg-cream-2/60 p-5">
                  <span className="inline-flex items-center gap-1.5 font-display text-base font-bold text-heat">
                    <CircleDot className="h-4 w-4" aria-hidden="true" />
                    {a.action}
                  </span>
                  <p className="mt-1.5 text-sm text-ink-2">{a.desc}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Close ───────────────────────────────────────────────────── */}
      <section className="border-t-2 border-dashed border-line-2 bg-gradient-to-b from-heat/10 to-cream py-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <span className="eyebrow">early warning to early action</span>
          <h2 className="mx-auto mt-2 max-w-[24ch] font-display text-3xl font-semibold leading-tight md:text-5xl">
            A warning nobody acts on is just weather.{" "}
            <em className="font-hand text-[1.15em] font-bold not-italic text-heat">
              We ship the action with it.
            </em>
          </h2>
          <p className="mx-auto mt-4 max-w-prose text-ink-2">
            ClimaSchool AI is led by Eco-lution Consults in Ghana, and is being piloted with two
            confirmed schools across two zones. Every worked example on this page is illustrative of
            a live deployment.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/advisory" className="btn-primary">
              See today's advisory <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link to="/about" className="btn-ghost">
              How the engine works
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
