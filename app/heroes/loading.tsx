import { PageContainer } from "@/components/layout/PageContainer";

export default function Loading() {
  return (
    <main>
      <div className="h-[49px] border-b border-border-subtle" />
      <PageContainer className="space-y-5 py-6 sm:py-8">
        <div className="space-y-2">
          <div className="h-7 w-48 animate-pulse rounded-sm bg-card-surface" />
          <div className="h-4 w-96 max-w-full animate-pulse rounded-sm bg-card-surface" />
        </div>
        <div className="h-8 animate-pulse rounded-md bg-card-surface" />
        <div className="overflow-hidden rounded-lg border border-border-subtle">
          {Array.from({ length: 14 }).map((_, index) => (
            <div key={index} className="h-[45px] animate-pulse border-b border-border-subtle bg-card-surface last:border-b-0" />
          ))}
        </div>
      </PageContainer>
    </main>
  );
}
