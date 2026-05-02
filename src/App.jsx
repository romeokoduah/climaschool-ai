import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Nav from "./components/Nav.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Seasons from "./pages/Seasons.jsx";
import Advisory from "./pages/Advisory.jsx";
import Engine from "./pages/Engine.jsx";
import About from "./pages/About.jsx";

export default function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <main className="flex-1">
        <Routes>
          <Route path="/"          element={<Home />} />
          <Route path="/seasons"   element={<Seasons />} />
          <Route path="/advisory"  element={<Advisory />} />
          <Route path="/engine"    element={<Engine />} />
          <Route path="/about"     element={<About />} />
          <Route path="*"          element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
