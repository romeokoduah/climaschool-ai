import { Routes, Route, useLocation } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import Nav from "./components/Nav.jsx";
import Footer from "./components/Footer.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { AuthProvider } from "./admin/AuthContext.jsx";
import { pageview } from "./lib/analytics";

// Code-split each route so the initial bundle only carries the shell + home.
const Home = lazy(() => import("./pages/Home.jsx"));
const Platform = lazy(() => import("./pages/Platform.jsx"));
const EarlyAction = lazy(() => import("./pages/EarlyAction.jsx"));
const Seasons = lazy(() => import("./pages/Seasons.jsx"));
const Advisory = lazy(() => import("./pages/Advisory.jsx"));
const Engine = lazy(() => import("./pages/Engine.jsx"));
const Trust = lazy(() => import("./pages/Trust.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const Privacy = lazy(() => import("./pages/Privacy.jsx"));
const Terms = lazy(() => import("./pages/Terms.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

// The operations console is a separate application sharing this shell. It is
// lazily loaded so a public visitor never downloads it.
const AdminLayout = lazy(() => import("./admin/AdminLayout.jsx"));
const AdminOverview = lazy(() => import("./admin/pages/Overview.jsx"));
const AdminAlerts = lazy(() => import("./admin/pages/Alerts.jsx"));
const AdminReports = lazy(() => import("./admin/pages/Reports.jsx"));
const AdminRiskMap = lazy(() => import("./admin/pages/RiskMap.jsx"));
const AdminSchools = lazy(() => import("./admin/pages/Schools.jsx"));
const AdminFacilities = lazy(() => import("./admin/pages/Facilities.jsx"));
const AdminEnquiries = lazy(() => import("./admin/pages/Enquiries.jsx"));
const AdminSubscribers = lazy(() => import("./admin/pages/Subscribers.jsx"));
const AdminTeam = lazy(() => import("./admin/pages/Team.jsx"));

const BASE_TITLE = "ClimaSchool AI";
const TITLES = {
  "/": "ClimaSchool AI — Climate-health early warning for Ghana's schools",
  "/platform": "The platform — ClimaSchool AI",
  "/early-action": "Early action — ClimaSchool AI",
  "/seasons": "Seasons — ClimaSchool AI",
  "/advisory": "Live advisory — ClimaSchool AI",
  "/engine": "Engine Room — ClimaSchool AI",
  "/trust": "Responsible AI — ClimaSchool AI",
  "/about": "About — ClimaSchool AI",
  "/privacy": "Privacy — ClimaSchool AI",
  "/terms": "Terms — ClimaSchool AI"
};

function RouteFallback() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-24" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div className="h-2 w-32 animate-pulse rounded-full bg-line-2" />
    </div>
  );
}

export default function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    document.title = TITLES[pathname] || (pathname.startsWith("/admin") ? "Console — ClimaSchool AI" : BASE_TITLE);
    pageview(pathname);
  }, [pathname]);

  // The console is a full-screen working tool with its own chrome: the marketing
  // nav and footer would only get in an operator's way.
  if (pathname.startsWith("/admin")) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<RouteFallback />}>
          <AuthProvider>
            <Routes>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminOverview />} />
                <Route path="alerts" element={<AdminAlerts />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="map" element={<AdminRiskMap />} />
                <Route path="schools" element={<AdminSchools />} />
                <Route path="facilities" element={<AdminFacilities />} />
                <Route path="enquiries" element={<AdminEnquiries />} />
                <Route path="subscribers" element={<AdminSubscribers />} />
                <Route path="users" element={<AdminTeam />} />
              </Route>
            </Routes>
          </AuthProvider>
        </Suspense>
      </ErrorBoundary>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-heat focus:px-4 focus:py-2 focus:font-display focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to main content
      </a>
      <Nav />
      <main id="main" className="flex-1">
        <ErrorBoundary>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/platform" element={<Platform />} />
              <Route path="/early-action" element={<EarlyAction />} />
              <Route path="/seasons" element={<Seasons />} />
              <Route path="/advisory" element={<Advisory />} />
              <Route path="/engine" element={<Engine />} />
              <Route path="/trust" element={<Trust />} />
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}
