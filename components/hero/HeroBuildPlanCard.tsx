import Image from "next/image";

import type { HeroBuildPlan } from "@/lib/hero/types";

type HeroBuildPlanCardProps = {
  plan: HeroBuildPlan;
};

export function HeroBuildPlanCard({ plan }: HeroBuildPlanCardProps) {
  return (
    <article
      className="space-y-5 rounded-2xl bg-card-surface p-4 sm:p-5"
      style={{ border: "0.5px solid var(--border-subtle)" }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="text-[11px] font-medium tracking-[0.16em] text-accent-text uppercase">
            Recommended build
          </div>
          <div>
            <h3 className="text-[18px] font-medium text-text-primary">{plan.title}</h3>
            {plan.description ? (
              <p className="mt-2 max-w-2xl text-[13px] leading-6 text-text-secondary">
                {plan.description}
              </p>
            ) : null}
          </div>
        </div>

        {plan.creatorName ? (
          <div
            className="flex items-center gap-3 rounded-xl bg-page-background/70 px-3 py-2"
            style={{ border: "0.5px solid var(--border-subtle)" }}
          >
            <div className="relative size-10 overflow-hidden rounded-full bg-card-surface-strong">
              {plan.creatorAvatar ? (
                <Image
                  src={plan.creatorAvatar}
                  alt={plan.creatorName}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              ) : null}
            </div>
            <div>
              <div className="text-[11px] text-text-muted">Plan source</div>
              <div className="text-[13px] font-medium text-text-primary">
                {plan.creatorName}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(240px,0.9fr)]">
        <div className="space-y-4">
          <div>
            <div className="text-[11px] font-medium tracking-[0.16em] text-text-muted uppercase">
              Item sequence
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
              {plan.items.map((item) => (
                <div
                  key={item.name}
                  className="space-y-3 rounded-xl bg-page-background/65 p-3"
                  style={{ border: "0.5px solid var(--border-subtle)" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative size-12 overflow-hidden rounded-xl bg-card-surface-strong">
                      {item.icon ? (
                        <Image
                          src={item.icon}
                          alt={item.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-medium text-text-primary">
                        {item.name}
                      </div>
                      {item.typeLabel ? (
                        <div className="text-[11px] text-text-secondary">{item.typeLabel}</div>
                      ) : null}
                    </div>
                  </div>

                  {item.statText.length > 0 ? (
                    <div className="space-y-1">
                      {item.statText.slice(0, 3).map((line) => (
                        <div key={line} className="text-[11px] leading-5 text-text-secondary">
                          {line}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {plan.battleSpell ? (
            <div
              className="rounded-xl bg-page-background/65 p-4"
              style={{ border: "0.5px solid var(--border-subtle)" }}
            >
              <div className="text-[11px] font-medium tracking-[0.16em] text-text-muted uppercase">
                Battle spell
              </div>
              <div className="mt-3 flex gap-3">
                <div className="relative size-12 overflow-hidden rounded-xl bg-card-surface-strong">
                  {plan.battleSpell.icon ? (
                    <Image
                      src={plan.battleSpell.icon}
                      alt={plan.battleSpell.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div className="space-y-1">
                  <div className="text-[13px] font-medium text-text-primary">
                    {plan.battleSpell.name}
                  </div>
                  {plan.battleSpell.description ? (
                    <div className="text-[11px] leading-5 text-text-secondary">
                      {plan.battleSpell.description}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          {plan.emblem ? (
            <div
              className="rounded-xl bg-page-background/65 p-4"
              style={{ border: "0.5px solid var(--border-subtle)" }}
            >
              <div className="text-[11px] font-medium tracking-[0.16em] text-text-muted uppercase">
                Emblem setup
              </div>
              <div className="mt-3 flex gap-3">
                <div className="relative size-12 overflow-hidden rounded-xl bg-card-surface-strong">
                  {plan.emblem.icon ? (
                    <Image
                      src={plan.emblem.icon}
                      alt={plan.emblem.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="text-[13px] font-medium text-text-primary">
                    {plan.emblem.name}
                  </div>
                  {plan.emblem.bonuses.length > 0 ? (
                    <div className="flex flex-wrap gap-2 text-[11px] text-text-secondary">
                      {plan.emblem.bonuses.slice(0, 4).map((bonus) => (
                        <span
                          key={bonus}
                          className="rounded-full bg-card-surface px-2 py-1"
                          style={{ border: "0.5px solid var(--border-subtle)" }}
                        >
                          {bonus}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  {plan.emblem.talents.length > 0 ? (
                    <div className="space-y-2 pt-1">
                      {plan.emblem.talents.map((talent) => (
                        <div key={`${talent.tier}-${talent.name}`} className="flex gap-3">
                          <div className="relative mt-0.5 size-8 overflow-hidden rounded-lg bg-card-surface-strong">
                            {talent.icon ? (
                              <Image
                                src={talent.icon}
                                alt={talent.name}
                                fill
                                sizes="32px"
                                className="object-cover"
                              />
                            ) : null}
                          </div>
                          <div>
                            <div className="text-[12px] font-medium text-text-primary">
                              {talent.tier ? `Tier ${talent.tier} · ` : ""}
                              {talent.name}
                            </div>
                            {talent.description ? (
                              <div className="text-[11px] leading-5 text-text-secondary">
                                {talent.description}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}