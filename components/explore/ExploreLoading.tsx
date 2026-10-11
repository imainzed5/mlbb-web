import { PageContainer } from "@/components/layout/PageContainer";

export default function ExploreLoading() {
  return <main><PageContainer className="space-y-5 py-8"><p role="status" className="text-sm text-text-secondary">Loading reference data…</p><div aria-hidden="true" className="h-14 w-2/3 animate-pulse rounded-lg bg-card-surface" /><div aria-hidden="true" className="grid gap-4 sm:grid-cols-2"><div className="h-52 animate-pulse rounded-lg bg-card-surface" /><div className="h-52 animate-pulse rounded-lg bg-card-surface" /></div></PageContainer></main>;
}
