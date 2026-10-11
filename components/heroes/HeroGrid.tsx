import type { HeroBrowserItem } from "@/lib/heroes/types";

import { HeroCard } from "./HeroCard";

type HeroGridProps = {
  heroes: HeroBrowserItem[];
};

export function HeroGrid({ heroes }: HeroGridProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-[repeat(auto-fill,minmax(120px,1fr))] sm:gap-2.5">
      {heroes.map((hero) => (
        <HeroCard key={hero.heroId} hero={hero} />
      ))}
    </div>
  );
}
