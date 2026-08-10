/**
 * Privacy-friendly analytics hook (no-op until configured).
 *
 * To enable a provider (e.g. Plausible, Fathom, GA4), set the script in
 * index.html and point `track` at it. Until then these are safe no-ops so the
 * rest of the app can emit events without guarding every call site.
 *
 * Usage:  import { track, pageview } from "../lib/analytics";
 *         track("engine_run", { preset: "harmattan" });
 */

const enabled =
  typeof window !== "undefined" &&
  typeof import.meta !== "undefined" &&
  import.meta.env?.VITE_ANALYTICS === "on";

export function pageview(path) {
  if (!enabled) return;
  // Example for Plausible: window.plausible?.("pageview", { u: path });
  window.dispatchEvent(new CustomEvent("analytics:pageview", { detail: { path } }));
}

export function track(event, props = {}) {
  if (!enabled) return;
  // Example for Plausible: window.plausible?.(event, { props });
  window.dispatchEvent(new CustomEvent("analytics:event", { detail: { event, props } }));
}
