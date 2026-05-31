import { Routes, Route, useLocation } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import Nav from "./components/Nav.jsx";
import Footer from "./components/Footer.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { pageview } from "./lib/analytics";

// Code-split each route so the initial bundle only carries the shell + home.
const Home = lazy(() => import("./pages/Home.jsx"));
const Seasons = lazy(() => import("./pages/Seasons.jsx"));
const Advisory = lazy(() => import("./pages/Advisory.jsx"));
const Engine = lazy(() => import("./pages/Engine.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const Privacy = lazy(() => import("./pages/Privacy.jsx"));
const Terms = lazy(() => import("./pages/Terms.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

const BASE_TITLE = "ClimaSchool AI";
const TITLES = {
  "/": "ClimaSchool AI — Climate-health early warning for Ghana's schools",
  "/seasons": "Seasons — ClimaSchool AI",
  "/advisory": "Live advisory — ClimaSchool AI",
  "/engine": "Engine Room — ClimaSchool AI",
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
    document.title = TITLES[pathname] || BASE_TITLE;
    pageview(pathname);
  }, [pathname]);

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
              <Route path="/seasons" element={<Seasons />} />
              <Route path="/advisory" element={<Advisory />} />
              <Route path="/engine" element={<Engine />} />
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
