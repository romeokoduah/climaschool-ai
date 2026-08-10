import PageHero from "../components/PageHero.jsx";
import { photos } from "../lib/photos";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ShieldCheck,
  Gauge,
  UserCheck,
  Repeat,
  BellRing,
  FlaskConical,
  FileText,
  ScrollText,
  BarChart3,
  Timer,
  Globe2
} from "lucide-react";
import {
  riskLevels,
  exampleAlert,
  alertFraming,
  safetyGates,
  alertLifecycle,
  alertTypes,
  modelLab,
  modelCardItems,
  raiPrinciples,
  childOutcomeMetrics,
  systemMetrics,
  minutesOfProtection,
  dpgCommitments
} from "../data/responsible";

const rise = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true }
};

function SectionHead({ eyebrow, title, em, sub, align = "center" }) {
  return (
    <div className={align === "center" ? "text-center" : ""}>
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="mt-2 font-display text-3xl font-semibold leading-tight md:text-4xl">
        {title}{" "}
        {em && (
          <em className="font-hand text-[1.2em] font-bold not-italic text-heat">{em}</em>
        )}
      </h2>
      {sub && (
        <p
          className={`mt-3 max-w-prose text-ink-2 ${align === "center" ? "mx-auto" : ""}`}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

function SampleNote({ className = "" }) {
  return (
    <p className={`font-display text-xs font-medium text-ink-3 ${className}`}>
      ★ Sample figures shown — illustrative example, not a live reading.
    </p>
  );
}

export default function Trust() {
  return (
    <>
      <PageHero
        eyebrow="responsible AI & evidence"
        title="Every alert shows its working —"
        em="and who signed it off."
        sub="ClimaSchool AI is built to be checked. Colour-coded risk with written labels, confidence scores with the evidence behind them, a human review gate before any critical message leaves the building, and a lifecycle that makes early warning to early action measurable."
        photo={photos.health}
        alt="Health workers attending to patients at a community health outreach in West Africa"
      />

      {/* ── 1 · RISK CLASSIFICATION ─────────────────────────────────── */}
      <section
        aria-labelledby="risk-scale"
        className="mx-auto max-w-7xl px-6 py-12"
      >
        <div>
          <span className="eyebrow">one scale, every hazard</span>
          <h2
            id="risk-scale"
            className="mt-2 font-display text-3xl font-semibold leading-tight md:text-4xl"
          >
            Risk classification —{" "}
            <em className="font-hand text-[1.2em] font-bold not-italic text-heat">
              four levels, always named.
            </em>
          </h2>
          <p className="mt-3 max-w-prose text-ink-2">
            Heat, flood, disease, air quality, nutrition and wellbeing all report on
            the same four-level scale, so a head teacher only ever learns one system.
            Every level carries a written name and a defined platform action —{" "}
            <strong>colour is never the only signal</strong>.
          </p>
        </div>

        <ol className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {riskLevels.map((r, i) => (
            <motion.li
              key={r.code}
              {...rise}
              transition={{ delay: i * 0.08 }}
              className={`rounded-xl3 border-2 bg-gradient-to-b p-6 shadow-soft ${r.ring} ${r.tint}`}
            >
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className={`h-4 w-4 shrink-0 rounded-full ring-2 ring-paper ${r.swatch}`}
                />
                <h3 className={`font-display text-lg font-bold ${r.text}`}>
                  {r.code} — {r.label}
                </h3>
              </div>
              <p className="mt-3 text-sm text-ink-2">{r.meaning}</p>
              <p className="mt-4 border-t border-dashed border-line pt-3">
                <span className="block font-display text-[11px] font-semibold uppercase tracking-widest text-ink-3">
                  Platform action
                </span>
                <span className="mt-1 block text-sm font-semibold text-ink">
                  {r.action}
                </span>
              </p>
            </motion.li>
          ))}
        </ol>

        {/* text-labelled scale bar */}
        <div className="mt-6 overflow-hidden rounded-full border-2 border-line">
          <div className="flex">
            {riskLevels.map((r) => (
              <span
                key={r.code}
                className={`flex-1 px-2 py-2 text-center font-display text-[11px] font-bold uppercase tracking-wider text-white ${r.swatch}`}
              >
                {r.code} · {r.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2 · CONFIDENCE & EVIDENCE ───────────────────────────────── */}
      <section
        aria-labelledby="evidence"
        className="border-y-2 border-dashed border-line-2 bg-cream-2/60 py-14"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div>
            <span className="eyebrow">show the working</span>
            <h2
              id="evidence"
              className="mt-2 font-display text-3xl font-semibold leading-tight md:text-4xl"
            >
              Alert confidence{" "}
              <em className="font-hand text-[1.2em] font-bold not-italic text-heat">
                and the evidence behind it.
              </em>
            </h2>
            <p className="mt-3 max-w-prose text-ink-2">
              No black boxes. Every alert arrives with its confidence score, the exact
              indicators that triggered it, its verification status and its data
              sources — so a health facility can judge the alert, not just obey it.
            </p>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_1fr]">
            <motion.div
              {...rise}
              className="rounded-xl3 border-2 border-line bg-paper p-6 shadow-lift"
            >
              <div className="mb-4 flex items-center gap-3">
                <Gauge className="h-5 w-5 text-heat" aria-hidden="true" />
                <h3 className="font-display text-xl font-semibold">
                  Example alert display
                </h3>
              </div>
              <dl>
                {exampleAlert.fields.map((f) => (
                  <div
                    key={f.key}
                    className="border-t border-dashed border-line py-3 first:border-0 first:pt-0"
                  >
                    <dt className="font-display text-[11px] font-semibold uppercase tracking-widest text-ink-3">
                      {f.key}
                    </dt>
                    <dd className="mt-0.5 break-words text-sm font-semibold text-ink">
                      {f.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <SampleNote className="mt-4" />
            </motion.div>

            <motion.div
              {...rise}
              transition={{ delay: 0.1 }}
              className="flex flex-col gap-4"
            >
              <div className="rounded-xl3 border-2 border-heat bg-gradient-to-b from-heat/12 to-paper p-6 shadow-soft">
                <div className="mb-3 flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-heat" aria-hidden="true" />
                  <h3 className="font-display text-xl font-semibold">
                    What ClimaSchool AI will not say
                  </h3>
                </div>
                <p className="rounded-xl2 border-2 border-dashed border-line-2 bg-paper p-4 text-ink-2 line-through decoration-heat decoration-2">
                  “{alertFraming.never}”
                </p>
                <p className="mt-4 font-display text-[11px] font-semibold uppercase tracking-widest text-ink-3">
                  What it says instead
                </p>
                <p className="mt-1 rounded-xl2 border-2 border-leaf bg-leaf/10 p-4 font-semibold text-ink">
                  “{alertFraming.always}”
                </p>
              </div>
              <p className="text-sm text-ink-2">
                ClimaSchool AI is a risk-signalling tool, not a diagnostic authority.
                It flags elevated risk from climate and contextual indicators and hands
                the clinical judgement to the people qualified to make it — Ghana Health
                Service staff, facility clinicians and community health workers.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 3 · AI SAFETY GATE ──────────────────────────────────────── */}
      <section aria-labelledby="safety-gate" className="mx-auto max-w-7xl px-6 py-14">
        <SectionHead
          eyebrow="nothing ships unchecked"
          title="The AI Safety Gate —"
          em="five checks before a message leaves."
          sub="Before any AI-generated health message is distributed publicly it passes through a structured safety gate. ORANGE and RED alerts cannot skip the human."
        />

        <ol className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {safetyGates.map((g, i) => {
            const human = g.gate === "Human review";
            return (
              <motion.li
                key={g.gate}
                {...rise}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -4 }}
                className={`relative rounded-xl3 border-2 p-6 shadow-soft ${
                  human
                    ? "border-heat bg-gradient-to-b from-heat/15 to-paper shadow-lift"
                    : "border-line bg-paper"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 font-display text-xs font-bold ${
                      human ? "bg-heat text-white" : "bg-cream-2 text-ink-2"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {human && (
                    <UserCheck className="h-4 w-4 text-heat" aria-hidden="true" />
                  )}
                </div>
                <h3 className="mt-3 font-display text-lg font-semibold">{g.gate}</h3>
                <p className="mt-2 text-sm text-ink-2">{g.fn}</p>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-3 top-1/2 hidden h-2 w-2 -translate-y-1/2 rotate-45 border-r-2 border-t-2 border-line-2 lg:block"
                />
              </motion.li>
            );
          })}
        </ol>
      </section>

      {/* ── 4 · ALERT LIFECYCLE ─────────────────────────────────────── */}
      <section
        aria-labelledby="lifecycle"
        className="border-y-2 border-dashed border-line-2 bg-cream-2/60 py-14"
      >
        <div className="mx-auto max-w-7xl px-6">
          <SectionHead
            eyebrow="early warning to early action"
            title="Every alert is tracked"
            em="from created to closed."
            sub="Seven stages, each timestamped. This is what turns a warning into a measurable chain of action — and what lets a partner audit whether the warning actually changed anything for a child."
          />

          <ol className="mt-10 space-y-3">
            {alertLifecycle.map((s, i) => (
              <motion.li
                key={s.stage}
                {...rise}
                transition={{ delay: i * 0.05 }}
                className="flex flex-col gap-2 rounded-xl3 border-2 border-line bg-paper p-5 shadow-soft transition hover:border-heat sm:flex-row sm:items-center sm:gap-5"
              >
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-heat font-display text-sm font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="font-display text-lg font-semibold sm:w-52 sm:shrink-0">
                  {s.stage}
                </h3>
                <p className="text-sm text-ink-2">{s.what}</p>
              </motion.li>
            ))}
          </ol>

          <p className="mt-6 inline-flex items-center gap-2 font-display text-sm font-semibold text-ink-2">
            <Repeat className="h-4 w-4 text-heat" aria-hidden="true" />
            Outcome data from every closed alert feeds back into the model.
          </p>
        </div>
      </section>

      {/* ── 5 · THREE ALERT TYPES ───────────────────────────────────── */}
      <section aria-labelledby="alert-types" className="mx-auto max-w-7xl px-6 py-14">
        <SectionHead
          eyebrow="what lands on the phone"
          title="Three alert types —"
          em="three levels of human control."
        />

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {alertTypes.map((a, i) => (
            <motion.article
              key={a.type}
              {...rise}
              transition={{ delay: i * 0.09 }}
              whileHover={{ y: -4 }}
              className={`rounded-xl3 border-2 bg-paper p-6 shadow-soft ${a.ring}`}
            >
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className={`h-4 w-4 shrink-0 rounded-full ${a.swatch}`}
                />
                <h3 className={`font-display text-lg font-bold ${a.text}`}>
                  {a.type} — {a.level}
                </h3>
              </div>
              <p className="mt-3 text-sm text-ink-2">{a.meaning}</p>
              <p className="mt-4 flex items-center gap-2 border-t border-dashed border-line pt-3">
                <BellRing className="h-4 w-4 shrink-0 text-ink-3" aria-hidden="true" />
                <span className="font-display text-sm font-semibold text-ink">
                  {a.process}
                </span>
              </p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* ── 6 · MODEL LAB + MODEL CARDS ─────────────────────────────── */}
      <section
        aria-labelledby="model-lab"
        className="border-y-2 border-dashed border-line-2 bg-cream-2/60 py-14"
      >
        <div className="mx-auto max-w-7xl px-6">
          <SectionHead
            eyebrow="how the models earn their place"
            title="The Model Lab —"
            em="train, validate, compare, deploy, monitor."
            sub="Informed by DHIS2 CHAP principles, ClimaSchool AI includes an internal Model Lab where the technical team can train, compare, evaluate and deploy different risk models — and retire the ones that underperform."
          />

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {modelLab.map((m, i) => (
              <motion.div
                key={m.fn}
                {...rise}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -4 }}
                className="rounded-xl3 border-2 border-line bg-paper p-6 shadow-soft transition hover:border-heat"
              >
                <FlaskConical className="h-5 w-5 text-heat" aria-hidden="true" />
                <h3 className="mt-3 font-display text-lg font-semibold">{m.fn}</h3>
                <p className="mt-2 text-sm text-ink-2">{m.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            {...rise}
            className="mt-6 rounded-xl3 border-2 border-heat bg-gradient-to-b from-heat/12 to-paper p-6 shadow-lift"
          >
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-heat" aria-hidden="true" />
              <h3 className="font-display text-xl font-semibold">
                Model Cards — published for every AI model
              </h3>
            </div>
            <p className="mt-2 max-w-prose text-ink-2">
              For every predictive model deployed, ClimaSchool AI publishes a Model
              Card. This is a core Responsible AI commitment, not a document produced on
              request. Each card documents:
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {modelCardItems.map((item) => (
                <li
                  key={item}
                  className="rounded-xl2 border-2 border-line bg-paper px-4 py-3 font-display text-sm font-semibold text-ink"
                >
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* ── 7 · RESPONSIBLE AI FRAMEWORK ────────────────────────────── */}
      <section aria-labelledby="rai" className="mx-auto max-w-7xl px-6 py-14">
        <SectionHead
          eyebrow="the commitments we build against"
          title="Responsible AI"
          em="and data governance."
          sub="Ten principles, each with the implementation that makes it real in the product — written down so they can be held against us."
        />

        <ol className="mt-10 grid gap-4 md:grid-cols-2">
          {raiPrinciples.map((p, i) => (
            <motion.li
              key={p.principle}
              {...rise}
              transition={{ delay: (i % 2) * 0.06 }}
              whileHover={{ y: -4 }}
              className="rounded-xl3 border-2 border-line bg-paper p-6 shadow-soft transition hover:border-heat"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream-2 font-display text-xs font-bold text-ink-2">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold">{p.principle}</h3>
                  <p className="mt-1 text-sm text-ink-2">{p.implementation}</p>
                </div>
              </div>
            </motion.li>
          ))}
        </ol>
      </section>

      {/* ── 8 · IMPACT MEASUREMENT ──────────────────────────────────── */}
      <section
        aria-labelledby="impact"
        className="border-y-2 border-dashed border-line-2 bg-cream-2/60 py-14"
      >
        <div className="mx-auto max-w-7xl px-6">
          <SectionHead
            eyebrow="what we count"
            title="Impact measurement —"
            em="children first, systems second."
            sub="Six child outcome metrics and five system performance metrics. Every one is defined before the pilot starts, so the result cannot be redefined afterwards."
          />

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="flex items-center gap-2 font-display text-xl font-semibold">
                <ScrollText className="h-5 w-5 text-heat" aria-hidden="true" />
                Child outcome metrics
              </h3>
              <ul className="mt-4 space-y-3">
                {childOutcomeMetrics.map((m, i) => (
                  <motion.li
                    key={m.metric}
                    {...rise}
                    transition={{ delay: i * 0.04 }}
                    className="rounded-xl3 border-2 border-line bg-paper p-5 shadow-soft"
                  >
                    <b className="block font-display font-bold">{m.metric}</b>
                    <span className="mt-0.5 block text-sm text-ink-2">{m.how}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="flex items-center gap-2 font-display text-xl font-semibold">
                <BarChart3 className="h-5 w-5 text-heat" aria-hidden="true" />
                System performance metrics
              </h3>
              <ul className="mt-4 space-y-3">
                {systemMetrics.map((m, i) => (
                  <motion.li
                    key={m.metric}
                    {...rise}
                    transition={{ delay: i * 0.04 }}
                    className="rounded-xl3 border-2 border-line bg-paper p-5 shadow-soft"
                  >
                    <b className="block font-display font-bold">{m.metric}</b>
                    <span className="mt-0.5 block text-sm text-ink-2">{m.how}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>

          {/* signature metric */}
          <motion.div
            {...rise}
            className="mt-10 rounded-xl4 border-2 border-heat bg-gradient-to-b from-heat/15 to-paper p-8 shadow-big md:p-10"
          >
            <div className="text-center">
              <span className="eyebrow">signature metric</span>
              <h3 className="mt-2 font-display text-3xl font-semibold leading-tight md:text-5xl">
                <em className="font-hand text-[1.15em] font-bold not-italic text-heat">
                  {minutesOfProtection.name}
                </em>
              </h3>
              <p className="mx-auto mt-3 max-w-prose text-ink-2">
                {minutesOfProtection.definition}
              </p>
            </div>

            <div className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-2">
              <div className="rounded-xl3 border-2 border-line bg-paper p-6 text-center shadow-soft">
                <Timer className="mx-auto h-5 w-5 text-heat" aria-hidden="true" />
                <b className="mt-2 block font-display text-4xl font-bold text-heat">
                  {minutesOfProtection.example.children}
                </b>
                <span className="mt-1 block text-sm text-ink-2">
                  {minutesOfProtection.example.childrenLabel}
                </span>
              </div>
              <div className="rounded-xl3 border-2 border-line bg-paper p-6 text-center shadow-soft">
                <ShieldCheck className="mx-auto h-5 w-5 text-heat" aria-hidden="true" />
                <b className="mt-2 block font-display text-4xl font-bold text-heat">
                  {minutesOfProtection.example.lead}
                </b>
                <span className="mt-1 block text-sm text-ink-2">
                  {minutesOfProtection.example.leadLabel}
                </span>
              </div>
            </div>

            <p className="mx-auto mt-6 max-w-prose text-center font-display font-semibold text-ink">
              {minutesOfProtection.why}
            </p>
            <SampleNote className="mt-3 text-center" />
          </motion.div>
        </div>
      </section>

      {/* ── 9 · DIGITAL PUBLIC GOOD READINESS ───────────────────────── */}
      <section aria-labelledby="dpg" className="mx-auto max-w-7xl px-6 py-14">
        <SectionHead
          eyebrow="open from day one"
          title="Digital Public Good readiness —"
          em="an outcome, not an afterthought."
          sub="ClimaSchool AI is designed from the start to qualify as a Digital Public Good. Eight commitments, each with something published at the end of it."
        />

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {dpgCommitments.map((c, i) => (
            <motion.div
              key={c.component}
              {...rise}
              transition={{ delay: (i % 4) * 0.07 }}
              whileHover={{ y: -4 }}
              className="rounded-xl3 border-2 border-line bg-paper p-6 shadow-soft transition hover:border-heat"
            >
              <Globe2 className="h-5 w-5 text-heat" aria-hidden="true" />
              <h3 className="mt-3 font-display text-lg font-semibold">{c.component}</h3>
              <p className="mt-2 text-sm text-ink-2">{c.commitment}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CLOSE ───────────────────────────────────────────────────── */}
      <section className="border-t-2 border-dashed border-line-2 bg-gradient-to-b from-heat/10 to-cream py-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <span className="eyebrow">accountability</span>
          <h2 className="mx-auto mt-2 max-w-[24ch] font-display text-4xl font-semibold leading-tight md:text-5xl">
            Ask us for the Model Card, the governance framework, or the alert log —{" "}
            <em className="font-hand text-[1.15em] font-bold not-italic text-heat">
              that is the point of publishing them.
            </em>
          </h2>
          <p className="mx-auto mt-4 max-w-prose text-ink-2">
            ClimaSchool AI is led by Eco-lution Consults in Ghana, working with district
            education offices, community health workers, health facilities and parents.
            If you would like to review our Responsible AI documentation, audit a model,
            or bring the platform to your district — get in touch.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              className="btn-primary"
              href="mailto:ecolutionghana@gmail.com?subject=ClimaSchool%20AI%20·%20responsible%20AI%20review"
            >
              Request the documentation <ArrowUpRight className="h-4 w-4" />
            </a>
            <Link to="/about" className="btn-ghost">
              How the platform works
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
