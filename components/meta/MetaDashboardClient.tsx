"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { startTransition, useEffect, useState } from "react";

import { RoleBadge } from "@/components/heroes/RoleBadge";
import { TierBadge } from "@/components/heroes/TierBadge";
import { StateMessage } from "@/components/ui/StateMessage";
import {
  HERO_DETAIL_DEFAULT_RANK,
  HERO_DETAIL_RANK_OPTIONS,
  normalizeHeroDetailRank,
} from "@/lib/hero/constants";
import {
  deriveMetaDashboardView,
  META_LANE_OPTIONS,
  META_ROLE_OPTIONS,
  normalizeMetaLane,
  normalizeMetaRole,
} from "@/lib/meta/dashboard";
import type { MetaDashboardData } from "@/lib/meta/types";
import type { HeroBrowserItem } from "@/lib/heroes/types";

type MetaDashboardClientProps = {
  data: MetaDashboardData;
};

function getHeroInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

type MetaHeroRowProps = {
  hero: HeroBrowserItem;
  index: number;
  metricLabel: string;
  metricToneClassName: string;
  metricValue: string;
};

function MetaHeroRow({
  hero,
  index,
  metricLabel,
  metricToneClassName,
  metricValue,
}: MetaHeroRowProps) {
  return (
    <Link
      href={`/heroes/${hero.slug}`}
      className="group flex items-start gap-3 rounded-xl bg-page-background/70 p-3.5 transition-colors hover:border-accent-primary sm:items-center"
      style={{ border: "0.5px solid var(--border-subtle)" }}
    >
      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-card-surface text-[11px] font-medium text-text-secondary">
        {index + 1}
      </div>

      <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-card-surface-strong">
        <div className="absolute inset-0 flex items-center justify-center text-[12px] font-medium tracking-[0.08em] text-text-secondary">
          {getHeroInitials(hero.name)}
        </div>
        {hero.image ? (
          <Image src={hero.image} alt={hero.name} fill sizes="48px" className="object-cover" />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-medium text-text-primary group-hover:text-accent-text">
          {hero.name}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <RoleBadge role={hero.primaryRole} />
          <TierBadge tier={hero.tier} />
        </div>
      </div>

      <div className="shrink-0 text-left sm:text-right">
        <div className="text-[11px] text-text-muted">{metricLabel}</div>
        <div className={`mt-1 text-[12px] font-medium ${metricToneClassName}`}>{metricValue}</div>
      </div>
    </Link>
  );
}

export function MetaDashboardClient({ data }: MetaDashboardClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dashboardData, setDashboardData] = useState(data);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const activeLane = normalizeMetaLane(searchParams.get("lane") ?? data.filters.lane);
  const activeRole = normalizeMetaRole(searchParams.get("role") ?? data.filters.role);
  const activeRank = normalizeHeroDetailRank(searchParams.get("rank") ?? data.filters.rank);
  const view = deriveMetaDashboardView(dashboardData.heroes, activeLane, activeRole);
  const generatedAt = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dashboardData.generatedAt));

  useEffect(() => {
    setDashboardData(data);
    setErrorMessage(null);
    setIsRefreshing(false);
  }, [data]);

  function updateUrl(nextLane: typeof activeLane, nextRole: typeof activeRole, nextRank: typeof activeRank) {
    const nextSearchParams = new URLSearchParams(searchParams.toString());

    if (nextLane === "all") {
      nextSearchParams.delete("lane");
    } else {
      nextSearchParams.set("lane", nextLane);
    }

    if (nextRole === "all") {
      nextSearchParams.delete("role");
    } else {
      nextSearchParams.set("role", nextRole);
    }

    if (nextRank === HERO_DETAIL_DEFAULT_RANK) {
      nextSearchParams.delete("rank");
    } else {
      nextSearchParams.set("rank", nextRank);
    }

    const nextQuery = nextSearchParams.toString();
    const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;

    startTransition(() => {
      router.replace(nextUrl, { scroll: false });
    });
  }

  useEffect(() => {
    if (dashboardData.filters.rank === activeRank) {
      setErrorMessage(null);
      setIsRefreshing(false);
      return;
    }

    const controller = new AbortController();
    let isActive = true;

    async function loadMetaData() {
      setIsRefreshing(true);
      setErrorMessage(null);

      try {
        const response = await fetch(
          `/api/meta?lane=${activeLane}&role=${activeRole}&rank=${activeRank}`,
          {
            signal: controller.signal,
          }
        );
        const payload = (await response.json()) as MetaDashboardData & {
          error?: string;
          message?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error ?? payload.message ?? "Unable to refresh the meta dashboard.");
        }

        if (!isActive) {
          return;
        }

        setDashboardData(payload);
      } catch (error) {
        if (!isActive || controller.signal.aborted) {
          return;
        }

        setErrorMessage(
          error instanceof Error ? error.message : "Unable to refresh the meta dashboard."
        );
      } finally {
        if (isActive) {
          setIsRefreshing(false);
        }
      }
    }

    void loadMetaData();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [activeLane, activeRank, activeRole, dashboardData.filters.rank]);

  return (
    <div className="space-y-6 sm:space-y-7">
      <section
        className="space-y-4 rounded-2xl bg-card-surface p-4 sm:p-5"
        style={{ border: "0.5px solid var(--border-subtle)" }}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-[18px] font-medium text-text-primary">Lane slice</h2>
            <p className="mt-1 text-[12px] leading-6 text-text-secondary">
              Shift the meta board by lane, role, and rank context while keeping the exact state shareable in the URL.
            </p>
          </div>
          <div className="text-[11px] text-text-secondary sm:text-right">
            <div>
              {isRefreshing
                ? "Refreshing rank context..."
                : `Viewing ${view.summary.laneLabel.toLowerCase()} / ${view.summary.roleLabel.toLowerCase()}`}
            </div>
            <div className="mt-1 text-text-muted">Snapshot generated {generatedAt}</div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)]">
          <label className="block">
            <span className="mb-2 block text-[11px] font-medium tracking-[0.16em] text-text-muted uppercase">
              Rank context
            </span>
            <select
              value={activeRank}
              onChange={(event) =>
                updateUrl(activeLane, activeRole, normalizeHeroDetailRank(event.target.value))
              }
              className="w-full rounded-xl bg-page-background px-3 py-2.5 text-[13px] text-text-primary outline-none transition-colors focus:border-accent-primary"
              style={{ border: "0.5px solid var(--border-subtle)" }}
            >
              {HERO_DETAIL_RANK_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="rounded-xl bg-page-background/70 p-4" style={{ border: "0.5px solid var(--border-subtle)" }}>
            <div className="text-[11px] font-medium tracking-[0.16em] text-text-muted uppercase">
              Current read
            </div>
            <div className="mt-2 text-[14px] font-medium text-text-primary">
              {HERO_DETAIL_RANK_OPTIONS.find((option) => option.value === activeRank)?.label} meta
            </div>
            <div className="mt-1 text-[12px] leading-6 text-text-secondary">
              {view.summary.heroCount} heroes match {view.summary.laneLabel.toLowerCase()} and {view.summary.roleLabel.toLowerCase()} in the loaded rank context.
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {META_LANE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateUrl(option.value, activeRole, activeRank)}
              className="rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors"
              style={{
                background:
                  activeLane === option.value ? "#2d2414" : "var(--card-surface)",
                border: activeLane === option.value ? "1px solid #8f6a10" : "0.5px solid var(--border-subtle)",
                color:
                  activeLane === option.value ? "#fcd34d" : "var(--text-secondary)",
                WebkitTextFillColor: activeLane === option.value ? "#fcd34d" : undefined,
              }}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {META_ROLE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateUrl(activeLane, option.value, activeRank)}
              className="rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors"
              style={{
                background:
                  activeRole === option.value ? "#2d2414" : "var(--card-surface)",
                border: activeRole === option.value ? "1px solid #8f6a10" : "0.5px solid var(--border-subtle)",
                color:
                  activeRole === option.value ? "#fcd34d" : "var(--text-secondary)",
                WebkitTextFillColor: activeRole === option.value ? "#fcd34d" : undefined,
              }}
            >
              {option.label}
            </button>
          ))}
        </div>

        {errorMessage ? (
          <StateMessage
            title="Unable to refresh rank context"
            description={`${errorMessage} Showing the last successful rank snapshot instead.`}
            tone="error"
          />
        ) : null}
      </section>

      <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <article className="rounded-2xl bg-card-surface p-4" style={{ border: "0.5px solid var(--border-subtle)" }}>
          <div className="text-[11px] font-medium tracking-[0.16em] text-text-muted uppercase">Highest win rate</div>
          <div className="mt-3 text-[18px] font-medium text-text-primary">{view.summary.topWinHero?.name ?? "No hero"}</div>
          <div className="mt-1 text-[12px] text-success-soft">{view.summary.topWinHero ? `${view.summary.topWinHero.winRate.toFixed(1)}% WR` : "Waiting for data"}</div>
        </article>
        <article className="rounded-2xl bg-card-surface p-4" style={{ border: "0.5px solid var(--border-subtle)" }}>
          <div className="text-[11px] font-medium tracking-[0.16em] text-text-muted uppercase">Highest pick rate</div>
          <div className="mt-3 text-[18px] font-medium text-text-primary">{view.summary.topPickHero?.name ?? "No hero"}</div>
          <div className="mt-1 text-[12px] text-accent-text">{view.summary.topPickHero ? `${view.summary.topPickHero.pickRate.toFixed(1)}% PR` : "Waiting for data"}</div>
        </article>
        <article className="rounded-2xl bg-card-surface p-4" style={{ border: "0.5px solid var(--border-subtle)" }}>
          <div className="text-[11px] font-medium tracking-[0.16em] text-text-muted uppercase">Most contested</div>
          <div className="mt-3 text-[18px] font-medium text-text-primary">{view.summary.topBanHero?.name ?? "No hero"}</div>
          <div className="mt-1 text-[12px] text-warning-soft">{view.summary.topBanHero ? `${view.summary.topBanHero.banRate.toFixed(1)}% BR` : "Waiting for data"}</div>
        </article>
        <article className="rounded-2xl bg-card-surface p-4" style={{ border: "0.5px solid var(--border-subtle)" }}>
          <div className="text-[11px] font-medium tracking-[0.16em] text-text-muted uppercase">Slice size</div>
          <div className="mt-3 text-[18px] font-medium text-text-primary">{view.summary.heroCount} heroes</div>
          <div className="mt-1 text-[12px] text-text-secondary">{view.summary.topTierCount} in S tier</div>
        </article>
      </section>

      {view.filteredHeroes.length > 0 ? (
        <>
          <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
            <section className="space-y-4 rounded-2xl bg-card-surface p-4 sm:p-5" style={{ border: "0.5px solid var(--border-subtle)" }}>
              <div>
                <h2 className="text-[18px] font-medium text-text-primary">Power board</h2>
                <p className="mt-1 text-[12px] leading-6 text-text-secondary">The current win-rate, pick-rate, and ban-rate leaders for the selected lane slice.</p>
              </div>

              <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
                <div className="space-y-3">
                  <div className="text-[12px] font-medium text-text-primary">Win rate leaders</div>
                  {view.powerBoards.winRate.map((hero, index) => (
                    <MetaHeroRow key={`win-${hero.heroId}`} hero={hero} index={index} metricLabel="WR" metricToneClassName="text-success-soft" metricValue={`${hero.winRate.toFixed(1)}%`} />
                  ))}
                </div>
                <div className="space-y-3">
                  <div className="text-[12px] font-medium text-text-primary">Pick rate leaders</div>
                  {view.powerBoards.pickRate.map((hero, index) => (
                    <MetaHeroRow key={`pick-${hero.heroId}`} hero={hero} index={index} metricLabel="PR" metricToneClassName="text-accent-text" metricValue={`${hero.pickRate.toFixed(1)}%`} />
                  ))}
                </div>
                <div className="space-y-3">
                  <div className="text-[12px] font-medium text-text-primary">Ban rate leaders</div>
                  {view.powerBoards.banRate.map((hero, index) => (
                    <MetaHeroRow key={`ban-${hero.heroId}`} hero={hero} index={index} metricLabel="BR" metricToneClassName="text-warning-soft" metricValue={`${hero.banRate.toFixed(1)}%`} />
                  ))}
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="text-[18px] font-medium text-text-primary">Tier map</h2>
                <p className="mt-1 text-[12px] leading-6 text-text-secondary">How the selected lane slice is distributed across the derived S to C tier banding.</p>
              </div>

              <div className="space-y-3">
                {view.tierSnapshots.map((snapshot) => (
                  <article key={snapshot.tier} className="rounded-2xl bg-card-surface p-4" style={{ border: "0.5px solid var(--border-subtle)" }}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <TierBadge tier={snapshot.tier} />
                        <div>
                          <div className="text-[14px] font-medium text-text-primary">Tier {snapshot.tier}</div>
                          <div className="text-[11px] text-text-secondary">{snapshot.count} hero{snapshot.count === 1 ? "" : "es"}</div>
                        </div>
                      </div>
                      <div className="text-right text-[11px] text-text-secondary">
                        <div>Avg WR {snapshot.averageWinRate.toFixed(1)}%</div>
                        <div>Avg PR {snapshot.averagePickRate.toFixed(1)}%</div>
                      </div>
                    </div>
                    {snapshot.leader ? <div className="mt-4 text-[12px] text-text-secondary">Leader: <span className="font-medium text-text-primary">{snapshot.leader.name}</span></div> : null}
                  </article>
                ))}
              </div>
            </section>
          </div>

          <section className="space-y-4 rounded-2xl bg-card-surface p-4 sm:p-5" style={{ border: "0.5px solid var(--border-subtle)" }}>
            <div>
              <h2 className="text-[18px] font-medium text-text-primary">Role pressure board</h2>
              <p className="mt-1 text-[12px] leading-6 text-text-secondary">A role-by-role read on the selected lane slice, built from the same normalized hero contract.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {view.roleSnapshots.map((snapshot) => (
                <article key={snapshot.role} className="rounded-xl bg-page-background/70 p-4" style={{ border: "0.5px solid var(--border-subtle)" }}>
                  <div className="flex items-center justify-between gap-3">
                    <RoleBadge role={snapshot.role} />
                    <span className="text-[11px] text-text-muted">{snapshot.count} heroes</span>
                  </div>
                  <div className="mt-4">
                    <div className="text-[11px] text-text-muted">Role leader</div>
                    <div className="mt-1 text-[15px] font-medium text-text-primary">{snapshot.leader?.name ?? "No leader"}</div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-[11px]">
                    <div><div className="text-text-muted">Avg WR</div><div className="mt-1 font-medium text-success-soft">{snapshot.averageWinRate.toFixed(1)}%</div></div>
                    <div><div className="text-text-muted">Avg PR</div><div className="mt-1 font-medium text-accent-text">{snapshot.averagePickRate.toFixed(1)}%</div></div>
                    <div><div className="text-text-muted">Avg BR</div><div className="mt-1 font-medium text-warning-soft">{snapshot.averageBanRate.toFixed(1)}%</div></div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="space-y-4 rounded-2xl bg-card-surface p-4 sm:p-5" style={{ border: "0.5px solid var(--border-subtle)" }}>
            <div>
              <h2 className="text-[18px] font-medium text-text-primary">Meta comparisons</h2>
              <p className="mt-1 text-[12px] leading-6 text-text-secondary">Compare rising, contested, and safer power picks within the currently selected lane slice.</p>
            </div>
            <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
              {view.comparisons.map((group) => (
                <section key={group.key} className="space-y-3">
                  <div>
                    <h3 className="text-[14px] font-medium text-text-primary">{group.title}</h3>
                    <p className="mt-1 text-[12px] leading-6 text-text-secondary">{group.description}</p>
                  </div>
                  {group.heroes.map((hero, index) => (
                    <MetaHeroRow
                      key={`${group.key}-${hero.heroId}`}
                      hero={hero}
                      index={index}
                      metricLabel={group.key === "contested" ? "BR" : group.key === "rising" ? "PR" : "WR"}
                      metricToneClassName={group.key === "contested" ? "text-warning-soft" : group.key === "rising" ? "text-accent-text" : "text-success-soft"}
                      metricValue={group.key === "contested" ? `${hero.banRate.toFixed(1)}%` : group.key === "rising" ? `${hero.pickRate.toFixed(1)}%` : `${hero.winRate.toFixed(1)}%`}
                    />
                  ))}
                </section>
              ))}
            </div>
          </section>

          <div className="grid gap-6 2xl:grid-cols-2">
            <section className="space-y-4 rounded-2xl bg-card-surface p-4 sm:p-5" style={{ border: "0.5px solid var(--border-subtle)" }}>
              <div>
                <h2 className="text-[18px] font-medium text-text-primary">Most contested heroes</h2>
                <p className="mt-1 text-[12px] leading-6 text-text-secondary">Heroes that are absorbing the most ban pressure in the selected lane slice.</p>
              </div>
              <div className="space-y-3">
                {view.contestedHeroes.map((hero, index) => (
                  <MetaHeroRow key={`contested-${hero.heroId}`} hero={hero} index={index} metricLabel="BR" metricToneClassName="text-warning-soft" metricValue={`${hero.banRate.toFixed(1)}%`} />
                ))}
              </div>
            </section>

            <section className="space-y-4 rounded-2xl bg-card-surface p-4 sm:p-5" style={{ border: "0.5px solid var(--border-subtle)" }}>
              <div>
                <h2 className="text-[18px] font-medium text-text-primary">Flexible draft picks</h2>
                <p className="mt-1 text-[12px] leading-6 text-text-secondary">Multi-role heroes with enough live pick pressure to matter in flexible drafts for the selected lane slice.</p>
              </div>
              {view.flexHeroes.length > 0 ? (
                <div className="space-y-3">
                  {view.flexHeroes.map((hero, index) => (
                    <MetaHeroRow key={`flex-${hero.heroId}`} hero={hero} index={index} metricLabel="Roles" metricToneClassName="text-text-secondary" metricValue={String(hero.roles.length)} />
                  ))}
                </div>
              ) : (
                <StateMessage title="No flex picks surfaced" description="The selected lane slice did not expose enough multi-role entries to build a flex board." tone="muted" />
              )}
            </section>
          </div>
        </>
      ) : (
        <StateMessage title="No heroes found for this lane slice" description="Try switching back to All lanes or another lane filter to restore the meta board." tone="muted" />
      )}

      {dashboardData.stale ? (
        <StateMessage title="Meta dashboard is using stale data" description="One or more upstream hero browser endpoints were unavailable during aggregation, so the dashboard may be temporarily out of date." tone="muted" />
      ) : null}
    </div>
  );
}
