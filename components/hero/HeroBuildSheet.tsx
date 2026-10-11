"use client";

import Image from "next/image";
import { ChevronRight, Copy } from "lucide-react";
import { useState } from "react";

import { CatalogReference } from "@/components/academy/CatalogReference";
import type { HeroBuildPlan } from "@/lib/hero/types";
import { cn } from "@/lib/utils";

function Icon({ src, alt, size = 48 }: { src: string | null; alt: string; size?: number }) {
  return (
    <span className="relative block shrink-0 overflow-hidden rounded-md border border-border-strong bg-surface-raised" style={{ width: size, height: size }}>
      {src ? <Image src={src} alt={alt} fill sizes={`${size}px`} className="object-cover" /> : null}
    </span>
  );
}

function buildText(heroName: string, plan: HeroBuildPlan) {
  return [
    `${heroName} build: ${plan.title}`,
    `Items: ${plan.items.map((item) => item.name).join(" > ")}`,
    plan.emblem ? `Emblem: ${plan.emblem.name}${plan.emblem.talents.length ? ` (${plan.emblem.talents.map((talent) => talent.name).join(", ")})` : ""}` : null,
    plan.battleSpell ? `Battle spell: ${plan.battleSpell.name}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

function SkillPriority({ skills }: { skills: string[] }) {
  if (skills.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="eyebrow mr-1.5">Skill priority</span>
      {skills.map((skill, index) => (
        <span key={`${skill}-${index}`} className="flex items-center gap-1.5">
          <span
            className={cn(
              "grid h-7 min-w-7 place-items-center rounded-md border px-1.5 text-[12px] font-semibold",
              index === 0 ? "border-tier-s text-tier-s" : "border-border-strong bg-surface-raised"
            )}
          >
            {/^\d+$/.test(skill) ? `S${skill}` : skill}
          </span>
          {index < skills.length - 1 ? <ChevronRight className="size-3.5 text-text-muted" aria-hidden /> : null}
        </span>
      ))}
    </div>
  );
}

type HeroBuildSheetProps = {
  heroName: string;
  plans: HeroBuildPlan[];
  skillPriority: string[];
};

export function HeroBuildSheet({ heroName, plans, skillPriority }: HeroBuildSheetProps) {
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const plan = plans[active] ?? plans[0];

  if (!plan) {
    return (
      <div className="space-y-3 rounded-lg border border-border-subtle bg-card-surface p-4">
        <h2 className="text-[14px] font-semibold">Recommended build</h2>
        <p className="text-[13px] text-text-secondary">No recommended build is available for {heroName} right now.</p>
        <SkillPriority skills={skillPriority} />
      </div>
    );
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(buildText(heroName, plan));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-4 rounded-lg border border-border-subtle bg-card-surface p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-[14px] font-semibold">Recommended build</h2>
        {plan.creatorName ? <span className="text-[11.5px] text-text-muted">by {plan.creatorName}</span> : null}
        <button
          type="button"
          onClick={copy}
          className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-accent-primary bg-accent-surface px-2.5 py-1 text-[12px] text-accent-text hover:bg-accent-primary/20"
        >
          <Copy className="size-3.5" aria-hidden />
          {copied ? "Copied" : "Copy build"}
        </button>
      </div>

      {plans.length > 1 ? (
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Build variants">
          {plans.map((item, index) => (
            <button
              key={`${item.title}-${index}`}
              type="button"
              role="tab"
              aria-selected={index === active}
              onClick={() => setActive(index)}
              className={cn(
                "rounded-sm border px-2 py-0.5 text-[12px]",
                index === active ? "border-accent-primary text-accent-text" : "border-border-subtle text-text-secondary hover:text-text-primary"
              )}
            >
              {item.title}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-[12.5px] text-text-secondary">{plan.title}</p>
      )}

      <ol className="flex flex-wrap items-center gap-x-1 gap-y-3" aria-label="Item build order">
        {plan.items.map((item, index) => (
          <li key={`${item.name}-${index}`} className="flex items-center gap-1">
            <div className="group relative" title={[item.name, ...item.statText.slice(0, 3)].join("\n")}>
              <Icon src={item.icon} alt={item.name} />
              <span className="num absolute -left-1.5 -top-1.5 rounded-[4px] border border-border-strong bg-page-background px-1 text-[10px] text-text-muted">
                {index + 1}
              </span>
              <span className="mt-1 block w-12 truncate text-center text-[10.5px] text-text-secondary">
                <CatalogReference kind="items" name={item.name} id={item.catalogId} />
              </span>
            </div>
            {index < plan.items.length - 1 ? <ChevronRight className="mb-4 size-3.5 text-text-muted" aria-hidden /> : null}
          </li>
        ))}
      </ol>

      <div className="grid gap-3 sm:grid-cols-2">
        {plan.emblem ? (
          <div className="rounded-md border border-border-subtle bg-page-background p-3">
            <div className="eyebrow">Emblem</div>
            <div className="mt-2 flex items-center gap-2.5">
              <Icon src={plan.emblem.icon} alt={plan.emblem.name} size={36} />
              <div className="min-w-0 text-[13px] font-semibold">
                <CatalogReference kind="emblems" name={plan.emblem.name} />
              </div>
            </div>
            {plan.emblem.talents.length > 0 ? (
              <ul className="mt-2.5 flex flex-wrap gap-2">
                {plan.emblem.talents.map((talent) => (
                  <li key={`${talent.tier}-${talent.name}`} className="flex items-center gap-1.5 text-[12px] text-text-secondary" title={talent.description ?? undefined}>
                    <Icon src={talent.icon} alt="" size={22} />
                    <CatalogReference kind="emblems" name={talent.name} id={talent.catalogId} />
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        {plan.battleSpell ? (
          <div className="rounded-md border border-border-subtle bg-page-background p-3">
            <div className="eyebrow">Battle spell</div>
            <div className="mt-2 flex items-center gap-2.5">
              <Icon src={plan.battleSpell.icon} alt={plan.battleSpell.name} size={36} />
              <div className="min-w-0">
                <div className="text-[13px] font-semibold">
                  <CatalogReference kind="spells" name={plan.battleSpell.name} id={plan.battleSpell.catalogId} />
                </div>
                {plan.battleSpell.description ? (
                  <p className="line-clamp-2 text-[11.5px] text-text-secondary">{plan.battleSpell.description}</p>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <SkillPriority skills={skillPriority} />

      {plan.description ? <p className="text-[12.5px] leading-6 text-text-secondary">{plan.description}</p> : null}
    </div>
  );
}
