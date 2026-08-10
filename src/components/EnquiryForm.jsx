import { useState } from "react";
import { Send, CheckCircle2, AlertTriangle, Mail } from "lucide-react";
import { api, ApiError, hasBackend } from "../lib/api";

const TOPICS = [
  "Bring ClimaSchool AI to my district",
  "Integrate a data feed",
  "Health facility partnership",
  "Research collaboration",
  "Contribute to the open advisory content",
  "Something else"
];

const EMPTY = { name: "", email: "", organisation: "", topic: TOPICS[0], message: "", website: "" };

export default function EnquiryForm() {
  const [form, setForm] = useState(EMPTY);
  const [state, setState] = useState("idle"); // idle | sending | sent | error
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setState("sending");
    setError("");
    try {
      await api.submitEnquiry(form);
      setState("sent");
      setForm(EMPTY);
    } catch (err) {
      setState("error");
      setError(
        err instanceof ApiError && err.status === 0
          ? "We could not reach the service. Please email us directly at ecolutionghana@gmail.com."
          : err.message
      );
    }
  }

  // No API on this deployment — offer the thing that actually works rather than a
  // form that would fail on submit.
  if (!hasBackend) {
    return (
      <div className="rounded-xl3 border-2 border-line bg-paper p-6 text-left shadow-soft">
        <p className="flex items-center gap-2 font-display text-lg font-semibold">
          <Mail aria-hidden="true" className="h-5 w-5 text-heat" />
          Talk to us
        </p>
        <p className="mt-2 text-sm text-ink-2">
          Tell us your district, your role and what you would like ClimaSchool AI to
          do — whether that is reaching your schools, integrating a data feed, or
          collaborating on the open advisory content.
        </p>
        <a
          className="btn-primary mt-4"
          href="mailto:ecolutionghana@gmail.com?subject=ClimaSchool%20AI%20%C2%B7%20partnership"
        >
          Email ecolutionghana@gmail.com <Send aria-hidden="true" className="h-4 w-4" />
        </a>
      </div>
    );
  }

  if (state === "sent") {
    return (
      <div
        role="status"
        className="rounded-xl3 border-2 border-leaf bg-leaf/10 p-6 text-left"
      >
        <p className="flex items-center gap-2 font-display text-lg font-semibold">
          <CheckCircle2 aria-hidden="true" className="h-5 w-5 text-leaf" />
          Thank you — your message has reached us.
        </p>
        <p className="mt-2 text-sm text-ink-2">
          We read every enquiry and reply from ecolutionghana@gmail.com. If it is urgent,
          email us directly.
        </p>
        <button type="button" onClick={() => setState("idle")} className="btn-ghost mt-4">
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl3 border-2 border-line bg-paper p-6 text-left shadow-soft">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="eq-name" label="Your name" required value={form.name} onChange={set("name")} />
        <Field id="eq-email" label="Email" type="email" required value={form.email} onChange={set("email")} />
        <Field id="eq-org" label="Organisation" value={form.organisation} onChange={set("organisation")} />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="eq-topic" className="font-display text-sm font-semibold">What is this about?</label>
          <select
            id="eq-topic"
            value={form.topic}
            onChange={set("topic")}
            className="rounded-xl2 border-2 border-line-2 bg-cream px-4 py-2.5 text-sm text-ink"
          >
            {TOPICS.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-1.5">
        <label htmlFor="eq-message" className="font-display text-sm font-semibold">
          Message <span className="font-normal text-ink-3">(required)</span>
        </label>
        <textarea
          id="eq-message"
          required
          rows={5}
          maxLength={5000}
          value={form.message}
          onChange={set("message")}
          className="rounded-xl2 border-2 border-line-2 bg-cream px-4 py-3 text-sm text-ink"
        />
      </div>

      {/* Honeypot: invisible to people, irresistible to bots. */}
      <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden">
        <label htmlFor="eq-website">Leave this field empty</label>
        <input id="eq-website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} />
      </div>

      {state === "error" && (
        <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl2 border-2 border-heat bg-heat/10 px-4 py-3 text-sm text-ink">
          <AlertTriangle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-heat" />
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button type="submit" disabled={state === "sending"} className="btn-primary disabled:opacity-60">
          {state === "sending" ? "Sending…" : "Send message"}
          <Send aria-hidden="true" className="h-4 w-4" />
        </button>
        <p className="text-xs text-ink-3">
          We store your name, email and message only to reply. Nothing is shared with third parties.
        </p>
      </div>
    </form>
  );
}

function Field({ id, label, type = "text", required = false, value, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-display text-sm font-semibold">
        {label} {required && <span className="font-normal text-ink-3">(required)</span>}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        className="rounded-xl2 border-2 border-line-2 bg-cream px-4 py-2.5 text-sm text-ink"
      />
    </div>
  );
}
