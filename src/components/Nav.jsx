import { NavLink, Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

const links = [
  { to: "/",         label: "Home" },
  { to: "/seasons",  label: "Seasons" },
  { to: "/advisory", label: "Advisory" },
  { to: "/engine",   label: "Engine Room" },
  { to: "/about",    label: "About" }
];

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-cream/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-heat shadow-soft ring-4 ring-heat/15">
            <Sparkles className="h-5 w-5 text-white" />
          </span>
          <span className="font-display text-lg">
            <b className="font-bold">ClimaSchool</b>
            <em className="ml-1 font-hand text-xl not-italic font-bold text-heat">AI</em>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `font-display text-[15px] font-medium transition border-b-2 ${
                  isActive ? "text-heat border-heat" : "text-ink-2 border-transparent hover:text-heat"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <Link
          to="/engine"
          className="hidden items-center gap-2 rounded-full border-2 border-heat bg-paper px-4 py-2 font-display text-[13px] font-semibold text-heat shadow-soft transition hover:-translate-y-0.5 sm:inline-flex"
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-heat shadow-[0_0_10px_#ff6a3d]"></span>
          Engine Room
        </Link>
      </div>
    </header>
  );
}
