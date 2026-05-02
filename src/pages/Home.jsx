import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, Sun, Wind, Droplets, MessageSquare, GraduationCap, Stethoscope, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { photos } from "../lib/photos";

export default function Home() {
  useEffect(() => { document.body.dataset.season = "dryheat"; }, []);

  return (
    <>
      <Hero />
      <Audiences />
      <MidCTA />
    </>
  );
}

function Hero() {
  const [temp, setTemp]   = useCount(39);
  const [alerts, setAl]   = useCount(147);
  const [sms, setSMS]     = useCount(14902, 1800);
  const days = Math.max(0, Math.ceil((new Date(Date.UTC(2026, 4, 17, 9)) - Date.now()) / 86400000));

  return (
    <section className="relative isolate overflow-hidden text-white">
      <div className="absolute inset-0 -z-10">
        <img src={photos.hero} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/55 to-heat/40" />
      </div>

      <div className="mx-auto max-w-7xl px-6 pt-16 pb-10 md:pt-24 md:pb-12">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 bg-white/10 px-4 py-1.5 font-display text-xs font-medium backdrop-blur"
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-sun shadow-[0_0_10px_#ffc94d]" />
          UNICEF Venture Fund · Climate Ventures Cohort 2026
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="mt-5 max-w-[16ch] font-display text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl"
        >
          The weather forecast,
          <br />
          <em className="font-hand text-[1.15em] font-bold not-italic text-sun -rotate-2 inline-block">
            but for child health.
          </em>
        </motion.h1>

        <p className="mt-6 max-w-prose text-lg text-white/90">
          ClimaSchool AI turns live climate, air-quality and disease-surveillance feeds
          into hyperlocal action — for head teachers, parents and community health workers
          across <b>12 pilot schools in Ghana</b>, in four languages.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/engine" className="btn-primary">
            Open the Engine Room <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link to="/seasons" className="btn-ghost !text-ink">Explore the seasons</Link>
        </div>

        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Tile colorClass="from-heat/30 to-paper border-heat" labelColor="text-heat" label="Live · Greater Accra" pulse="bg-leaf" big={`${temp}°`}>
            <div className="mt-1 h-3 overflow-hidden rounded-full bg-cream-2 ring-1 ring-line">
              <div className="h-full rounded-full bg-gradient-to-r from-leaf via-sun to-heat" style={{ width: "88%" }} />
            </div>
            <p className="text-xs text-ink-2">Schedule modification triggered · 4 schools</p>
          </Tile>
          <Tile colorClass="from-sun/30 to-paper border-sun" labelColor="text-ink-2" label="Active alerts · last 24h" pulse="bg-heat" big={alerts}>
            <ul className="space-y-1 text-xs text-ink-2">
              <li><span className="mr-1.5 rounded-full bg-heat/15 px-2 py-0.5 font-display font-bold text-heat">heat</span> Greater Accra</li>
              <li><span className="mr-1.5 rounded-full bg-sun/20 px-2 py-0.5 font-display font-bold text-[#b58400]">aqi</span> Kumasi · indoor PE</li>
              <li><span className="mr-1.5 rounded-full bg-sky/20 px-2 py-0.5 font-display font-bold text-[#2d6cd6]">chw</span> Tamale visits</li>
            </ul>
          </Tile>
          <Tile colorClass="from-sky/30 to-paper border-sky" labelColor="text-ink-2" label="Parent SMS dispatched" big={sms.toLocaleString()}>
            <div className="flex flex-wrap gap-1.5">
              {["EN","TW","HA","GA"].map(l => (
                <span key={l} className="rounded-full border-2 border-line-2 bg-paper px-2.5 py-1 font-display text-[11px] font-semibold text-ink-2">{l}</span>
              ))}
            </div>
            <p className="text-xs text-ink-2">English · Twi · Hausa · Ga</p>
          </Tile>
          <Tile colorClass="from-leaf/30 to-paper border-leaf" labelColor="text-ink-2" label="UNICEF submission" big={`${days}`} sup="days">
            <p className="text-xs text-ink-2">17 May 2026 · USD 100k · equity-free</p>
          </Tile>
        </div>
      </div>
    </section>
  );
}

function Tile({ colorClass, labelColor, label, pulse, big, sup, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4 }}
      className={`flex min-h-[210px] flex-col gap-3 rounded-xl3 border-2 bg-gradient-to-br p-5 text-ink shadow-lift ${colorClass}`}
    >
      <div className="flex items-center justify-between">
        <span className={`font-display text-[12px] font-semibold ${labelColor}`}>{label}</span>
        {pulse && <span className={`h-2.5 w-2.5 animate-pulse rounded-full ${pulse} shadow-[0_0_10px_currentColor]`} />}
      </div>
      <div className="font-display text-5xl font-semibold leading-none tracking-tight text-heat">
        {big}
        {sup && <sup className="ml-1 align-top text-base font-medium text-ink-2">{sup}</sup>}
      </div>
      {children}
    </motion.div>
  );
}

function Audiences() {
  const items = [
    { Icon: GraduationCap, color: "bg-heat", tag: "For schools",   title: "Head teachers & nurses",   desc: "Operational checklists for heat, dust, flood, malaria. Schedule changes triggered automatically.", photo: photos.classroom },
    { Icon: Users,         color: "bg-sky",  tag: "For families",  title: "Parents & guardians",       desc: "Action-led SMS in English, Twi, Hausa, Ga — what to feed, what to watch for, when to seek care.",   photo: photos.community },
    { Icon: Stethoscope,   color: "bg-leaf", tag: "For community", title: "CHWs & district health",    desc: "Field tasks and feedback loop — bednet checks, RDTs, ORS dispatch, surveillance escalation.",       photo: photos.school }
  ];
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="mx-auto max-w-prose text-center">
        <span className="eyebrow">what we do</span>
        <h2 className="mt-2 font-display text-4xl font-semibold leading-tight md:text-5xl">
          Three audiences. <em className="font-hand text-[1.2em] font-bold not-italic text-heat">One trusted advisory.</em>
        </h2>
        <p className="mt-3 text-ink-2">
          Five live data feeds in. One AI engine. Three communities receiving the
          action they can take, in the language they speak — before risk becomes incidence.
        </p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {items.map((it) => (
          <motion.div
            key={it.title}
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 220, damping: 20 }}
            className="group overflow-hidden rounded-xl4 border-2 border-line bg-paper shadow-soft transition hover:border-heat hover:shadow-big"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <img src={it.photo} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              <span className={`absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full ${it.color} px-3 py-1.5 font-display text-[11px] font-semibold text-white shadow-soft`}>
                <it.Icon className="h-3.5 w-3.5" />
                {it.tag}
              </span>
            </div>
            <div className="p-6">
              <h3 className="font-display text-xl font-semibold">{it.title}</h3>
              <p className="mt-2 text-sm text-ink-2">{it.desc}</p>
              <Link to="/advisory" className="mt-3 inline-flex items-center gap-1 font-display text-sm font-semibold text-heat">
                Open advisory <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function MidCTA() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-16">
      <div className="grid items-center gap-10 rounded-xl4 border-2 border-line bg-paper p-8 shadow-lift md:grid-cols-[1.1fr_1fr] md:p-12">
        <div>
          <span className="eyebrow">try it now</span>
          <h2 className="mt-2 font-display text-3xl font-semibold leading-tight md:text-4xl">
            Drag in a CSV. Move a slider.{" "}
            <em className="font-hand text-[1.2em] font-bold not-italic text-heat">Watch the advisory rewrite itself.</em>
          </h2>
          <p className="mt-3 text-ink-2">
            The Engine Room is the live operations console — every input you change
            shows how the AI re-classifies the day, who gets alerted, and what the SMS will say.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/engine" className="btn-primary">
              Open the Engine Room <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link to="/seasons" className="btn-ghost">Browse seasons</Link>
          </div>
        </div>
        <div className="relative aspect-square">
          <span className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-heat" />
          <span className="absolute -left-4 -bottom-4 h-16 w-16 rounded-full bg-sun" />
          <img src={photos.child} alt="" className="relative z-10 h-full w-full rounded-xl4 object-cover shadow-big" />
        </div>
      </div>
    </section>
  );
}

function useCount(end, duration = 1500) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const t0 = performance.now();
    let raf;
    const step = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(Math.round(end * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [end, duration]);
  return [v, setV];
}
