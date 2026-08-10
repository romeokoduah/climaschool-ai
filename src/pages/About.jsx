import PageHero from "../components/PageHero.jsx";
import EnquiryForm from "../components/EnquiryForm.jsx";
import { photos } from "../lib/photos";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, Check, X, MapPin, Users, Handshake } from "lucide-react";
import {
  positioningNot,
  positioningIs,
  principle,
  pilotZones,
  pilotActors,
  team,
  partners,
  openness
} from "../data/org";

const zoneAccent = {
  sky:  { border: "hover:border-sky",  dot: "bg-sky",  chip: "bg-sky/10 text-ink",  num: "bg-sky text-white" },
  heat: { border: "hover:border-heat", dot: "bg-heat", chip: "bg-heat/10 text-ink", num: "bg-heat text-white" }
};

export default function About() {
  return (
    <>
      <PageHero
        eyebrow="about ClimaSchool AI"
        title="The intelligence layer"
        em="around the child."
        sub="An open-source, child-centred platform that turns climate, environmental, school, community and health information into predictive risk insights, early warnings and role-specific actions — protecting children from climate-sensitive health risks."
        photo={photos.school}
        alt="Children gathered in the schoolyard of a rural African village school"
      />

      {/* ── What it is ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:items-start">
          <div>
            <span className="eyebrow">what it is</span>
            <h2 className="mt-2 font-display text-4xl font-semibold leading-tight md:text-5xl">
              One platform connecting{" "}
              <em className="font-hand text-[1.15em] font-bold not-italic text-heat">
                the whole ecosystem around a child.
              </em>
            </h2>
            <p className="mt-5 max-w-prose text-lg text-ink-2">
              ClimaSchool AI connects schools, families, community health workers,
              health facilities and authorised institutional stakeholders — without
              requiring direct integration into government information systems.
            </p>
            <p className="mt-4 max-w-prose text-ink-2">
              It operates as an independent, interoperable decision-support layer.
              Rather than replacing existing health or education systems, it
              complements them with climate-health intelligence, early warning,
              preparedness coordination, early action support and impact monitoring.
            </p>
            <p className="mt-4 text-sm font-semibold text-ink-3">
              Built by Eco-lution Consults, Ghana.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-xl3 border-2 border-line bg-paper p-6 shadow-soft"
          >
            <span className="font-display text-xs font-semibold uppercase tracking-widest text-ink-3">
              Core principle
            </span>
            <ol className="mt-4">
              {principle.map((step, i) => (
                <li
                  key={step}
                  className="flex items-center gap-3 border-t border-dashed border-line py-3 first:border-0 first:pt-0"
                >
                  <span className="rounded-full bg-cream-2 px-3 py-1 font-display text-xs font-bold text-ink-2">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <b className="font-display text-lg font-semibold">{step}</b>
                </li>
              ))}
            </ol>
          </motion.div>
        </div>
      </section>

      {/* ── Positioning: is not / is ───────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="text-center">
          <span className="eyebrow">system positioning</span>
          <h2 className="mx-auto mt-2 max-w-[24ch] font-display text-4xl font-semibold leading-tight md:text-5xl">
            Being precise about what this is —{" "}
            <em className="font-hand text-[1.15em] font-bold not-italic text-heat">and what it is not.</em>
          </h2>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-xl3 border-2 border-line-2 bg-cream-2 p-7 shadow-soft"
          >
            <div className="mb-5 flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-ink-3/20 text-ink-2">
                <X className="h-5 w-5" />
              </span>
              <h3 className="font-display text-2xl font-semibold text-ink-2">ClimaSchool is not</h3>
            </div>
            <ul>
              {positioningNot.map((t) => (
                <li
                  key={t}
                  className="flex items-start gap-3 border-t border-dashed border-line-2 py-3 first:border-0 first:pt-0"
                >
                  <X className="mt-1 h-4 w-4 shrink-0 text-ink-3" aria-hidden="true" />
                  <span className="text-ink-2 line-through decoration-ink-3/40">{t}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -4 }}
            className="relative rounded-xl3 border-2 border-heat bg-gradient-to-b from-heat/15 to-paper p-7 shadow-lift"
          >
            <span className="pointer-events-none absolute -inset-1 -z-10 rounded-xl3 border-[3px] border-heat opacity-0 [animation:corepulse_2.4s_ease-out_infinite]" />
            <div className="mb-5 flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-heat text-white">
                <Check className="h-5 w-5" />
              </span>
              <h3 className="font-display text-2xl font-semibold">ClimaSchool is</h3>
            </div>
            <ul>
              {positioningIs.map((t) => (
                <li
                  key={t}
                  className="flex items-start gap-3 border-t border-dashed border-line py-3 first:border-0 first:pt-0"
                >
                  <Check className="mt-1 h-4 w-4 shrink-0 text-heat" aria-hidden="true" />
                  <span className="font-semibold text-ink">{t}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* ── Pilot ecosystem ────────────────────────────────────────── */}
      <section className="border-y-2 border-dashed border-line-2 bg-cream py-14">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <span className="eyebrow">pilot ecosystem</span>
            <h2 className="mx-auto mt-2 max-w-[26ch] font-display text-4xl font-semibold leading-tight md:text-5xl">
              Not a school deployment — a{" "}
              <em className="font-hand text-[1.15em] font-bold not-italic text-heat">
                complete child-protective ecosystem.
              </em>
            </h2>
            <p className="mx-auto mt-4 max-w-prose text-ink-2">
              Two climate-vulnerable zones. Two confirmed primary schools — one in each
              zone — surrounded by the families, health workers, facilities and district
              institutions that turn a warning into an action.
            </p>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {pilotZones.map((z, i) => {
              const a = zoneAccent[z.accent];
              return (
                <motion.div
                  key={z.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4 }}
                  className={`rounded-xl3 border-2 border-line bg-paper p-6 shadow-soft transition ${a.border}`}
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`rounded-full px-3 py-1 font-display text-xs font-bold ${a.num}`}>
                      {z.label}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-ink-3">
                      <MapPin className="h-4 w-4" aria-hidden="true" />
                      {z.region}
                    </span>
                  </div>
                  <h3 className="mt-3 font-display text-2xl font-semibold">{z.name}</h3>

                  <span className="mt-5 block font-display text-xs font-semibold uppercase tracking-widest text-ink-3">
                    Primary hazards
                  </span>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {z.hazards.map((h) => (
                      <li
                        key={h}
                        className={`rounded-full px-3 py-1 font-display text-sm font-semibold ${a.chip}`}
                      >
                        {h}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 flex items-center gap-2 border-t border-dashed border-line pt-4">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${a.dot}`} aria-hidden="true" />
                    <b className="font-display font-bold">{z.schools}</b>
                  </div>
                  <p className="mt-2 text-sm text-ink-2">{z.tests}</p>
                </motion.div>
              );
            })}
          </div>

          <h3 className="mt-12 flex items-center gap-2 font-display text-2xl font-semibold">
            <Users className="h-5 w-5 text-heat" aria-hidden="true" />
            Pilot actors in each zone
          </h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pilotActors.map(({ actor, scope }) => (
              <motion.div
                key={actor}
                whileHover={{ y: -4 }}
                className="rounded-xl3 border-2 border-line bg-paper p-6 shadow-soft transition hover:border-heat"
              >
                <span className="font-display text-xs font-semibold uppercase tracking-widest text-ink-3">
                  {actor}
                </span>
                <p className="mt-2 text-sm text-ink-2">{scope}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ───────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="text-center">
          <span className="eyebrow">the team</span>
          <h2 className="mx-auto mt-2 max-w-[24ch] font-display text-4xl font-semibold leading-tight md:text-5xl">
            Engineers, clinicians and community organisers —{" "}
            <em className="font-hand text-[1.15em] font-bold not-italic text-heat">all based in Ghana.</em>
          </h2>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {team.map((m, i) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 3) * 0.08 }}
              whileHover={{ y: -4 }}
              className="rounded-xl3 border-2 border-line bg-paper p-6 shadow-soft transition hover:border-heat"
            >
              <span
                aria-hidden="true"
                className="grid h-11 w-11 place-items-center rounded-full bg-cream-2 font-display text-lg font-bold text-heat"
              >
                {m.name.replace(/^Dr\.\s*/, "").charAt(0)}
              </span>
              <h3 className="mt-3 font-display text-xl font-semibold">{m.name}</h3>
              <span className="font-display text-sm font-semibold text-heat">{m.role}</span>
              <p className="mt-3 border-t border-dashed border-line pt-3 text-sm text-ink-2">
                {m.profile}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Partners ───────────────────────────────────────────────── */}
      <section className="border-t-2 border-dashed border-line-2 bg-cream py-14">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <span className="eyebrow">partners</span>
            <h2 className="mx-auto mt-2 max-w-[24ch] font-display text-4xl font-semibold leading-tight md:text-5xl">
              Scientific, clinical and community oversight —{" "}
              <em className="font-hand text-[1.15em] font-bold not-italic text-heat">from the start.</em>
            </h2>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {partners.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 3) * 0.08 }}
                whileHover={{ y: -4 }}
                className="rounded-xl3 border-2 border-line bg-paper p-6 shadow-soft transition hover:border-heat"
              >
                <Handshake className="h-5 w-5 text-ink-3" aria-hidden="true" />
                <h3 className="mt-3 font-display text-xl font-semibold">{p.name}</h3>
                <span className="font-display text-sm font-semibold text-ink-3">{p.detail}</span>
                <p className="mt-3 border-t border-dashed border-line pt-3 text-sm text-ink-2">{p.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Open by default ────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="text-center">
          <span className="eyebrow">open by default</span>
          <h2 className="mt-2 font-display text-4xl font-semibold leading-tight md:text-5xl">
            Open-source. Open-data.{" "}
            <em className="font-hand text-[1.2em] font-bold not-italic text-heat">Open for the region.</em>
          </h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {openness.map(([cap, name, desc]) => (
            <motion.div
              key={cap}
              whileHover={{ y: -4 }}
              className="rounded-xl3 border-2 border-line bg-paper p-6 shadow-soft transition hover:border-heat"
            >
              <span className="font-display text-xs font-semibold uppercase tracking-widest text-ink-3">{cap}</span>
              <h4 className="mt-1 font-display text-xl font-semibold">{name}</h4>
              <p className="mt-1 text-sm text-ink-2">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Contact ────────────────────────────────────────────────── */}
      <section className="border-t-2 border-dashed border-line-2 bg-gradient-to-b from-heat/10 to-cream py-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <span className="eyebrow">get in touch</span>
          <h2 className="mx-auto mt-2 max-w-[22ch] font-display text-4xl font-semibold leading-tight md:text-5xl">
            Built openly with Ghana's schools, families and health workers —{" "}
            <em className="font-hand text-[1.15em] font-bold not-italic text-heat">and ready for the region next.</em>
          </h2>
          <p className="mx-auto mt-4 max-w-prose text-ink-2">
            We work with district education offices, school feeding caterers,
            community health workers and parents to make every advisory locally
            grounded. If you'd like to bring ClimaSchool AI to your district,
            integrate a data feed, or contribute to the open advisory content —
            get in touch.
          </p>
          <div className="mx-auto mt-8 max-w-2xl">
            <EnquiryForm />
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a className="btn-ghost" href="mailto:ecolutionghana@gmail.com?subject=ClimaSchool%20AI%20·%20partnership">
              Email us directly <ArrowUpRight className="h-4 w-4" />
            </a>
            <Link to="/advisory" className="btn-ghost">Browse the advisory</Link>
          </div>

          <ul className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-3 md:grid-cols-4">
            {[
              ["Pilot",     "2 schools",           "1 per pilot zone"],
              ["Families",  "200+ parents",        "minimum, per zone"],
              ["Channels",  "SMS · WhatsApp · USSD","low-end phone friendly"],
              ["Licence",   "Open source",         "MIT · CC-BY 4.0"]
            ].map(([cap, b, em]) => (
              <li key={cap} className="rounded-xl3 border-2 border-line bg-paper p-5 text-left shadow-soft">
                <span className="font-display text-xs font-semibold uppercase tracking-widest text-ink-3">{cap}</span>
                <b className="mt-1 block font-display text-xl font-bold text-heat">{b}</b>
                <em className="font-display text-xs font-medium not-italic text-ink-2">{em}</em>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
