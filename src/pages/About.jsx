import PageHero from "../components/PageHero.jsx";
import { photos } from "../lib/photos";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, Database, Cpu, Send } from "lucide-react";

const flow = [
  { num: "01", Icon: Database, title: "Live inputs", items: [
    ["Ghana Met Agency", "weather + air quality"],
    ["ERA5 satellite", "climate reanalysis"],
    ["Ghana Health Service", "district disease surveillance"],
    ["WHO AQI", "dust & particulate index"],
    ["GES schools DB", "locations + enrolment"]
  ]},
  { num: "02", Icon: Cpu, title: "AI engine", items: [
    ["Season classifier", "4-season tagging by district"],
    ["Risk scorer", "per-school threshold logic"],
    ["Advisory composer", "nutrition + WASH + parent SMS"],
    ["Dispatcher", "SMS · WhatsApp · dashboard · email"]
  ], core: true },
  { num: "03", Icon: Send, title: "Audiences", items: [
    ["Head teachers + nurses", "operational checklists"],
    ["Parents + guardians", "action-led SMS, 4 languages"],
    ["CHWs + district health", "field tasks + feedback loop"],
    ["Feeding caterers", "seasonal sourcing menus"]
  ]}
];

const stack = [
  ["Backend",   "Python · FastAPI",      "Async ingest, threshold engine, advisory composer."],
  ["Frontend",  "React · Vite",          "School dashboard, district overview, CHW console."],
  ["Storage",   "PostgreSQL · PostGIS",  "Schools, districts, time-series risk scores."],
  ["Comms",     "Twilio · WhatsApp · USSD", "SMS-first, USSD-compatible for low-end phones."],
  ["Languages", "EN · TW · HA · GA",     "Set per parent at school registration."],
  ["Licence",   "MIT · CC-BY 4.0",       "Software permissive · advisory shareable with attribution."]
];

export default function About() {
  return (
    <>
      <PageHero
        eyebrow="about ClimaSchool AI"
        title="From satellite to schoolyard"
        em="in under 60 seconds."
        sub="Five live feeds in. One AI engine. Three audiences out — each receiving the action they can take, in the language they speak, before risk becomes incidence."
        photo={photos.school}
      />

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-4 lg:grid-cols-3">
          {flow.map((c, i) => (
            <motion.div
              key={c.num}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className={`relative rounded-xl3 border-2 p-6 shadow-soft ${
                c.core ? "border-heat bg-gradient-to-b from-heat/15 to-paper shadow-lift" : "border-line bg-paper"
              }`}
            >
              {c.core && (
                <span className="pointer-events-none absolute -inset-1 -z-10 rounded-xl3 border-[3px] border-heat opacity-0 [animation:corepulse_2.4s_ease-out_infinite]" />
              )}
              <div className="mb-4 flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 font-display text-xs font-bold ${c.core ? "bg-heat text-white" : "bg-cream-2 text-ink-2"}`}>{c.num}</span>
                <c.Icon className={`h-5 w-5 ${c.core ? "text-heat" : "text-ink-2"}`} />
                <h3 className="font-display text-xl font-semibold">{c.title}</h3>
              </div>
              <ul>
                {c.items.map(([t, sub]) => (
                  <li key={t} className="border-t border-dashed border-line py-3 first:border-0 first:pt-0">
                    <b className="block font-bold">{t}</b>
                    <span className="text-sm text-ink-2">{sub}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="text-center">
          <span className="eyebrow">open by default</span>
          <h2 className="mt-2 font-display text-4xl font-semibold leading-tight md:text-5xl">
            Open-source. Open-data. <em className="font-hand text-[1.2em] font-bold not-italic text-heat">Open for the region.</em>
          </h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stack.map(([cap, name, desc]) => (
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

      <section className="border-t-2 border-dashed border-line-2 bg-gradient-to-b from-heat/10 to-cream py-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <span className="eyebrow">partnership</span>
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
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a className="btn-primary" href="mailto:info@uniyia.org?subject=ClimaSchool%20AI%20·%20partnership">
              Get in touch <ArrowUpRight className="h-4 w-4" />
            </a>
            <Link to="/advisory" className="btn-ghost">Browse the advisory</Link>
          </div>

          <ul className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-3 md:grid-cols-4">
            {[
              ["Pilot",     "12 schools",      "3 regions of Ghana"],
              ["Languages", "EN · TW · HA · GA","set per parent"],
              ["Channels",  "SMS · WhatsApp · USSD","low-end phone friendly"],
              ["Licence",   "Open source",     "MIT · CC-BY 4.0"]
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
