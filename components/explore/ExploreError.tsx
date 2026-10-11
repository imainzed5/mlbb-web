"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { actionClass, panelClass } from "./ExploreShell";

export default function ExploreError({ reset }: { reset: () => void }) {
  return <main><PageContainer className="py-8"><section className={`${panelClass} space-y-4`}><h1 className="text-xl font-medium">Unable to load this section</h1><p className="text-sm text-text-secondary">Please retry. Other sections remain available through navigation.</p><button type="button" className={actionClass} onClick={reset}>Retry loading</button></section></PageContainer></main>;
}
