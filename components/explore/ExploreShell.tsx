import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";

export const panelClass = "rounded-lg border border-border-subtle bg-card-surface p-5 sm:p-6";
export const fieldClass = "min-h-11 w-full rounded-md border border-border-subtle bg-page-background px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary";
export const actionClass = "inline-flex min-h-11 items-center justify-center rounded-md border border-accent-primary/50 bg-accent-surface px-4 py-2 text-sm font-medium text-accent-text hover:bg-accent-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary disabled:opacity-50";

export function ExploreShell({ title, description, children, back = "/" }: {
  title: string; description: string; children: React.ReactNode; back?: string;
}) {
  return <main><PageContainer className="space-y-6 py-8 pb-28 sm:py-10">
    <Link href={back} className="text-sm text-accent-text hover:underline">← Back</Link>
    <header className="space-y-2"><h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="max-w-3xl text-sm leading-6 text-text-secondary">{description}</p></header>
    {children}
    <p className="text-xs leading-5 text-text-secondary">Powered by <a className="text-accent-text underline" href="https://arena.rone.dev/">Rone Arena API</a> · Game data and artwork © MOONTON / Mobile Legends: Bang Bang. Unofficial community site.</p>
  </PageContainer></main>;
}
