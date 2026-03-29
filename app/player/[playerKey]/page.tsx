import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";

import { PageContainer } from "@/components/layout/PageContainer";
import { PlayerLogoutButton } from "@/components/player/PlayerLogoutButton";
import { StateMessage } from "@/components/ui/StateMessage";
import {
  buildPlayerRouteKey,
  getPlayerSession,
} from "@/lib/auth/session";
import { getPlayerDashboardData } from "@/lib/player/getPlayerDashboardData";
import { createPageMetadata } from "@/lib/seo/metadata";
import { getErrorMessage } from "@/lib/mlbb/errors";

type PlayerDashboardPageProps = {
  params: Promise<{ playerKey: string }>;
};

function getPlayerInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export async function generateMetadata({
  params,
}: PlayerDashboardPageProps): Promise<Metadata> {
  const { playerKey } = await params;

  return createPageMetadata({
    title: `Player Dashboard ${playerKey}`,
    description: "Private MLBB player dashboard for connected account data.",
    noIndex: true,
    path: `/player/${playerKey}`,
  });
}

export default async function PlayerDashboardPage({
  params,
}: PlayerDashboardPageProps) {
  const { playerKey } = await params;
  const session = await getPlayerSession();

  if (!session) {
    redirect("/player");
  }

  const canonicalPlayerKey = buildPlayerRouteKey(session.roleId, session.zoneId);

  if (playerKey !== canonicalPlayerKey) {
    redirect(`/player/${canonicalPlayerKey}`);
  }

  try {
    const dashboardData = await getPlayerDashboardData(session);
    const { profile, stats } = dashboardData;

    return (
      <main>
        <PageContainer className="space-y-7 py-8 sm:space-y-9 sm:py-10">
          <section
            className="grid gap-7 rounded-[28px] bg-card-surface p-5 sm:p-6 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start"
            style={{ border: "0.5px solid var(--border-subtle)" }}
          >
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center rounded-full bg-accent-surface px-3 py-1 text-[11px] font-medium tracking-[0.14em] text-accent-text uppercase">
                  Private dashboard
                </div>
                <span className="text-[12px] text-text-secondary">
                  Role ID {profile.roleId} / Zone ID {profile.zoneId}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex size-20 items-center justify-center overflow-hidden rounded-2xl bg-card-surface-strong text-[20px] font-medium text-text-secondary">
                  {getPlayerInitials(profile.name)}
                  {profile.avatar ? (
                    <Image
                      src={profile.avatar}
                      alt={profile.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : null}
                </div>

                <div>
                  <h1 className="text-[28px] font-medium tracking-[-0.04em] text-text-primary sm:text-[34px]">
                    {profile.name}
                  </h1>
                  <p className="mt-2 text-[14px] leading-7 text-text-secondary">
                    Connected MLBB account summary with season history, recent matches, and most-played heroes.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl bg-page-background/70 p-4" style={{ border: "0.5px solid var(--border-subtle)" }}>
                  <div className="text-[11px] text-text-muted">Current rank</div>
                  <div className="mt-2 text-[16px] font-medium text-text-primary">
                    {profile.rankLevel ?? "Unavailable"}
                  </div>
                </div>
                <div className="rounded-xl bg-page-background/70 p-4" style={{ border: "0.5px solid var(--border-subtle)" }}>
                  <div className="text-[11px] text-text-muted">Highest rank</div>
                  <div className="mt-2 text-[16px] font-medium text-text-primary">
                    {profile.historyRankLevel ?? "Unavailable"}
                  </div>
                </div>
                <div className="rounded-xl bg-page-background/70 p-4" style={{ border: "0.5px solid var(--border-subtle)" }}>
                  <div className="text-[11px] text-text-muted">Level</div>
                  <div className="mt-2 text-[16px] font-medium text-text-primary">
                    {profile.level ?? "--"}
                  </div>
                </div>
                <div className="rounded-xl bg-page-background/70 p-4" style={{ border: "0.5px solid var(--border-subtle)" }}>
                  <div className="text-[11px] text-text-muted">Region</div>
                  <div className="mt-2 text-[16px] font-medium text-text-primary">
                    {profile.regCountry ?? "Unknown"}
                  </div>
                </div>
              </div>
            </div>

            <PlayerLogoutButton />
          </section>

          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-2xl bg-card-surface p-4" style={{ border: "0.5px solid var(--border-subtle)" }}>
              <div className="text-[11px] font-medium tracking-[0.16em] text-text-muted uppercase">Win rate</div>
              <div className="mt-3 text-[20px] font-medium text-success-soft">
                {stats.winRate === null ? "--" : `${stats.winRate.toFixed(1)}%`}
              </div>
            </article>
            <article className="rounded-2xl bg-card-surface p-4" style={{ border: "0.5px solid var(--border-subtle)" }}>
              <div className="text-[11px] font-medium tracking-[0.16em] text-text-muted uppercase">Matches played</div>
              <div className="mt-3 text-[20px] font-medium text-text-primary">{stats.totalMatches}</div>
            </article>
            <article className="rounded-2xl bg-card-surface p-4" style={{ border: "0.5px solid var(--border-subtle)" }}>
              <div className="text-[11px] font-medium tracking-[0.16em] text-text-muted uppercase">Average score</div>
              <div className="mt-3 text-[20px] font-medium text-accent-text">
                {stats.averageScore === null ? "--" : stats.averageScore.toFixed(1)}
              </div>
            </article>
            <article className="rounded-2xl bg-card-surface p-4" style={{ border: "0.5px solid var(--border-subtle)" }}>
              <div className="text-[11px] font-medium tracking-[0.16em] text-text-muted uppercase">MVP / streak</div>
              <div className="mt-3 text-[20px] font-medium text-text-primary">
                {stats.mvpCount} / {stats.winStreak}
              </div>
            </article>
          </section>

          <div className="grid gap-7 2xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
            <section className="space-y-4 rounded-2xl bg-card-surface p-4 sm:p-5" style={{ border: "0.5px solid var(--border-subtle)" }}>
              <div>
                <h2 className="text-[18px] font-medium text-text-primary">Recent matches</h2>
                <p className="mt-1 text-[12px] leading-6 text-text-secondary">
                  The latest matches returned by the connected MLBB account feed.
                </p>
              </div>

              {dashboardData.matches.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.matches.map((match) => (
                    <article
                      key={match.battleId}
                      className="grid gap-3 rounded-xl bg-page-background/70 p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
                      style={{ border: "0.5px solid var(--border-subtle)" }}
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[14px] font-medium text-text-primary">{match.heroName}</span>
                          <span className={match.result === "Win" ? "text-[11px] text-success-soft" : "text-[11px] text-rose-300"}>
                            {match.result}
                          </span>
                          {match.isMvp ? <span className="text-[11px] text-accent-text">MVP</span> : null}
                        </div>
                        <div className="mt-2 text-[12px] text-text-secondary">
                          {match.kills}/{match.deaths}/{match.assists} KDA · {match.laneLabel}
                          {match.score !== null ? ` · ${match.score.toFixed(1)} score` : ""}
                        </div>
                      </div>
                      <div className="text-[11px] text-text-muted md:text-right">
                        <div>Season {match.seasonId ?? "--"}</div>
                        <div className="mt-1">
                          {match.playedAt
                            ? new Intl.DateTimeFormat("en-US", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              }).format(new Date(match.playedAt))
                            : "Unknown date"}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <StateMessage
                  title="No recent matches returned"
                  description="The upstream player endpoint did not return recent match rows for this connected account."
                  tone="muted"
                />
              )}
            </section>

            <div className="space-y-5">
              <section className="space-y-4 rounded-2xl bg-card-surface p-4 sm:p-5" style={{ border: "0.5px solid var(--border-subtle)" }}>
                <div>
                  <h2 className="text-[18px] font-medium text-text-primary">Most played heroes</h2>
                  <p className="mt-1 text-[12px] leading-6 text-text-secondary">
                    Frequent heroes from the connected account feed.
                  </p>
                </div>

                {dashboardData.frequentHeroes.length > 0 ? (
                  <div className="space-y-3">
                    {dashboardData.frequentHeroes.map((hero) => (
                      <article
                        key={hero.heroId}
                        className="rounded-xl bg-page-background/70 p-4"
                        style={{ border: "0.5px solid var(--border-subtle)" }}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-[14px] font-medium text-text-primary">{hero.name}</div>
                            <div className="mt-1 text-[12px] text-text-secondary">
                              {hero.matches} matches · {hero.wins} wins
                            </div>
                          </div>
                          <div className="text-right text-[11px] text-text-secondary">
                            <div>{hero.winRate === null ? "--" : `${hero.winRate.toFixed(1)}% WR`}</div>
                            <div className="mt-1 text-text-muted">
                              {hero.power === null ? "Power unavailable" : `Power ${hero.power.toFixed(0)}`}
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <StateMessage
                    title="No frequent heroes returned"
                    description="The frequent heroes endpoint did not return usable rows for this connected account."
                    tone="muted"
                  />
                )}
              </section>

              <section className="space-y-4 rounded-2xl bg-card-surface p-4 sm:p-5" style={{ border: "0.5px solid var(--border-subtle)" }}>
                <div>
                  <h2 className="text-[18px] font-medium text-text-primary">Season history</h2>
                  <p className="mt-1 text-[12px] leading-6 text-text-secondary">
                    Season IDs currently exposed by the connected account.
                  </p>
                </div>

                {dashboardData.seasonIds.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {dashboardData.seasonIds.map((seasonId) => (
                      <span
                        key={seasonId}
                        className="rounded-full bg-page-background px-3 py-1.5 text-[11px] font-medium text-text-secondary"
                        style={{ border: "0.5px solid var(--border-subtle)" }}
                      >
                        S{seasonId}
                      </span>
                    ))}
                  </div>
                ) : (
                  <StateMessage
                    title="No season history returned"
                    description="The season endpoint did not expose season IDs for this connected account."
                    tone="muted"
                  />
                )}
              </section>

              <section className="space-y-4 rounded-2xl bg-card-surface p-4 sm:p-5" style={{ border: "0.5px solid var(--border-subtle)" }}>
                <div>
                  <h2 className="text-[18px] font-medium text-text-primary">Performance highlights</h2>
                  <p className="mt-1 text-[12px] leading-6 text-text-secondary">
                    Personal bests and account-level hero callouts from the stats feed.
                  </p>
                </div>

                {stats.highlights.length > 0 ? (
                  <div className="space-y-3">
                    {stats.highlights.map((highlight) => (
                      <article
                        key={`${highlight.label}-${highlight.name}`}
                        className="rounded-xl bg-page-background/70 p-4"
                        style={{ border: "0.5px solid var(--border-subtle)" }}
                      >
                        <div className="text-[11px] text-text-muted">{highlight.label}</div>
                        <div className="mt-2 text-[14px] font-medium text-text-primary">{highlight.name}</div>
                        <div className="mt-1 text-[12px] text-text-secondary">{highlight.value}</div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <StateMessage
                    title="No player highlights returned"
                    description="The stats endpoint did not expose hero highlight rows for this connected account."
                    tone="muted"
                  />
                )}
              </section>
            </div>
          </div>
        </PageContainer>
      </main>
    );
  } catch (error) {
    return (
      <main>
        <PageContainer className="py-10">
          <StateMessage
            title="Unable to load player dashboard"
            description={`${getErrorMessage(error)} Reconnect the account if the session has expired.`}
            tone="error"
          />
        </PageContainer>
      </main>
    );
  }
}