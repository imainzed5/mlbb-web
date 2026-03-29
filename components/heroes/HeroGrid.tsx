import type { HeroBrowserItem } from "@/lib/heroes/types";

import { HeroCard } from "./HeroCard";

type HeroGridProps = {
  heroes: HeroBrowserItem[];
};

export function HeroGrid({ heroes }: HeroGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] sm:gap-3.5 lg:grid-cols-[repeat(auto-fill,minmax(176px,1fr))] lg:gap-4 xl:grid-cols-[repeat(auto-fill,minmax(184px,1fr))]">
      {heroes.map((hero) => (
        <HeroCard key={hero.heroId} hero={hero} />
      ))}
    </div>
  );
}