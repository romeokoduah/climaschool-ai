import { Link } from "react-router-dom";
import { Mail, MapPin } from "lucide-react";
import { hasBackend } from "../lib/api";

const nav = [
  {
    heading: "Platform",
    links: [
      { to: "/platform", label: "How it works" },
      { to: "/early-action", label: "Early action" },
      { to: "/engine", label: "Engine Room" },
      { to: "/trust", label: "Responsible AI" }
    ]
  },
  {
    heading: "Advisory",
    links: [
      { to: "/seasons", label: "The four seasons" },
      { to: "/advisory", label: "Live advisory" },
      { to: "/seasons", label: "School feeding guidance" }
    ]
  },
  {
    heading: "Organisation",
    links: [
      { to: "/about", label: "About ClimaSchool AI" },
      { to: "/about", label: "Team & partners" },
      { to: "/about", label: "Pilot zones" }
    ]
  }
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t-2 border-line-2 bg-cream-2">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_2.6fr]">

          {/* Brand */}
          <div className="max-w-sm">
            <span className="font-display text-xl font-bold">
              ClimaSchool<em className="ml-1 font-hand text-2xl not-italic font-bold text-heat">AI</em>
            </span>
            <p className="mt-3 text-sm leading-relaxed text-ink-2">
              A child-centred climate-health intelligence and early-action platform.
              Built in Ghana. Designed for Africa.
            </p>

            <ol className="mt-5 flex flex-wrap items-center gap-x-1.5 gap-y-1" aria-label="Our operating principle">
              {["Predict", "Prepare", "Act", "Protect", "Learn"].map((step, i) => (
                <li key={step} className="flex items-center gap-1.5">
                  {i > 0 && <span aria-hidden="true" className="text-line-2">/</span>}
                  <span className="font-display text-[11px] font-bold uppercase tracking-widest text-heat">
                    {step}
                  </span>
                </li>
              ))}
            </ol>

            <address className="mt-6 space-y-2 not-italic">
              <a
                href="mailto:ecolutionghana@gmail.com"
                className="inline-flex items-center gap-2 text-sm font-semibold text-ink transition hover:text-heat"
              >
                <Mail aria-hidden="true" className="h-4 w-4 text-heat" />
                ecolutionghana@gmail.com
              </a>
              <p className="flex items-center gap-2 text-sm text-ink-2">
                <MapPin aria-hidden="true" className="h-4 w-4 text-ink-3" />
                Eco-lution Consults · Accra, Ghana
              </p>
            </address>
          </div>

          {/* Navigation */}
          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {nav.map((col) => (
              <div key={col.heading}>
                <h2 className="font-display text-xs font-bold uppercase tracking-widest text-ink-3">
                  {col.heading}
                </h2>
                <ul className="mt-3 space-y-2">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link to={l.to} className="text-sm text-ink-2 transition hover:text-heat">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Standards strip */}
        <div className="mt-12 rounded-xl3 border-2 border-line bg-paper px-6 py-5">
          <h2 className="font-display text-xs font-bold uppercase tracking-widest text-ink-3">
            Aligned with international guidance
          </h2>
          <p className="mt-2 text-sm text-ink-2">
            Early-warning principles adapted from <b>WHO EWARS-csd</b>, climate-health data
            practice from <b>DHIS2</b>, facility resilience from the{" "}
            <b>WHO Operational Framework for Climate-Resilient Health Systems</b>, and
            actor-specific warning design from <b>WMO Early Warnings for All</b>.
          </p>
        </div>

        {/* Legal bar */}
        <div className="mt-8 flex flex-col gap-4 border-t-2 border-line pt-6 md:flex-row md:items-center md:justify-between">
          <p className="font-display text-xs font-medium text-ink-3">
            © {year} Eco-lution Consults. Open source under the MIT Licence; advisory
            content under CC-BY 4.0.
          </p>
          <nav aria-label="Legal" className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link to="/privacy" className="font-display text-xs font-semibold text-ink-2 transition hover:text-heat">
              Privacy
            </Link>
            <Link to="/terms" className="font-display text-xs font-semibold text-ink-2 transition hover:text-heat">
              Terms
            </Link>
            <a
              href="https://github.com/romeokoduah/climaschool-ai"
              className="font-display text-xs font-semibold text-ink-2 transition hover:text-heat"
            >
              Source code
            </a>
            {/* Only shown where a service is actually connected — on the static
                deployments the console cannot sign anyone in. */}
            {hasBackend && (
              <Link to="/admin" className="font-display text-xs font-semibold text-ink-2 transition hover:text-heat">
                Staff console
              </Link>
            )}
          </nav>
        </div>

        <p className="mt-6 border-t border-dashed border-line pt-4 text-xs leading-relaxed text-ink-3">
          ClimaSchool AI provides decision support, not medical advice. Risk scores,
          forecasts and advisories are estimates — they do not diagnose disease or confirm
          an outbreak, and they never replace the judgement of a qualified health
          professional. Alerts at ORANGE and RED levels are reviewed by a person before
          they are issued.
        </p>
      </div>
    </footer>
  );
}
