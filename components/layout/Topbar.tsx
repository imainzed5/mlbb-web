"use client";

import { BarChart3, Home, LayoutGrid, Menu, Trophy, UserRound } from "lucide-react";
import { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import { HeroSearch } from "./HeroSearch";
import { PageContainer } from "./PageContainer";
import { accountNavItem, isActivePath, primaryNavItems } from "./navigation";

const mobileTabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/heroes", label: "Tier List", icon: LayoutGrid },
  { href: "/meta", label: "Meta", icon: BarChart3 },
  { href: "/esports", label: "Esports", icon: Trophy },
];

const mobileMoreItems = [...primaryNavItems.filter((item) => !mobileTabs.some((tab) => tab.href === item.href)), accountNavItem];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/70";

export function Topbar() {
  const pathname = usePathname();
  const more = useRef<HTMLDialogElement>(null);
  const moreActive = mobileMoreItems.some((item) => isActivePath(pathname, item.href));
  const accountActive = isActivePath(pathname, accountNavItem.href);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border-subtle bg-nav-surface/95 backdrop-blur-md">
        <PageContainer>
          <div className="flex h-14 items-center gap-3 sm:gap-6">
            <Link href="/" className={cn("shrink-0 text-[18px] font-medium tracking-[-0.03em]", focusRing)}>
              <span className="text-text-primary">mlbb</span>
              <span className="text-accent-primary">stats</span>
            </Link>

            <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Primary">
              {primaryNavItems.map((item) => {
                const active = isActivePath(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "rounded-sm px-2.5 py-1.5 text-[13px] font-medium transition-colors",
                      focusRing,
                      active ? "bg-surface-raised text-text-primary" : "text-text-secondary hover:text-text-primary"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <HeroSearch className="ml-auto w-full max-w-[300px] min-w-0" placeholder="Search heroes" />

            <Link
              href={accountNavItem.href}
              title="Account"
              aria-label="Account"
              aria-current={accountActive ? "page" : undefined}
              className={cn(
                "hidden size-8 shrink-0 place-items-center rounded-md border transition-colors sm:grid",
                focusRing,
                accountActive
                  ? "border-accent-primary bg-accent-surface text-accent-text"
                  : "border-border-subtle text-text-secondary hover:text-text-primary"
              )}
            >
              <UserRound className="size-4" strokeWidth={2} />
            </Link>
          </div>
        </PageContainer>
      </header>

      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-border-subtle bg-nav-surface/95 px-2 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)] pt-1.5 backdrop-blur-md lg:hidden"
        aria-label="Primary mobile"
      >
        <div className="grid grid-cols-5 gap-1">
          {mobileTabs.map((item) => {
            const active = isActivePath(pathname, item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center gap-1 rounded-md text-[10px] font-medium transition-colors",
                  focusRing,
                  active ? "text-accent-text" : "text-text-secondary"
                )}
              >
                <Icon className="size-4.5" strokeWidth={2} />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            aria-haspopup="dialog"
            onClick={() => more.current?.showModal()}
            className={cn(
              "flex min-h-12 flex-col items-center justify-center gap-1 rounded-md text-[10px] font-medium",
              focusRing,
              moreActive ? "text-accent-text" : "text-text-secondary"
            )}
          >
            <Menu className="size-4.5" strokeWidth={2} />
            <span>More</span>
          </button>
        </div>
      </nav>

      <dialog
        ref={more}
        aria-label="More pages"
        onClick={(event) => {
          if (event.target === more.current) more.current.close();
        }}
        className="mt-auto mb-0 w-full max-w-none rounded-t-lg border border-border-subtle bg-card-surface p-3 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] text-text-primary backdrop:bg-black/60 lg:hidden"
      >
        <nav aria-label="More" className="grid grid-cols-2 gap-2">
          {mobileMoreItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => more.current?.close()}
              aria-current={isActivePath(pathname, item.href) ? "page" : undefined}
              className={cn(
                "rounded-md border border-border-subtle bg-page-background px-3 py-3 text-[13px] font-medium aria-[current=page]:border-accent-primary aria-[current=page]:text-accent-text",
                focusRing
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </dialog>
    </>
  );
}
