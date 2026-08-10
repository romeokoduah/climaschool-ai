import { NavLink, Outlet, Link } from "react-router-dom";
import {
  Gauge, BellRing, Radio, Inbox, Users, Building2, GraduationCap,
  Map as MapIcon, UserCog, LogOut, ExternalLink
} from "lucide-react";
import { useAuth } from "./AuthContext.jsx";
import Login from "./Login.jsx";
import { Loading } from "./ui.jsx";

// role → the navigation they are allowed to see. The API enforces access; this
// only avoids showing an observer links that would 403 on click.
const NAV = [
  { to: "/admin",             end: true, label: "Overview",    Icon: Gauge,          roles: ["admin", "reviewer", "chw", "observer"] },
  { to: "/admin/alerts",      label: "Alert review",           Icon: BellRing,       roles: ["admin", "reviewer", "observer"] },
  { to: "/admin/reports",     label: "Field reports",          Icon: Radio,          roles: ["admin", "reviewer", "chw", "observer"] },
  { to: "/admin/map",         label: "Risk map",               Icon: MapIcon,        roles: ["admin", "reviewer", "chw", "observer"] },
  { to: "/admin/schools",     label: "Schools",                Icon: GraduationCap,  roles: ["admin", "reviewer", "observer"] },
  { to: "/admin/facilities",  label: "Health facilities",      Icon: Building2,      roles: ["admin", "reviewer", "observer"] },
  { to: "/admin/enquiries",   label: "Enquiries",              Icon: Inbox,          roles: ["admin"] },
  { to: "/admin/subscribers", label: "Subscribers",            Icon: Users,          roles: ["admin", "reviewer", "observer"] },
  { to: "/admin/users",       label: "Team",                   Icon: UserCog,        roles: ["admin"] }
];

export default function AdminLayout() {
  const { isAuthenticated, checking, user, role, logout } = useAuth();

  if (checking) return <div className="min-h-screen bg-cream"><Loading label="Restoring your session…" /></div>;
  if (!isAuthenticated) return <Login />;

  const links = NAV.filter((l) => l.roles.includes(role));

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto flex max-w-[1600px] flex-col lg:flex-row">

        <aside className="border-b-2 border-line bg-cream-2 lg:min-h-screen lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r-2">
          <div className="px-5 py-5">
            <Link to="/" className="font-display text-lg font-bold">
              ClimaSchool<em className="ml-1 font-hand text-xl not-italic font-bold text-heat">AI</em>
            </Link>
            <p className="mt-0.5 font-display text-[11px] font-bold uppercase tracking-widest text-ink-3">
              Operations console
            </p>
          </div>

          <nav aria-label="Console" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible">
            {links.map(({ to, end, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-2.5 rounded-xl2 px-3 py-2 font-display text-sm font-medium transition ${
                    isActive ? "bg-heat text-white shadow-soft" : "text-ink-2 hover:bg-paper hover:text-heat"
                  }`
                }
              >
                <Icon aria-hidden="true" className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto hidden border-t-2 border-dashed border-line px-5 py-4 lg:block">
            <p className="font-display text-sm font-semibold">{user?.full_name ?? user?.email}</p>
            <p className="text-xs capitalize text-ink-3">{role}</p>
            <div className="mt-3 flex flex-col gap-2">
              <Link to="/" className="inline-flex items-center gap-1.5 font-display text-xs font-semibold text-ink-2 hover:text-heat">
                <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" /> Public site
              </Link>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-1.5 font-display text-xs font-semibold text-ink-2 hover:text-heat"
              >
                <LogOut aria-hidden="true" className="h-3.5 w-3.5" /> Sign out
              </button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-5 py-6 lg:px-8">
          <div className="mb-5 flex items-center justify-between gap-4 lg:hidden">
            <span className="font-display text-sm font-semibold">{user?.full_name ?? user?.email}</span>
            <button type="button" onClick={logout} className="font-display text-xs font-semibold text-heat">
              Sign out
            </button>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
