import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-12 border-t-2 border-dashed border-line-2 bg-cream-2">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-[1fr_3fr]">
          <div>
            <span className="font-display text-lg font-bold">ClimaSchool<em className="ml-1 font-hand text-xl not-italic font-bold text-heat">AI</em></span>
            <p className="mt-2 text-sm text-ink-2">Built in Ghana. Designed for Africa.</p>
            <p className="mt-2 font-display text-xs font-semibold uppercase tracking-widest text-ink-3">
              Predict · Prepare · Act · Protect · Learn
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <Col cap="By" body={<>Eco-lution Consults<br/>Ghana<br/><a className="border-b-2 border-dashed border-heat text-heat" href="mailto:info@uniyia.org">info@uniyia.org</a></>} />
            <Col cap="For" body={<>Schools, families, community health workers &amp; health facilities across Ghana</>} />
            <Col cap="Built on" body={<>WHO EWARS-csd · DHIS2<br/>WHO climate-resilient health systems · WMO EW4All</>} />
            <Col cap="Licence" body={<>MIT (software)<br/>CC-BY 4.0 (advisory)</>} />
          </div>
        </div>
        <div className="mt-8 flex flex-col justify-between gap-3 border-t-2 border-dashed border-line pt-4 font-display text-xs font-medium text-ink-3 md:flex-row md:items-center">
          <span>© 2026 Eco-lution Consults · Built openly for Ghana</span>
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-1" aria-label="Legal">
            <Link to="/privacy" className="transition hover:text-heat">Privacy</Link>
            <Link to="/terms" className="transition hover:text-heat">Terms</Link>
            <span>MIT · CC-BY 4.0</span>
          </nav>
        </div>
      </div>
    </footer>
  );
}

function Col({ cap, body }) {
  return (
    <div>
      <span className="font-display text-xs font-semibold uppercase tracking-widest text-ink-3">{cap}</span>
      <p className="mt-1 text-sm text-ink-2">{body}</p>
    </div>
  );
}
