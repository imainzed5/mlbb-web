import { PageContainer } from "@/components/layout/PageContainer";

export default function PlayerDashboardLoading() {
  return (
    <main>
      <PageContainer className="space-y-6 py-10 sm:py-12">
        <div
          className="h-48 animate-pulse rounded-[28px] bg-card-surface"
          style={{ border: "0.5px solid var(--border-subtle)" }}
        />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="h-28 animate-pulse rounded-2xl bg-card-surface" style={{ border: "0.5px solid var(--border-subtle)" }} />
          <div className="h-28 animate-pulse rounded-2xl bg-card-surface" style={{ border: "0.5px solid var(--border-subtle)" }} />
          <div className="h-28 animate-pulse rounded-2xl bg-card-surface" style={{ border: "0.5px solid var(--border-subtle)" }} />
          <div className="h-28 animate-pulse rounded-2xl bg-card-surface" style={{ border: "0.5px solid var(--border-subtle)" }} />
        </div>
      </PageContainer>
    </main>
  );
}