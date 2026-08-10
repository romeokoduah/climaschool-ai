import { Component } from "react";

/**
 * Catches render-time errors anywhere in the tree and shows a recoverable
 * fallback instead of a blank white screen. Production safety net.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Surface to the console; wire to a real reporter (e.g. Sentry) in prod.
    if (import.meta.env.DEV) console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto flex max-w-prose flex-col items-start gap-4 px-6 py-24">
          <span className="eyebrow">something went wrong</span>
          <h1 className="font-display text-3xl font-semibold">This page hit a snag.</h1>
          <p className="text-ink-2">
            An unexpected error stopped this view from loading. Reloading usually fixes it.
            If it keeps happening, please let us know at{" "}
            <a className="border-b-2 border-dashed border-heat text-heat" href="mailto:ecolutionghana@gmail.com">
              ecolutionghana@gmail.com
            </a>.
          </p>
          <button className="btn-primary" onClick={() => window.location.reload()}>
            Reload the page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
