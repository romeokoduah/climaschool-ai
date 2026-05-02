import PageHero from "../components/PageHero.jsx";
import SeasonCard from "../components/SeasonCard.jsx";
import { seasons, seasonOrder } from "../data/seasons";
import { photos } from "../lib/photos";
import { useEffect } from "react";

const monthIndexToSeason = (m) => {
  if (m >= 10 || m <= 1) return "harmattan";
  if (m === 2 || m === 3) return "dryheat";
  if (m >= 4 && m <= 6)   return "firstrains";
  return "secondrains";
};

export default function SeasonsPage() {
  useEffect(() => { document.body.dataset.season = "dryheat"; }, []);
  const current = monthIndexToSeason(new Date().getMonth());

  return (
    <>
      <PageHero
        eyebrow="Ghana's climate-health calendar"
        title="Four seasons. Four playbooks."
        em="One engine."
        sub="Each season produces a sharply different child-health profile. Tap any season to load the live advisory the platform is dispatching."
        photo={photos.classroom}
      />

      <section className="mx-auto max-w-7xl px-6 pb-12">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {seasonOrder.map((k) => (
            <SeasonCard key={k} keyName={k} season={seasons[k]} isCurrent={k === current} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[photos.community, photos.child, photos.school, photos.classroom].map((p, i) => (
            <figure key={i} className="aspect-square overflow-hidden rounded-xl3 shadow-soft">
              <img src={p} alt="" className="h-full w-full object-cover transition duration-500 hover:scale-105" />
            </figure>
          ))}
        </div>
      </section>
    </>
  );
}
