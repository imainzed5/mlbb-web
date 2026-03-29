import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
  titleClassName,
  descriptionClassName,
}: SectionHeadingProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {eyebrow ? (
        <div className="text-[11px] font-medium tracking-[0.16em] text-text-muted uppercase">
          {eyebrow}
        </div>
      ) : null}
      <h1
        className={cn(
          "text-[28px] font-medium tracking-[-0.03em] text-text-primary sm:text-[36px]",
          titleClassName
        )}
      >
        {title}
      </h1>
      {description ? (
        <p className={cn("max-w-2xl text-[13px] text-text-secondary", descriptionClassName)}>
          {description}
        </p>
      ) : null}
    </div>
  );
}