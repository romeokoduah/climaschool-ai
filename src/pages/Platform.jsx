import PageHero from "../components/PageHero.jsx";
import { photos } from "../lib/photos";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Check, X, Layers } from "lucide-react";
import {
  coreDefinition,
  positioning,
  principleChain,
  products,
  openCore,
  foundationsIntro,
  foundations,
  dataFrameworkNote,
  dataCategories,
  geoLayers,
  communityInterfaces,
  channelsIntro,
  channels,
  inclusion,
  feedingIntro,
  feeding,
  observatoryIntro,
  observatoryLevels,
  observatoryCommitment,
  pilotFacts
} from "../data/platform";

/* Small shared building blocks --------------------------------------------- */

function SectionHead({ eyebrow, title, em, sub, id }) {
  return (
    <div className="text-center">
      <span className="eyebrow">{eyebrow}</span>
      <h2 id={id} className="mx-auto mt-2 max-w-[24ch] font-display text-4xl font-semibold leading-tight md:text-5xl">
        {title}{" "}
        {em && <em className="font-hand text-[1.18em] font-bold not-italic text-heat">{em}</em>}
      </h2>
      {sub && <p className="mx-auto mt-4 max-w-prose text-ink-2">{sub}</p>}
    </div>
  );
}

function RowCard({ Icon, term, desc, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      whileHover={{ y: -4 }}
      className="flex gap-4 rounded-xl3 border-2 border-line bg-paper p-5 shadow-soft transition hover:border-heat"
    >
      <span aria-hidden="true" className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream-2 text-heat">
        <Icon className="h-5 w-5" strokeWidth={2.2} />
      </span>
      <div>
        <b className="block font-display text-lg font-semibold">{term}</b>
        <p className="mt-1 text-sm text-ink-2">{desc}</p>
      </div>
    </motion.div>
  );
}

/* Page ---------------------------------------------------------------------- */

export default function Platform() {
  return (
    <>
      <PageHero
        eyebrow="the platform"
        title="Six products."
        em="One platform."
        sub="ClimaSchool AI turns climate, environmental, school, community and health information into predictive risk insight, early warning and role-specific action — for everyone standing around the child."
        photo={photos.classroom}
        alt="Schoolchildren in uniform at their desks in a West African classroom"
      />

      {/* ───────── 1 · Core definition & positioning ───────── */}
      <section className="mx-auto max-w-7xl px-6 py-12" aria-labelledby="core-heading">
        <SectionHead
          id="core-heading"
          eyebrow="core definition"
          title="An independent, interoperable"
          em="decision-support layer."
        />

        <div className="mx-auto mt-8 max-w-3xl space-y-4">
          {coreDefinition.map((p) => (
            <p key={p.slice(0, 32)} className="text-lg leading-relaxed text-ink-2">{p}</p>
          ))}
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-xl3 border-2 border-line bg-cream p-6 shadow-soft"
          >
            <h3 className="font-display text-2xl font-semibold">ClimaSchool is <em className="font-hand text-[1.2em] not-italic text-ink-2">not</em></h3>
            <ul className="mt-4">
              {positioning.isNot.map((t) => (
                <li key={t} className="flex items-start gap-3 border-t border-dashed border-line py-3 first:border-0 first:pt-0">
                  <X aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-ink-3" strokeWidth={2.6} />
                  <span className="text-ink-2">{t}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="rounded-xl3 border-2 border-heat bg-gradient-to-b from-heat/15 to-paper p-6 shadow-lift"
          >
            <h3 className="font-display text-2xl font-semibold">ClimaSchool <em className="font-hand text-[1.2em] not-italic text-heat">is</em></h3>
            <div className="mt-4 flex items-start gap-3 border-t border-dashed border-line pt-4">
              <Check aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-heat" strokeWidth={2.6} />
              <p className="text-ink-2">{positioning.is}</p>
            </div>
          </motion.div>
        </div>

        {/* Principle chain */}
        <h3 className="mt-14 text-center font-display text-2xl font-semibold">
          Core principle —{" "}
          <em className="font-hand text-[1.25em] font-bold not-italic text-heat">
            Predict → Prepare → Act → Protect → Learn
          </em>
        </h3>

        <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {principleChain.map((s, i) => (
            <motion.li
              key={s.step}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="relative rounded-xl3 border-2 border-line bg-paper p-5 shadow-soft transition hover:border-heat"
            >
              <span className="flex items-center gap-2">
                <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-heat text-white">
                  <s.Icon className="h-5 w-5" strokeWidth={2.2} />
                </span>
                <b className="font-display text-lg font-semibold">{s.step}</b>
              </span>
              <p className="mt-2 text-sm text-ink-2">{s.body}</p>
              {i < principleChain.length - 1 && (
                <ArrowRight
                  aria-hidden="true"
                  className="absolute -right-3 top-1/2 z-10 hidden h-6 w-6 -translate-y-1/2 text-line-2 lg:block"
                  strokeWidth={2.6}
                />
              )}
            </motion.li>
          ))}
        </ol>
      </section>

      {/* ───────── 2 · Six products ───────── */}
      <section className="border-y-2 border-dashed border-line-2 bg-cream py-14" aria-labelledby="products-heading">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHead
            id="products-heading"
            eyebrow="the product family"
            title="Six products."
            em="One platform."
            sub="Six integrated products built on a single open-source intelligence core."
          />

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.map((p, i) => (
              <motion.article
                key={p.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -4 }}
                className={`rounded-xl3 border-2 p-6 shadow-soft ${
                  p.core ? "border-heat bg-gradient-to-b from-heat/15 to-paper shadow-lift" : "border-line bg-paper"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className={`flex h-11 w-11 items-center justify-center rounded-full ${
                      p.core ? "bg-heat text-white" : "bg-cream-2 text-heat"
                    }`}
                  >
                    <p.Icon className="h-5 w-5" strokeWidth={2.2} />
                  </span>
                  <span className="font-display text-xs font-semibold uppercase tracking-widest text-ink-3">{p.role}</span>
                </div>
                <h3 className="mt-3 font-display text-xl font-semibold">{p.name}</h3>
                <p className="mt-2 text-sm text-ink-2">{p.fn}</p>
              </motion.article>
            ))}
          </div>

          <div className="mt-6 rounded-xl3 border-2 border-line bg-paper p-6 shadow-soft">
            <div className="flex flex-wrap items-center gap-3">
              <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-2 text-heat">
                <Layers className="h-5 w-5" strokeWidth={2.2} />
              </span>
              <h3 className="font-display text-xl font-semibold">{openCore.title}</h3>
            </div>
            <p className="mt-2 text-ink-2">{openCore.body}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {openCore.pillars.map((t) => (
                <li key={t} className="rounded-full border-2 border-line-2 bg-cream px-4 py-1.5 font-display text-sm font-semibold">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ───────── 3 · Best-practice foundations ───────── */}
      <section className="mx-auto max-w-7xl px-6 py-14" aria-labelledby="foundations-heading">
        <SectionHead
          id="foundations-heading"
          eyebrow="standing on standards"
          title="Built on international"
          em="best practice."
          sub={foundationsIntro}
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {foundations.map((f, i) => (
            <motion.article
              key={f.source}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ y: -4 }}
              className="rounded-xl3 border-2 border-line bg-paper p-6 shadow-soft transition hover:border-heat"
            >
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-2 text-heat">
                  <f.Icon className="h-5 w-5" strokeWidth={2.2} />
                </span>
                <h3 className="font-display text-xl font-semibold">{f.source}</h3>
              </div>
              <p className="mt-1 font-display text-xs font-semibold uppercase tracking-widest text-ink-3">
                Principle adopted
              </p>
              <p className="mt-1 text-sm text-ink-2">{f.principle}</p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* ───────── 4 · Data sources framework ───────── */}
      <section className="border-y-2 border-dashed border-line-2 bg-cream py-14" aria-labelledby="data-heading">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHead
            id="data-heading"
            eyebrow="data sources"
            title="Five categories of data —"
            em="no lock-in required."
            sub="The platform does not require direct integration with government systems to generate value."
          />

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {dataCategories.map((d, i) => (
              <motion.article
                key={d.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -4 }}
                className="rounded-xl3 border-2 border-line bg-paper p-6 shadow-soft transition hover:border-heat"
              >
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-cream-2 px-3 py-1 font-display text-xs font-bold text-ink-2">{d.num}</span>
                  <d.Icon aria-hidden="true" className="h-5 w-5 text-heat" strokeWidth={2.2} />
                </div>
                <h3 className="mt-3 font-display text-lg font-semibold">{d.name}</h3>
                <p className="mt-1 text-sm text-ink-2">{d.detail}</p>
              </motion.article>
            ))}

            <div className="flex items-center rounded-xl3 border-2 border-heat bg-gradient-to-b from-heat/15 to-paper p-6 shadow-lift">
              <p className="font-display text-xl font-semibold leading-snug">
                {dataFrameworkNote}
              </p>
            </div>
          </div>

          <h3 className="mt-14 text-center font-display text-2xl font-semibold">
            The <em className="font-hand text-[1.25em] font-bold not-italic text-heat">geospatial</em> data layer
          </h3>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {geoLayers.map((g, i) => (
              <RowCard key={g.layer} Icon={g.Icon} term={g.layer} desc={g.held} delay={i * 0.06} />
            ))}
          </div>
        </div>
      </section>

      {/* ───────── 5 · Reaching everyone ───────── */}
      <section className="mx-auto max-w-7xl px-6 py-14" aria-labelledby="reach-heading">
        <SectionHead
          id="reach-heading"
          eyebrow="reaching everyone"
          title="Designed for the phone"
          em="people already own."
          sub={channelsIntro}
        />

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {communityInterfaces.map((c, i) => (
            <motion.article
              key={c.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-xl3 border-2 border-line bg-cream p-6 shadow-soft"
            >
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-full bg-heat text-white">
                  <c.Icon className="h-5 w-5" strokeWidth={2.2} />
                </span>
                <h3 className="font-display text-xl font-semibold">{c.name}</h3>
              </div>
              <p className="mt-3 text-ink-2">{c.body}</p>
              <p className="mt-3 border-t border-dashed border-line-2 pt-3 text-sm text-ink-2">{c.extra}</p>
            </motion.article>
          ))}
        </div>

        <h3 className="mt-14 font-display text-2xl font-semibold">
          Low-connectivity <em className="font-hand text-[1.25em] font-bold not-italic text-heat">by design</em>
        </h3>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {channels.map((c, i) => (
            <RowCard key={c.channel} Icon={c.Icon} term={c.channel} desc={c.how} delay={i * 0.05} />
          ))}
        </div>

        <h3 className="mt-14 font-display text-2xl font-semibold">
          Disability-inclusive <em className="font-hand text-[1.25em] font-bold not-italic text-heat">design</em>
        </h3>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {inclusion.map((c, i) => (
            <RowCard key={c.feature} Icon={c.Icon} term={c.feature} desc={c.how} delay={i * 0.05} />
          ))}
        </div>
      </section>

      {/* ───────── 6 · School feeding intelligence ───────── */}
      <section className="border-y-2 border-dashed border-line-2 bg-cream py-14" aria-labelledby="feeding-heading">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHead
            id="feeding-heading"
            eyebrow="school feeding"
            title="Climate-smart feeding"
            em="intelligence."
            sub={feedingIntro}
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {feeding.map((f, i) => (
              <motion.article
                key={f.feature}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -4 }}
                className="rounded-xl3 border-2 border-line bg-paper p-6 shadow-soft transition hover:border-heat"
              >
                <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-2 text-heat">
                  <f.Icon className="h-5 w-5" strokeWidth={2.2} />
                </span>
                <h3 className="mt-3 font-display text-lg font-semibold">{f.feature}</h3>
                <p className="mt-1 text-sm text-ink-2">{f.how}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── 7 · Risk map & Observatory ───────── */}
      <section className="mx-auto max-w-7xl px-6 py-14" aria-labelledby="observatory-heading">
        <SectionHead
          id="observatory-heading"
          eyebrow="risk map"
          title="The Ghana Child Climate Risk Map"
          em="& Observatory."
          sub={observatoryIntro}
        />

        <h3 className="mt-12 text-center font-display text-2xl font-semibold">
          Four <em className="font-hand text-[1.25em] font-bold not-italic text-heat">intelligence levels</em>
        </h3>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {observatoryLevels.map((o, i) => (
            <RowCard key={o.level} Icon={o.Icon} term={o.level} desc={o.shown} delay={i * 0.06} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-6 rounded-xl3 border-2 border-heat bg-gradient-to-b from-heat/15 to-paper p-6 shadow-lift"
        >
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-full bg-heat text-white">
              <observatoryCommitment.Icon className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <h3 className="font-display text-xl font-semibold">{observatoryCommitment.title}</h3>
          </div>
          <p className="mt-2 text-ink-2">{observatoryCommitment.body}</p>
        </motion.div>
      </section>

      {/* ───────── Closing ───────── */}
      <section className="border-t-2 border-dashed border-line-2 bg-gradient-to-b from-heat/10 to-cream py-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <span className="eyebrow">where it runs</span>
          <h2 className="mx-auto mt-2 max-w-[24ch] font-display text-4xl font-semibold leading-tight md:text-5xl">
            Led by Eco-lution Consults in Ghana —{" "}
            <em className="font-hand text-[1.15em] font-bold not-italic text-heat">open for the region next.</em>
          </h2>
          <p className="mx-auto mt-4 max-w-prose text-ink-2">
            The platform is being proven with two confirmed pilot schools across two
            zones — Agbogbloshie / Korle Gonno in Greater Accra, and Tamale Metropolis
            in the Northern Region. If you would like to bring ClimaSchool AI to your
            district, contribute a data feed, or join the Observatory as an authorised
            institution, get in touch.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a className="btn-primary" href="mailto:ecolutionghana@gmail.com?subject=ClimaSchool%20AI%20%C2%B7%20platform">
              Get in touch <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <Link to="/about" className="btn-ghost">How the engine works</Link>
          </div>

          <ul className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-3 md:grid-cols-4">
            {pilotFacts.map(([cap, b, em]) => (
              <li key={cap} className="rounded-xl3 border-2 border-line bg-paper p-5 text-left shadow-soft">
                <span className="font-display text-xs font-semibold uppercase tracking-widest text-ink-3">{cap}</span>
                <b className="mt-1 block font-display text-lg font-bold text-heat">{b}</b>
                <em className="font-display text-xs font-medium not-italic text-ink-2">{em}</em>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
