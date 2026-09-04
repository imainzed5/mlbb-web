"use client";

import { BarChart3, Crown, Home, Shield, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import { PageContainer } from "./PageContainer";
import { isActivePath, primaryNavItems } from "./navigation";

const desktopNavItems = primaryNavItems.filter((item) => item.href !== "/");
const mobileNavItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/heroes", label: "Heroes", icon: Shield },
  { href: "/heroes/rank", label: "Rank", icon: Crown },
  { href: "/meta", label: "Meta", icon: BarChart3 },
  { href: "/player", label: "Account", icon: UserRound },
];

export function Topbar() {
  const pathname = usePathname();
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
              {activeItem?.label ?? "Home"}
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
            const active = isActivePath(pathname, item.href);
            const Icon = item.icon;

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
    </>
  );
}
