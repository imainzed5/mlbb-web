import Link from "next/link";

import type { HeroInsight } from "@/lib/hero/types";

type HeroInsightPanelProps = {
  insights: HeroInsight[];
};

export function HeroInsightPanel({ insights }: HeroInsightPanelProps) {
  return (
    <section
      className="space-y-3 rounded-lg bg-card-surface p-4"
      style={{ border: "0.5px solid var(--border-subtle)" }}
    >
      <div>
        <h2 className="text-[14px] font-semibold text-text-primary">Draft notes</h2>
        <p className="mt-1 text-[12px] leading-6 text-text-secondary">
          Quick matchup notes and draft guidance for this hero.
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {insights.map((insight) => (
          <article
            key={insight.title}
            className="space-y-3 rounded-md bg-page-background/70 p-4"
            style={{ border: "0.5px solid var(--border-subtle)" }}
          >
            <div>
              <div className="text-[12px] font-medium text-text-primary">{insight.title}</div>
              <p className="mt-1 text-[12px] leading-6 text-text-secondary">
                {insight.description}
              </p>
            </div>

            {insight.heroes.length > 0 ? (
              <div className="flex flex-wrap gap-2 text-[11px]">
                {insight.heroes.map((hero) => (
                  <Link
                    key={hero.heroId}
                    href={`/heroes/${hero.slug}`}
                    className="rounded-sm bg-card-surface px-2 py-0.5 text-text-secondary transition-colors hover:border-accent-primary hover:text-accent-text"
                    style={{ border: "0.5px solid var(--border-subtle)" }}
                  >
                    {hero.name}
                  </Link>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
