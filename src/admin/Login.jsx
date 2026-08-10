import { useState } from "react";
import { Link } from "react-router-dom";
import { LogIn, AlertTriangle, ShieldCheck } from "lucide-react";
import { useAuth } from "./AuthContext.jsx";
import { hasBackend } from "../lib/api";
import { Button, Field, inputClass } from "./ui.jsx";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Served from a build with no API on its origin (Vercel / GitHub Pages), the
  // console cannot work at all — say so rather than present a dead form.
  if (!hasBackend) {
    return (
      <Shell>
        <h1 className="font-display text-2xl font-bold">Console unavailable here</h1>
        <p className="mt-3 text-sm text-ink-2">
          This copy of the site is served without a connected ClimaSchool service, so the
          operations console cannot sign you in. Use the deployment that runs alongside
          the API.
        </p>
        <Link to="/" className="btn-ghost mt-5 inline-flex">Back to the public site</Link>
      </Shell>
    );
  }

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err?.status === 0 ? "Could not reach the ClimaSchool service." : "Email or password not recognised.");
      setBusy(false);
    }
  }

  return (
    <Shell>
      <h1 className="font-display text-2xl font-bold">Operations console</h1>
      <p className="mt-1 text-sm text-ink-2">
        For ClimaSchool staff, reviewers, community health workers and authorised
        institutional observers.
      </p>

      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
        <Field id="login-email" label="Email">
          <input
            id="login-email"
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field id="login-password" label="Password">
          <input
            id="login-password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </Field>

        {error && (
          <p role="alert" className="flex items-center gap-2 rounded-xl2 border-2 border-heat bg-heat/10 px-3.5 py-2.5 text-sm">
            <AlertTriangle aria-hidden="true" className="h-4 w-4 shrink-0 text-heat" />
            {error}
          </p>
        )}

        <Button type="submit" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"} <LogIn aria-hidden="true" className="h-4 w-4" />
        </Button>
      </form>

      <p className="mt-6 flex items-start gap-2 border-t-2 border-dashed border-line pt-4 text-xs text-ink-3">
        <ShieldCheck aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Alerts at ORANGE and RED cannot be issued from this console without a named
        reviewer approving them first.
      </p>
    </Shell>
  );
}

function Shell({ children }) {
  return (
    <div className="grid min-h-screen place-items-center bg-cream px-6 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="font-display text-xl font-bold">
          ClimaSchool<em className="ml-1 font-hand text-2xl not-italic font-bold text-heat">AI</em>
        </Link>
        <div className="mt-4 rounded-xl4 border-2 border-line bg-paper p-7 shadow-lift">{children}</div>
      </div>
    </div>
  );
}
