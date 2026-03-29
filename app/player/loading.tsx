import { PageContainer } from "@/components/layout/PageContainer";

export default function PlayerLoading() {
  return (
    <main>
      <PageContainer className="space-y-6 py-12">
        <div
          className="h-64 animate-pulse rounded-[28px] bg-card-surface"
          style={{ border: "0.5px solid var(--border-subtle)" }}
        />
      </PageContainer>
    </main>
  );
}