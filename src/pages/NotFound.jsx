import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-prose flex-col items-start justify-center gap-4 px-6 py-20">
      <span className="eyebrow">404</span>
      <h1 className="font-display text-5xl font-semibold leading-tight md:text-6xl">
        This page drifted{" "}
        <em className="font-hand text-[1.15em] font-bold not-italic text-heat">off the map.</em>
      </h1>
      <p className="text-lg text-ink-2">
        The page you're looking for doesn't exist or may have moved. Let's get you back on track.
      </p>
      <div className="mt-2 flex flex-wrap gap-3">
        <Link to="/" className="btn-primary">
          Back to home <ArrowUpRight className="h-4 w-4" />
        </Link>
        <Link to="/advisory" className="btn-ghost">Browse the advisory</Link>
      </div>
    </section>
  );
}
