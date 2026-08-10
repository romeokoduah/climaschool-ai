// The parent and caregiver messaging audience.
//
// The only personal data ClimaSchool holds is the telephone number of a
// consenting adult. Planning work — how many people, in which language, on which
// channel, at which school — needs none of it, so aggregate counts lead the page
// and the contact list stays behind an administrator role *and* a deliberate act.

import { useState } from "react";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { api } from "../../lib/api";
import { useApi, useAuth } from "../AuthContext.jsx";
import { Async, Card, ErrorNote, Field, Stat, Table, formatDate, inputClass } from "../ui.jsx";

const LANGUAGES = { en: "English", tw: "Twi", ha: "Hausa", ga: "Ga" };
const CHANNELS = { sms: "SMS", ussd: "USSD", whatsapp: "WhatsApp", voice: "Voice" };
const LIST_LIMIT = 200;

const dash = (value) => (value === null || value === undefined || value === "" ? "—" : value);
const languageLabel = (code) => LANGUAGES[code] ?? dash(code);
const channelLabel = (code) => CHANNELS[code] ?? dash(code);

export default function Subscribers() {
  const { role } = useAuth();
  const isAdmin = role === "admin";

  const stats = useApi((t) => api.subscriberStats(t), []);

  const [reveal, setReveal] = useState(false);
  const [filters, setFilters] = useState({ school_id: "", language: "", channel: "", is_active: "" });
  const showContacts = isAdmin && reveal;

  // Nothing is requested until the details are revealed, so simply opening this
  // page never pulls telephone numbers over the wire.
  const list = useApi(
    (t) => (showContacts ? api.listSubscribers({ ...filters, limit: LIST_LIMIT }, t) : Promise.resolve(null)),
    [showContacts, filters.school_id, filters.language, filters.channel, filters.is_active]
  );

  const setFilter = (key) => (e) => setFilters((f) => ({ ...f, [key]: e.target.value }));

  const schools = stats.data?.by_school ?? [];
  const schoolName = (id) => schools.find((s) => s.school_id === id)?.school_name ?? dash(id);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-2xl font-bold">Subscribers</h1>
        <p className="mt-1 text-sm text-ink-2">
          Parents and caregivers who have consented to receive ClimaSchool guidance.
        </p>
      </header>

      <Async state={stats}>
        {(data) => (
          <div className="flex flex-col gap-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Total registered" value={data.total} />
              <Stat label="Receiving messages" value={data.active} tone="text-leaf" />
              <Stat label="Opted out" value={data.inactive} tone="text-ink-2" sub="Replied STOP or removed" />
              <Stat label="No school linked" value={data.unassigned_to_school} tone="text-ink-2" />
            </div>

            <p className="flex items-start gap-2 text-xs text-ink-3">
              <ShieldCheck aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {data.note}
            </p>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card title="By language">
                <Table
                  columns={[
                    { key: "code", header: "Language", render: (r) => languageLabel(r.code) },
                    { key: "count", header: "Subscribers" }
                  ]}
                  rows={Object.entries(data.by_language ?? {}).map(([code, count]) => ({ code, count }))}
                  empty="No subscribers registered yet."
                />
              </Card>

              <Card title="By channel">
                <Table
                  columns={[
                    { key: "code", header: "Channel", render: (r) => channelLabel(r.code) },
                    { key: "count", header: "Subscribers" }
                  ]}
                  rows={Object.entries(data.by_channel ?? {}).map(([code, count]) => ({ code, count }))}
                  empty="No subscribers registered yet."
                />
              </Card>
            </div>

            <Card title="By school">
              <Table
                columns={[
                  { key: "school_name", header: "School", render: (r) => dash(r.school_name) },
                  { key: "district", header: "District", render: (r) => dash(r.district) },
                  { key: "subscribers", header: "Subscribers" }
                ]}
                rows={(data.by_school ?? []).map((r) => ({ ...r, id: r.school_id }))}
                empty="No subscribers are linked to a school yet."
              />
            </Card>
          </div>
        )}
      </Async>

      <Card title="Contact details">
        {!isAdmin ? (
          <p className="text-sm text-ink-2">
            Telephone numbers are available to administrators alone. The counts above are the
            full picture of the audience available to your role.
          </p>
        ) : (
          <>
            <p className="text-sm text-ink-2">
              Below this point are the telephone numbers of consenting adults. They stay hidden
              until you ask for them, so this page can be read, shown and screen-shared without
              exposing anybody's personal data.
            </p>

            <label className="mt-4 inline-flex cursor-pointer items-center gap-2.5 font-display text-sm font-semibold">
              <input
                type="checkbox"
                checked={reveal}
                onChange={(e) => setReveal(e.target.checked)}
                aria-controls="subscriber-contacts"
                className="h-4 w-4 accent-heat"
              />
              {reveal ? (
                <Eye aria-hidden="true" className="h-4 w-4 text-heat" />
              ) : (
                <EyeOff aria-hidden="true" className="h-4 w-4 text-ink-3" />
              )}
              Show contact details
            </label>

            <p aria-live="polite" className="mt-2 text-xs text-ink-3">
              {reveal ? "Contact details are visible." : "Contact details are hidden."}
            </p>

            <div id="subscriber-contacts">
              {reveal && (
                <div className="mt-5 flex flex-col gap-4 border-t-2 border-dashed border-line pt-5">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Field id="sub-school" label="School">
                      <select id="sub-school" value={filters.school_id} onChange={setFilter("school_id")} className={inputClass}>
                        <option value="">All schools</option>
                        {schools.map((s) => (
                          <option key={s.school_id} value={s.school_id}>{s.school_name}</option>
                        ))}
                      </select>
                    </Field>

                    <Field id="sub-language" label="Language">
                      <select id="sub-language" value={filters.language} onChange={setFilter("language")} className={inputClass}>
                        <option value="">All languages</option>
                        {Object.entries(LANGUAGES).map(([code, label]) => (
                          <option key={code} value={code}>{label}</option>
                        ))}
                      </select>
                    </Field>

                    <Field id="sub-channel" label="Channel">
                      <select id="sub-channel" value={filters.channel} onChange={setFilter("channel")} className={inputClass}>
                        <option value="">All channels</option>
                        {Object.entries(CHANNELS).map(([code, label]) => (
                          <option key={code} value={code}>{label}</option>
                        ))}
                      </select>
                    </Field>

                    <Field id="sub-active" label="Status">
                      <select id="sub-active" value={filters.is_active} onChange={setFilter("is_active")} className={inputClass}>
                        <option value="">Active and opted out</option>
                        <option value="true">Receiving messages</option>
                        <option value="false">Opted out</option>
                      </select>
                    </Field>
                  </div>

                  {list.error && <ErrorNote error={list.error} onRetry={list.reload} />}

                  {!list.error && (
                    <Async state={list}>
                      {(rows) => (
                        <Table
                          columns={[
                            { key: "phone", header: "Telephone", render: (r) => dash(r.phone) },
                            { key: "display_name", header: "Name", render: (r) => dash(r.display_name) },
                            { key: "language", header: "Language", render: (r) => languageLabel(r.language) },
                            { key: "channel", header: "Channel", render: (r) => channelLabel(r.channel) },
                            {
                              key: "school_id",
                              header: "School",
                              render: (r) => (r.school_id === null || r.school_id === undefined ? "—" : schoolName(r.school_id))
                            },
                            {
                              key: "is_active",
                              header: "Status",
                              render: (r) => (r.is_active ? "Receiving messages" : "Opted out")
                            },
                            { key: "consent_at", header: "Consent recorded", render: (r) => formatDate(r.consent_at) }
                          ]}
                          rows={rows ?? []}
                          empty="No subscribers match these filters."
                        />
                      )}
                    </Async>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
