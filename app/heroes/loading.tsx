import { PageContainer } from "@/components/layout/PageContainer";
import { HeroCardSkeleton } from "@/components/heroes/HeroCardSkeleton";

export default function Loading() {
  return (
    <main>
      <PageContainer className="space-y-6 py-10 sm:py-12">
        <div className="h-6 w-28 animate-pulse rounded bg-card-surface" />
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-[68px] animate-pulse rounded-lg bg-card-surface"
            />
          ))}
        </div>
        <div className="h-12 animate-pulse rounded-lg bg-card-surface" />
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] sm:gap-3.5 lg:grid-cols-[repeat(auto-fill,minmax(176px,1fr))] lg:gap-4 xl:grid-cols-[repeat(auto-fill,minmax(184px,1fr))]">
          {Array.from({ length: 12 }).map((_, index) => (
            <HeroCardSkeleton key={index} />
          ))}
        </div>
      </PageContainer>
    </main>
  );
}