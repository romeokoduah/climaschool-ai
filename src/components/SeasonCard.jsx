import { Link } from "react-router-dom";
import { ArrowUpRight, Sun, Cloud, Droplets, Sprout } from "lucide-react";
import { motion } from "framer-motion";

const ART = {
  harmattan:   { Icon: Cloud,   tint: "from-sun/20 to-paper",   accent: "#f0a948" },
  dryheat:     { Icon: Sun,     tint: "from-heat/20 to-paper",  accent: "#ff6a3d" },
  firstrains:  { Icon: Droplets,tint: "from-sky/25 to-paper",   accent: "#5e9bff" },
  secondrains: { Icon: Sprout,  tint: "from-leaf/25 to-paper",  accent: "#5fc16f" }
};

export default function SeasonCard({ keyName, season, isCurrent }) {
  const a = ART[keyName] ?? ART.dryheat;
  const Icon = a.Icon;
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 240, damping: 20 }}
      className={`group flex flex-col overflow-hidden rounded-xl3 border-2 bg-paper shadow-soft transition hover:shadow-big ${isCurrent ? "border-heat" : "border-line"}`}
    >
      <Link to={`/advisory?season=${keyName}`} className="flex h-full flex-col">
        <div className={`relative h-36 bg-gradient-to-b ${a.tint}`}>
          <div className="absolute inset-0 grid place-items-center">
            <Icon size={56} stroke={a.accent} className="opacity-90" />
          </div>
          {isCurrent && (
            <span className="absolute right-3 top-3 rounded-full bg-heat px-3 py-1 font-display text-[11px] font-semibold uppercase tracking-wider text-white">
              Active
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-5">
          <span className="font-display text-xs font-semibold uppercase tracking-widest text-ink-3">
            {season.months}
          </span>
          <h3 className="font-display text-2xl font-semibold leading-tight">{season.title}</h3>
          <p className="text-sm text-ink-2">{season.alert.split(".")[0]}.</p>
          <div className="mt-auto flex items-center justify-between pt-3">
            <ul className="flex flex-wrap gap-1.5">
              {season.risks.slice(0, 3).map(([t]) => (
                <li key={t} className="rounded-full bg-cream-2 px-2.5 py-1 font-display text-[11px] font-semibold text-ink-2">
                  {t.split(/[\s/]/)[0].replace(/[(),]/g, "")}
                </li>
              ))}
            </ul>
            <ArrowUpRight className="h-5 w-5 text-heat opacity-0 transition group-hover:opacity-100" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
