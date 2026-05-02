export default function Footer() {
  return (
    <footer className="mt-12 border-t-2 border-dashed border-line-2 bg-cream-2">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-[1fr_3fr]">
          <div>
            <span className="font-display text-lg font-bold">ClimaSchool<em className="ml-1 font-hand text-xl not-italic font-bold text-heat">AI</em></span>
            <p className="mt-2 text-sm text-ink-2">Built openly for Ghana — and West Africa next.</p>
          </div>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <Col cap="By" body={<>United Youth Initiative for Africa<br/>UNIYIA · Ghana<br/><a className="border-b-2 border-dashed border-heat text-heat" href="mailto:info@uniyia.org">info@uniyia.org</a></>} />
            <Col cap="For" body={<>UNICEF Venture Fund<br/>Climate Ventures Cohort 2026</>} />
            <Col cap="Stack" body={<>Python · FastAPI<br/>React · PostgreSQL · Twilio</>} />
            <Col cap="Licence" body={<>MIT (software)<br/>CC-BY 4.0 (advisory)</>} />
          </div>
        </div>
        <div className="mt-8 flex flex-col justify-between gap-2 border-t-2 border-dashed border-line pt-4 font-display text-xs font-medium text-ink-3 md:flex-row">
          <span>© 2026 UNIYIA</span>
          <span>UNICEF Venture Fund · Climate Ventures Cohort 2026</span>
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
