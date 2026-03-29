export function HeroCardSkeleton() {
  return (
    <article
      className="overflow-hidden rounded-xl bg-card-surface"
      style={{ border: "0.5px solid var(--border-subtle)" }}
    >
      <div className="aspect-[5/4] animate-pulse bg-card-surface-strong sm:aspect-[4/3] lg:aspect-[5/4]" />
      <div className="space-y-3 p-2.5">
        <div className="h-4 w-2/3 animate-pulse rounded bg-card-surface-strong" />
        <div className="flex items-center justify-between gap-2">
          <div className="h-6 w-20 animate-pulse rounded-full bg-card-surface-strong" />
          <div className="h-3 w-10 animate-pulse rounded bg-card-surface-strong" />
        </div>
      </div>
    </article>
  );
}