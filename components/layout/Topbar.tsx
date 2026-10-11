"use client";

import { BarChart3, Compass, Home, Shield, UserRound } from "lucide-react";
import { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import { PageContainer } from "./PageContainer";
import { exploreNavItems, isActivePath, isExplorePath, primaryNavItems } from "./navigation";

const desktopNavItems = primaryNavItems.filter((item) => item.href !== "/");
const mobileNavItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/heroes", label: "Heroes", icon: Shield },
  { href: "/meta", label: "Meta", icon: BarChart3 },
  { href: "explore", label: "Explore", icon: Compass },
  { href: "/player", label: "Account", icon: UserRound },
];

export function Topbar() {
  const pathname = usePathname();
  const explore = useRef<HTMLDialogElement>(null);
  const activeItem = primaryNavItems.find((item) => isActivePath(pathname, item.href));

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-50 bg-nav-surface/95 backdrop-blur-md"
        style={{ borderBottom: "0.5px solid var(--border-subtle)" }}
      >
        <PageContainer>
          <div className="flex h-14 items-center justify-between gap-3 sm:h-16">
            <Link href="/" className="text-[18px] font-medium tracking-[-0.03em]">
              <span className="text-text-primary">mlbb</span>
              <span className="text-accent-primary">stats</span>
            </Link>

            <div className="text-[11px] font-medium tracking-[0.16em] text-text-muted uppercase sm:hidden">
              {isExplorePath(pathname) && !activeItem ? "Explore" : activeItem?.label ?? "Home"}
            </div>

            <nav className="hidden items-center gap-2 sm:flex">
              {desktopNavItems.map((item) => {
                const active = isActivePath(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "shrink-0 rounded-full px-3 py-2 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-nav-surface",
                      active
                        ? "text-highlight-text"
                        : "text-text-secondary hover:text-highlight-text"
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <button type="button" aria-haspopup="dialog" onClick={() => explore.current?.showModal()} className={cn("rounded-full px-3 py-2 text-[13px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary", isExplorePath(pathname) ? "text-highlight-text" : "text-text-secondary")}>Explore</button>
            </nav>
          </div>
        </PageContainer>
      </header>

      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-border-subtle bg-nav-surface/95 px-2 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)] pt-2 backdrop-blur-md sm:hidden"
        aria-label="Primary"
      >
        <div className="grid grid-cols-5 gap-1">
          {mobileNavItems.map((item) => {
            const active = item.href === "explore" ? isExplorePath(pathname) : isActivePath(pathname, item.href);
            const Icon = item.icon;

            if (item.href === "explore") return <button key="explore" type="button" aria-haspopup="dialog" onClick={() => explore.current?.showModal()} className={cn("flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary", active ? "text-highlight-text" : "text-text-secondary")}><Icon className="size-4.5" strokeWidth={2} /><span>Explore</span></button>;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-nav-surface",
                  active
                    ? "text-highlight-text"
                    : "text-text-secondary hover:text-highlight-text"
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="size-4.5" strokeWidth={2} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      <dialog ref={explore} aria-labelledby="explore-title" onClick={event => { if (event.target === explore.current) explore.current.close(); }} className="m-auto w-[min(92vw,440px)] rounded-2xl border border-border-subtle bg-card-surface p-6 text-text-primary shadow-xl backdrop:bg-black/70">
        <div className="mb-5 flex items-center justify-between gap-4"><h2 id="explore-title" className="text-xl font-medium">Explore MLBB Stats</h2><button type="button" autoFocus onClick={() => explore.current?.close()} className="min-h-11 rounded-xl border border-border-subtle px-4 text-sm focus-visible:ring-2 focus-visible:ring-accent-primary">Close</button></div>
        <nav aria-label="Explore" className="space-y-2">{exploreNavItems.map(item => <Link key={item.href} href={item.href} onClick={() => explore.current?.close()} className="block min-h-11 rounded-xl bg-page-background px-4 py-3 text-sm text-accent-text focus-visible:ring-2 focus-visible:ring-accent-primary" aria-current={isActivePath(pathname,item.href) ? "page" : undefined}>{item.label}</Link>)}</nav>
      </dialog>
    </>
  );
}
