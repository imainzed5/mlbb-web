import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageContainerProps<T extends ElementType = "div"> = {
  as?: T;
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export function PageContainer<T extends ElementType = "div">({
  as,
  children,
  className,
  ...props
}: PageContainerProps<T>) {
  const Component = as ?? "div";

  return (
    <Component className="px-4 sm:px-6 lg:px-8" {...props}>
      <div className={cn("mx-auto w-full max-w-[1280px]", className)}>{children}</div>
    </Component>
  );
}