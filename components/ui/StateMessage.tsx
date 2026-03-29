import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type StateMessageProps = {
  title: string;
  description: ReactNode;
  tone?: "default" | "error" | "muted";
  className?: string;
};

const toneClasses: Record<NonNullable<StateMessageProps["tone"]>, string> = {
  default: "border-border-subtle bg-card-surface text-text-primary",
  error: "border-[#4b2f36] bg-[#251920] text-[#fda4af]",
  muted: "border-border-subtle bg-page-background/60 text-text-secondary",
};

export function StateMessage({
  title,
  description,
  tone = "default",
  className,
}: StateMessageProps) {
  return (
    <div className={cn("rounded-xl border p-5", toneClasses[tone], className)}>
      <h2 className="text-[15px] font-medium">{title}</h2>
      <div className="mt-2 text-[13px] leading-6">{description}</div>
    </div>
  );
}