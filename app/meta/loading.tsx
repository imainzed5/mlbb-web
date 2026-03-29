import { PageContainer } from "@/components/layout/PageContainer";

function LoadingCard() {
  return (
    <div
      className="h-28 animate-pulse rounded-2xl bg-card-surface"
      style={{ border: "0.5px solid var(--border-subtle)" }}
    />
  );
}

export default function MetaLoading() {
  return (
    <main>
      <PageContainer className="space-y-8 py-10 sm:py-12">
        <section className="space-y-3">
          <div className="h-7 w-48 animate-pulse rounded-lg bg-card-surface" />
          <div className="h-4 w-full max-w-3xl animate-pulse rounded-lg bg-card-surface" />
        </section>

        <section
          className="space-y-4 rounded-2xl bg-card-surface p-5"
          style={{ border: "0.5px solid var(--border-subtle)" }}
        >
          <div className="h-5 w-40 animate-pulse rounded-lg bg-page-background/80" />
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-2">
          <LoadingCard />
          <LoadingCard />
        </div>
      </PageContainer>
    </main>
  );
}