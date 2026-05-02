import { motion } from "framer-motion";

export default function PageHero({ eyebrow, title, em, sub, photo, kicker, children }) {
  return (
    <section className="mx-auto max-w-7xl px-6 pt-14 pb-8 md:grid md:grid-cols-[1.2fr_1fr] md:gap-12 md:items-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1 className="mt-2 font-display text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
          {title}{" "}
          {em && <em className="font-hand text-[1.2em] font-bold not-italic seasoned">{em}</em>}
        </h1>
        {sub && <p className="mt-4 max-w-prose text-lg text-ink-2">{sub}</p>}
        {kicker}
      </motion.div>

      {photo && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative mt-8 aspect-[4/3] md:mt-0"
        >
          <span className="absolute -right-3 -top-3 z-0 h-24 w-24 rounded-full seasoned-bg" />
          <span className="absolute -left-4 -bottom-4 z-0 h-16 w-16 rounded-full bg-sun" />
          <img
            src={photo}
            alt=""
            className="relative z-10 h-full w-full rounded-xl4 object-cover shadow-big"
          />
          {children}
        </motion.div>
      )}
    </section>
  );
}
