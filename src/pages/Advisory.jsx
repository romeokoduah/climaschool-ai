import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { seasons, seasonOrder } from "../data/seasons";

export default function Advisory() {
  const [params, setParams] = useSearchParams();
  const initial = params.get("season") || "dryheat";
  const [key, setKey] = useState(seasons[initial] ? initial : "dryheat");
  const s = seasons[key];

  useEffect(() => { document.body.dataset.season = key; }, [key]);

  const setSeason = (k) => {
    setKey(k);
    setParams({ season: k }, { replace: true });
  };

  return (
    <div className="mx-auto max-w-7xl px-6 pt-12 pb-16">
      <div className="text-center">
        <span className="eyebrow">live advisory</span>
        <h1 className="mt-2 font-display text-4xl font-semibold leading-tight md:text-5xl">
          Today's <em className="font-hand text-[1.2em] font-bold not-italic seasoned">climate-health playbook.</em>
        </h1>
        <p className="mx-auto mt-3 max-w-prose text-ink-2">
          Switch seasons to load each playbook. Risks, foods, hydration, school + CHW actions, parent SMS, and the AI triggers behind every dispatch.
        </p>
        <div className="mt-6 inline-flex flex-wrap justify-center gap-2">
          {seasonOrder.map((k) => (
            <button
              key={k}
              onClick={() => setSeason(k)}
              className={`chip ${key === k ? "chip-active" : ""}`}
            >
              {seasons[k].title}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="mt-10 overflow-hidden rounded-xl4 border-2 border-line-2 bg-paper shadow-big"
        >
          <Topbar season={key} />
          <Hero season={s} />
          <KPIs season={s} />

          <Block letter="A" title="Disease & risk profile">
            <ol className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {s.risks.map(([t, b], i) => (
                <li key={t} className="rounded-xl3 border-2 border-line bg-paper p-5 shadow-soft transition hover:-translate-y-0.5 hover:seasoned-border">
                  <span className="font-display text-[11px] font-bold uppercase tracking-widest seasoned">RISK · {String(i + 1).padStart(2, "0")}</span>
                  <h4 className="mt-1 font-display text-lg font-bold">{t}</h4>
                  <p className="mt-1 text-sm text-ink-2">{b}</p>
                </li>
              ))}
            </ol>
          </Block>

          <Block letter="B" title="Recommended foods this season">
            <ol className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {s.foods.map(([n, why, where]) => (
                <li key={n} className="relative rounded-xl3 border-2 border-line bg-gradient-to-b seasoned-soft-bg p-5 shadow-soft">
                  <span className="absolute right-3 top-3 seasoned text-lg">★</span>
                  <h4 className="font-display text-lg font-bold">{n}</h4>
                  <p className="mt-1 text-sm text-ink-2">{why}</p>
                  <p className="mt-3 border-t border-dashed border-line-2 pt-2 font-display text-[11px] font-semibold uppercase tracking-wider text-leaf">{where}</p>
                </li>
              ))}
            </ol>
            <h5 className="mt-8 font-hand text-2xl font-bold text-ink-2">Foods to reduce or avoid</h5>
            <ul className="mt-3 grid gap-2 md:grid-cols-2">
              {s.avoid.map(([t, b]) => (
                <li key={t} className="rounded-xl2 border-2 border-[#ffb88a] bg-[#fff0e8] p-4">
                  <b className="text-[#d8541e]">{t}</b>
                  <p className="mt-0.5 text-sm text-ink-2">{b}</p>
                </li>
              ))}
            </ul>
          </Block>

          <Block letter="C" title="Hydration protocol">
            <div className="grid gap-8 md:grid-cols-[1fr_1.4fr]">
              <div>
                <span className="font-display text-xs font-semibold uppercase tracking-widest text-ink-3">Best sources</span>
                <ul className="mt-2 space-y-1.5">
                  {s.bestSources.map((t) => (
                    <li key={t} className="border-b border-dashed border-line py-2 text-base">💧 {t}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="font-display text-xs font-semibold uppercase tracking-widest text-ink-3">Oral rehydration salts</span>
                <p className="mt-2 text-base text-ink-2">{s.ors}</p>
              </div>
            </div>
          </Block>

          <Block twoCol>
            <Inner letter="D" title="School & WASH actions" items={s.school} />
            <Inner letter="E" title="CHW & health-post actions" items={s.chw} />
          </Block>

          <Block letter="F" title="Parent SMS — what we're sending today">
            <div className="grid items-start gap-8 md:grid-cols-[290px_1fr]">
              <Phone msgs={s.sms} />
              <ol className="flex flex-col gap-2">
                {s.parent.map(([t, b], i) => (
                  <li key={t} className="grid grid-cols-[36px_1fr] gap-3 rounded-xl3 border-2 border-line bg-paper p-4 shadow-soft">
                    <span className="font-display text-sm font-bold seasoned">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <b className="font-bold">{t}</b>
                      <p className="text-sm text-ink-2">{b}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Block>

          <Block letter="G" title="AI triggers & automated dispatch">
            <div className="overflow-hidden rounded-xl3 border-2 border-line">
              <table className="w-full text-sm">
                <thead className="bg-cream-2">
                  <tr>
                    <th className="border-b-2 border-dashed border-line px-5 py-3 text-left font-display text-xs font-semibold uppercase tracking-wider">Threshold</th>
                    <th className="border-b-2 border-dashed border-line px-5 py-3 text-left font-display text-xs font-semibold uppercase tracking-wider">Automated platform action</th>
                  </tr>
                </thead>
                <tbody>
                  {s.triggers.map(([t, a], i) => (
                    <tr key={t} className={i % 2 ? "bg-cream-2/50" : ""}>
                      <td className="border-t border-dashed border-line px-5 py-4 align-top font-display font-semibold seasoned">{t}</td>
                      <td className="border-t border-dashed border-line px-5 py-4 align-top text-ink-2">{a}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Block>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Topbar({ season }) {
  return (
    <div className="flex items-center gap-2 border-b-2 border-dashed border-line bg-cream-2 px-6 py-3 font-display text-xs font-medium text-ink-2">
      <span className="h-3 w-3 rounded-full bg-[#ff8470] ring-2 ring-black/5" />
      <span className="h-3 w-3 rounded-full bg-[#ffd060] ring-2 ring-black/5" />
      <span className="h-3 w-3 rounded-full bg-[#6fd48a] ring-2 ring-black/5" />
      <span className="ml-3 font-semibold">climaschool · live · advisory · {season}</span>
      <span className="ml-auto font-hand text-base text-ink-3">/ghana/{season}</span>
    </div>
  );
}

function Hero({ season }) {
  return (
    <div className="grid gap-6 border-b-2 border-dashed border-line p-8 md:grid-cols-[1fr_1.1fr]">
      <div>
        <span className="eyebrow">active advisory</span>
        <h2 className="mt-1 font-display text-5xl font-semibold tracking-tight seasoned md:text-6xl">{season.title}</h2>
        <p className="mt-1 font-hand text-2xl font-bold text-ink-2">{season.months}</p>
      </div>
      <div className="self-end rounded-xl3 border-2 seasoned-border bg-paper p-5 leading-relaxed shadow-soft">
        {season.alert}
      </div>
    </div>
  );
}

function KPIs({ season }) {
  const cells = [
    { label: "Hydration alert",    value: season.hydroLevel, bar: season.hydroPct },
    { label: "Daily fluid target", value: season.fluid,      sub: "per child · age 5–12", big: true },
    { label: "School action level",value: season.schoolLevel, sub: season.schoolLevelSub },
    { label: "Critical drug stock",value: season.drugStock,   sub: season.drugStockSub }
  ];
  return (
    <div className="grid grid-cols-2 border-b-2 border-dashed border-line md:grid-cols-4">
      {cells.map((c, i) => (
        <div key={c.label} className={`p-5 ${i < cells.length - 1 ? "md:border-r-2 md:border-dashed md:border-line" : ""}`}>
          <span className="font-display text-[12px] font-semibold uppercase tracking-widest text-ink-3">{c.label}</span>
          <strong className={`mt-1 block font-display font-bold seasoned ${c.big ? "text-3xl" : "text-2xl"}`}>{c.value}</strong>
          {c.sub && <span className="text-sm text-ink-2">{c.sub}</span>}
          {c.bar != null && (
            <div className="mt-2 h-2.5 overflow-hidden rounded-full border border-line bg-cream-2">
              <div className="h-full rounded-full bg-gradient-to-r from-leaf via-sun to-heat transition-all duration-700" style={{ width: c.bar + "%" }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Block({ letter, title, twoCol, children }) {
  if (twoCol) {
    return <article className="grid gap-10 border-b-2 border-dashed border-line p-8 md:grid-cols-2 last:border-0">{children}</article>;
  }
  return (
    <article className="border-b-2 border-dashed border-line p-8 last:border-0">
      <header className="mb-6 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-full seasoned-bg font-display text-lg font-bold text-white shadow-soft">{letter}</span>
        <h3 className="font-display text-2xl font-semibold">{title}</h3>
      </header>
      {children}
    </article>
  );
}

function Inner({ letter, title, items }) {
  return (
    <div>
      <header className="mb-4 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-full seasoned-bg font-display text-lg font-bold text-white shadow-soft">{letter}</span>
        <h3 className="font-display text-2xl font-semibold">{title}</h3>
      </header>
      <ol className="flex flex-col">
        {items.map(([t, b]) => (
          <li key={t} className="grid grid-cols-[28px_1fr] gap-3 border-b border-dashed border-line py-3">
            <span className="mt-1 grid h-6 w-6 place-items-center rounded-full seasoned-bg font-display text-xs font-bold text-white">✓</span>
            <div>
              <b className="font-bold">{t}</b>
              <p className="text-sm text-ink-2">{b}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Phone({ msgs }) {
  return (
    <div className="relative h-[540px] w-[290px] rounded-[36px] p-3 shadow-big seasoned-bg">
      <span className="absolute left-1/2 top-3 h-1.5 w-14 -translate-x-1/2 rounded-full bg-black/25" />
      <div className="mt-6 flex justify-between px-2 pb-3 font-display text-[11px] font-semibold text-white">
        <span>ClimaSchool · Ghana</span><span>SMS</span>
      </div>
      <div className="phone-feed flex h-[420px] flex-col gap-2 overflow-y-auto rounded-[22px] bg-paper p-3">
        {msgs.map((m, i) => (
          <div key={i} className="rounded-[18px_18px_18px_6px] seasoned-bg p-3 text-white shadow-soft">
            <b className="block text-sm">{m.title}</b>
            <span className="text-[13px] leading-snug">{m.body}</span>
            <span className="mt-1 block font-display text-[10px] opacity-80">{m.ts}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 rounded-b-[22px] bg-paper px-3 py-2 font-display text-[10px] font-medium text-ink-3">Reply HELP · SICK · FLOOD</div>
    </div>
  );
}
