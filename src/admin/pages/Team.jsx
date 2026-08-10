// Staff accounts.
//
// An account here can approve an ORANGE or RED alert that reaches real
// caregivers, so who holds which role is a safety question, not an admin chore.
// Passwords are write-only throughout: the form sets an initial one for a new
// account and then forgets it, and no existing account's password is ever shown
// or editable from this console.

import { useState } from "react";
import { KeyRound, ShieldAlert, UserPlus } from "lucide-react";
import { api } from "../../lib/api";
import { useApi, useAuth } from "../AuthContext.jsx";
import { Async, Button, Card, ErrorNote, Field, Table, formatDate, inputClass } from "../ui.jsx";

const ROLE_LABEL = {
  admin: "Administrator",
  reviewer: "Reviewer",
  chw: "Community health worker",
  observer: "Observer"
};

// Matches MIN_PASSWORD_LENGTH in the API, so the browser catches a short one
// before a round trip does.
const MIN_PASSWORD_LENGTH = 10;

const EMPTY_DRAFT = { email: "", full_name: "", organisation: "", role: "observer", password: "" };

const dash = (value) => (value === null || value === undefined || value === "" ? "—" : value);

export default function Team() {
  const { token, role, user } = useAuth();
  const isAdmin = role === "admin";

  const users = useApi((t) => (isAdmin ? api.listUsers(t) : Promise.resolve(null)), [isAdmin]);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-2xl font-bold">Team</h1>
        <p className="mt-1 text-sm text-ink-2">
          Staff, reviewers, community health workers and institutional observers with access to
          this console.
        </p>
      </header>

      {isAdmin ? (
        <>
          <CreateAccount token={token} onCreated={users.reload} />
          <AccountList state={users} token={token} signedInEmail={user?.email} />
        </>
      ) : (
        <Card title="Staff accounts">
          <p className="text-sm text-ink-2">
            Managing accounts requires an administrator role. You can still change your own
            password below.
          </p>
        </Card>
      )}

      <ChangeMyPassword token={token} />
    </div>
  );
}

// ─────────────────────────── create ───────────────────────────

function CreateAccount({ token, onCreated }) {
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState("");

  const set = (key) => (e) => setDraft((d) => ({ ...d, [key]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice("");
    try {
      const created = await api.createUser(
        {
          email: draft.email.trim(),
          full_name: draft.full_name.trim(),
          organisation: draft.organisation.trim() || null,
          role: draft.role,
          password: draft.password
        },
        token
      );
      // Clearing the whole draft is what drops the password out of component
      // state; it is never echoed back, stored or shown again.
      setDraft(EMPTY_DRAFT);
      setNotice(
        `Account created for ${created.email}. Share the password with them by a private route and ask them to change it when they first sign in.`
      );
      onCreated();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card title="Add a staff account">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="new-email" label="Email">
            <input
              id="new-email"
              type="email"
              required
              autoComplete="off"
              value={draft.email}
              onChange={set("email")}
              className={inputClass}
            />
          </Field>

          <Field id="new-name" label="Full name">
            <input
              id="new-name"
              type="text"
              required
              minLength={2}
              autoComplete="off"
              value={draft.full_name}
              onChange={set("full_name")}
              className={inputClass}
            />
          </Field>

          <Field id="new-org" label="Organisation" hint="Optional.">
            <input
              id="new-org"
              type="text"
              autoComplete="off"
              value={draft.organisation}
              onChange={set("organisation")}
              className={inputClass}
            />
          </Field>

          <Field id="new-role" label="Role">
            <select id="new-role" value={draft.role} onChange={set("role")} className={inputClass}>
              {Object.entries(ROLE_LABEL).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field
          id="new-password"
          label="Initial password"
          hint={`At least ${MIN_PASSWORD_LENGTH} characters. This sets the password for the new account only — it is not shown again once you submit, and it cannot be looked up here later.`}
        >
          <input
            id="new-password"
            type="password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            autoComplete="new-password"
            value={draft.password}
            onChange={set("password")}
            className={inputClass}
          />
        </Field>

        <p className="flex items-start gap-2 rounded-xl2 border-2 border-dashed border-line bg-cream/60 px-4 py-3 text-xs text-ink-2">
          <ShieldAlert aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-heat" />
          Ask the new user to change this password the first time they sign in. Accounts on this
          console can approve alerts that reach caregivers.
        </p>

        {error && <ErrorNote error={error} />}

        <div aria-live="polite" className="empty:hidden">
          {notice && (
            <p className="rounded-xl2 border-2 border-leaf bg-leaf/10 px-4 py-2.5 text-sm text-ink">{notice}</p>
          )}
        </div>

        <div>
          <Button type="submit" disabled={busy}>
            {busy ? "Creating…" : "Create account"} <UserPlus aria-hidden="true" className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
}

// ─────────────────────────── list + role changes ───────────────────────────

function AccountList({ state, token, signedInEmail }) {
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);
  const [context, setContext] = useState("");
  const [notice, setNotice] = useState("");

  async function update(account, body, describe) {
    setBusyId(account.id);
    setError(null);
    setContext("");
    setNotice("");
    try {
      await api.updateUser(account.id, body, token);
      setNotice(describe);
      state.reload();
    } catch (err) {
      // The API refuses self-demotion and self-deactivation. Naming the account
      // alongside the message keeps the refusal legible instead of looking like
      // a control that silently did nothing.
      setContext(`No change was made to ${account.email}.`);
      setError(err);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Card title="Staff accounts">
      <div aria-live="polite" className="empty:hidden">
        {notice && (
          <p className="mb-4 rounded-xl2 border-2 border-leaf bg-leaf/10 px-4 py-2.5 text-sm text-ink">{notice}</p>
        )}
      </div>

      {error && (
        <div className="mb-4 flex flex-col gap-1.5">
          {context && <p className="text-xs text-ink-3">{context}</p>}
          <ErrorNote error={error} />
        </div>
      )}

      <Async state={state} empty="No staff accounts yet.">
        {(rows) => (
          <Table
            rows={rows ?? []}
            empty="No staff accounts yet."
            columns={[
              {
                key: "full_name",
                header: "Name",
                render: (r) => (
                  <span className="font-semibold text-ink">
                    {dash(r.full_name)}
                    {r.email === signedInEmail && (
                      <span className="ml-2 rounded-full bg-cream-2 px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-wide text-ink-3">
                        You
                      </span>
                    )}
                  </span>
                )
              },
              { key: "email", header: "Email", render: (r) => dash(r.email) },
              { key: "organisation", header: "Organisation", render: (r) => dash(r.organisation) },
              {
                key: "role",
                header: "Role",
                render: (r) => (
                  <select
                    value={r.role}
                    disabled={busyId === r.id}
                    aria-label={`Role for ${r.full_name}`}
                    onChange={(e) =>
                      update(
                        r,
                        { role: e.target.value },
                        `${r.full_name} is now ${ROLE_LABEL[e.target.value] ?? e.target.value}.`
                      )
                    }
                    className={`${inputClass} py-1.5 text-[13px]`}
                  >
                    {Object.entries(ROLE_LABEL).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                )
              },
              {
                key: "is_active",
                header: "Status",
                render: (r) => (r.is_active ? "Active" : "Deactivated")
              },
              { key: "created_at", header: "Added", render: (r) => formatDate(r.created_at) },
              {
                key: "actions",
                header: "Access",
                render: (r) => (
                  <Button
                    variant={r.is_active ? "danger" : "ghost"}
                    disabled={busyId === r.id}
                    onClick={() =>
                      update(
                        r,
                        { is_active: !r.is_active },
                        r.is_active
                          ? `${r.full_name} can no longer sign in.`
                          : `${r.full_name} can sign in again.`
                      )
                    }
                  >
                    {busyId === r.id ? "Saving…" : r.is_active ? "Deactivate" : "Reactivate"}
                  </Button>
                )
              }
            ]}
          />
        )}
      </Async>
    </Card>
  );
}

// ─────────────────────────── own password ───────────────────────────

function ChangeMyPassword({ token }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setNotice("");

    if (next !== confirm) {
      setError(new Error("The new password and its confirmation do not match."));
      return;
    }

    setBusy(true);
    try {
      const res = await api.changePassword({ current_password: current, new_password: next }, token);
      setCurrent("");
      setNext("");
      setConfirm("");
      setNotice(res?.detail ?? "Password changed.");
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card title="Change my password">
      <form onSubmit={onSubmit} className="flex max-w-md flex-col gap-4">
        <Field id="pw-current" label="Current password">
          <input
            id="pw-current"
            type="password"
            required
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field id="pw-new" label="New password" hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}>
          <input
            id="pw-new"
            type="password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            autoComplete="new-password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field id="pw-confirm" label="Confirm new password">
          <input
            id="pw-confirm"
            type="password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={inputClass}
          />
        </Field>

        {error && <ErrorNote error={error} />}

        <div aria-live="polite" className="empty:hidden">
          {notice && (
            <p className="rounded-xl2 border-2 border-leaf bg-leaf/10 px-4 py-2.5 text-sm text-ink">
              {notice} Sessions already signed in elsewhere stay valid until they expire.
            </p>
          )}
        </div>

        <div>
          <Button type="submit" disabled={busy}>
            {busy ? "Changing…" : "Change password"} <KeyRound aria-hidden="true" className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
}
