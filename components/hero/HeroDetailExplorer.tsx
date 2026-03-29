"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { startTransition, useEffect, useState } from "react";

import { HeroTrendChart } from "@/components/charts/HeroTrendChart";
import { StateMessage } from "@/components/ui/StateMessage";
import { HeroInsightPanel } from "@/components/hero/HeroInsightPanel";
import {
  HERO_DETAIL_DEFAULT_RANK,
  HERO_DETAIL_DEFAULT_TREND_WINDOW,
  HERO_DETAIL_RANK_OPTIONS,
  HERO_DETAIL_TREND_WINDOW_OPTIONS,
  normalizeHeroDetailRank,
  normalizeHeroTrendWindow,
} from "@/lib/hero/constants";
import type { HeroPageData } from "@/lib/hero/types";

type HeroDetailExplorerProps = {
  initialData: HeroPageData;
  slug: string;
};

export function HeroDetailExplorer({ initialData, slug }: HeroDetailExplorerProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [detailData, setDetailData] = useState(initialData);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const activeRank = normalizeHeroDetailRank(
    searchParams.get("rank") ?? initialData.filters.rank
  );
  const activeTrendWindow = normalizeHeroTrendWindow(
    searchParams.get("days") ?? initialData.filters.trendWindow
  );

  useEffect(() => {
    setDetailData(initialData);
    setErrorMessage(null);
    setIsRefreshing(false);
  }, [initialData, slug]);

  function updateUrl(nextRank: typeof activeRank, nextTrendWindow: typeof activeTrendWindow) {
    const nextSearchParams = new URLSearchParams(searchParams.toString());

    if (nextRank === HERO_DETAIL_DEFAULT_RANK) {
      nextSearchParams.delete("rank");
    } else {
      nextSearchParams.set("rank", nextRank);
    }

    if (nextTrendWindow === HERO_DETAIL_DEFAULT_TREND_WINDOW) {
      nextSearchParams.delete("days");
    } else {
      nextSearchParams.set("days", String(nextTrendWindow));
    }

    const nextQuery = nextSearchParams.toString();
    const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;

    startTransition(() => {
      router.replace(nextUrl, { scroll: false });
    });
  }

  useEffect(() => {
    if (
      detailData.overview.slug === slug &&
      detailData.filters.rank === activeRank &&
      detailData.filters.trendWindow === activeTrendWindow
    ) {
      setErrorMessage(null);
      setIsRefreshing(false);
      return;
    }

    const controller = new AbortController();
    let isActive = true;

    async function loadDetailData() {
      setIsRefreshing(true);
      setErrorMessage(null);

      try {
        const response = await fetch(
          `/api/heroes/${slug}/detail?rank=${activeRank}&days=${activeTrendWindow}`,
          {
            signal: controller.signal,
          }
        );
        const payload = (await response.json()) as HeroPageData & {
          error?: string;
          message?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error ?? payload.message ?? "Unable to refresh hero detail.");
        }

        if (!isActive) {
          return;
        }

        setDetailData(payload);
      } catch (error) {
        if (!isActive || controller.signal.aborted) {
          return;
        }

        setErrorMessage(
          error instanceof Error ? error.message : "Unable to refresh hero detail."
        );
      } finally {
        if (isActive) {
          setIsRefreshing(false);
        }
      }
    }

    void loadDetailData();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [activeRank, activeTrendWindow, initialData, slug]);

  const latestTrend = detailData.trends[detailData.trends.length - 1] ?? null;
  const generatedAt = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(detailData.generatedAt));

  return (
    <div className="min-w-0 space-y-5">
      <section
        className="space-y-4 rounded-2xl bg-card-surface p-4 sm:p-5"
        style={{ border: "0.5px solid var(--border-subtle)" }}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[18px] font-medium text-text-primary">
              Matchup and trend controls
            </h2>
            <p className="mt-1 text-[12px] leading-6 text-text-secondary">
              Switch rank context and trend window without leaving the hero page, then share the exact view via the URL.
            </p>
          </div>
          <div className="text-[11px] text-text-secondary sm:text-right">
            <div>{isRefreshing ? "Refreshing modules..." : `Last sync ${generatedAt}`}</div>
            <div className="mt-1 text-text-muted">
              Viewing {HERO_DETAIL_RANK_OPTIONS.find((option) => option.value === activeRank)?.label.toLowerCase()} and {activeTrendWindow} day trends
            </div>
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
                updateUrl(
                  normalizeHeroDetailRank(event.target.value),
                  activeTrendWindow
                )
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

          <div className="min-w-0">
            <div className="mb-2 text-[11px] font-medium tracking-[0.16em] text-text-muted uppercase">
              Trend window
            </div>
            <div className="flex flex-wrap gap-2">
              {HERO_DETAIL_TREND_WINDOW_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateUrl(activeRank, option.value)}
                  className="rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors"
                  style={{
                    background:
                      activeTrendWindow === option.value
                        ? "#2d2414"
                        : "var(--card-surface)",
                    border: activeTrendWindow === option.value ? "1px solid #8f6a10" : "0.5px solid var(--border-subtle)",
                    color:
                      activeTrendWindow === option.value
                        ? "#fcd34d"
                        : "var(--text-secondary)",
                    WebkitTextFillColor:
                      activeTrendWindow === option.value ? "#fcd34d" : undefined,
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {detailData.stale ? (
          <p className="text-[12px] leading-6 text-text-secondary">
            Some optional modules are using fallback data because an upstream endpoint is temporarily unavailable.
          </p>
        ) : null}

        {errorMessage ? (
          <StateMessage
            title="Unable to refresh controlled modules"
            description={`${errorMessage} Showing the last successful result instead.`}
            tone="error"
          />
        ) : null}
      </section>

      <section
        className="space-y-4 rounded-2xl bg-card-surface p-4 sm:p-5"
        style={{ border: "0.5px solid var(--border-subtle)" }}
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-[18px] font-medium text-text-primary">Performance trends</h2>
            <p className="mt-1 text-[12px] leading-6 text-text-secondary">
              Recent win, pick, and ban rate movement for the selected rank and time window.
            </p>
          </div>

          {latestTrend ? (
            <div className="flex flex-wrap gap-2 text-[11px]">
              <span
                className="rounded-full bg-page-background px-3 py-1.5 text-success-soft"
                style={{ border: "0.5px solid var(--border-subtle)" }}
              >
                {latestTrend.winRate.toFixed(1)}% WR
              </span>
              <span
                className="rounded-full bg-page-background px-3 py-1.5 text-accent-text"
                style={{ border: "0.5px solid var(--border-subtle)" }}
              >
                {latestTrend.pickRate.toFixed(1)}% PR
              </span>
              <span
                className="rounded-full bg-page-background px-3 py-1.5 text-warning-soft"
                style={{ border: "0.5px solid var(--border-subtle)" }}
              >
                {latestTrend.banRate.toFixed(1)}% BR
              </span>
            </div>
          ) : null}
        </div>

        {detailData.trends.length > 0 ? (
          <HeroTrendChart points={detailData.trends} />
        ) : (
          <StateMessage
            title="Trend history is unavailable"
            description="The trends endpoint did not return a recent time series for this hero and filter combination."
            tone="muted"
          />
        )}
      </section>

      {detailData.overview.insights.length > 0 ? (
        <HeroInsightPanel insights={detailData.overview.insights} />
      ) : (
        <StateMessage
          title="Draft notes are unavailable"
          description="This hero does not currently expose narrative assist, strong, or weak relation notes."
          tone="muted"
        />
      )}
    </div>
  );
}
