import type { Metadata } from "next";

import { HeroesPageClient } from "@/components/heroes/HeroesPageClient";
import { PageContainer } from "@/components/layout/PageContainer";
import { JsonLd } from "@/components/seo/JsonLd";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StateMessage } from "@/components/ui/StateMessage";
import { getHeroBrowserData } from "@/lib/heroes/getHeroBrowserData";
import { getErrorMessage } from "@/lib/mlbb/errors";
import { createHeroItemListJsonLd } from "@/lib/seo/jsonld";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Heroes",
  description:
    "Browse MLBB heroes by role, tier, pick rate, and win rate in a dense beginner-friendly browser.",
  path: "/heroes",
});

export default async function HeroesPage() {
  try {
    const heroBrowserData = await getHeroBrowserData();

    return (
      <main>
        <PageContainer className="space-y-5 py-8 sm:space-y-6 sm:py-10">
          <JsonLd
            data={createHeroItemListJsonLd({
              description:
                "Browse MLBB heroes by role, tier, pick rate, and win rate in a dense beginner-friendly browser.",
              heroes: heroBrowserData.heroes,
              name: "MLBB Heroes",
              path: "/heroes",
            })}
          />
          <SectionHeading
            title="Heroes"
            description="Explore the full Mobile Legends roster with a fast browser built around role filtering, tier context, and live win-rate data."
            titleClassName="text-[20px]"
            descriptionClassName="text-[13px]"
          />
          <HeroesPageClient initialData={heroBrowserData} />
        </PageContainer>
      </main>
    );
  } catch (error) {
    return (
      <main>
        <PageContainer className="space-y-5 py-8 sm:space-y-6 sm:py-10">
          <SectionHeading
            title="Heroes"
            description="The hero browser could not be loaded from the upstream MLBB API right now."
            titleClassName="text-[20px]"
            descriptionClassName="text-[13px]"
          />
          <StateMessage
            title="Unable to load heroes"
            description={getErrorMessage(error)}
            tone="error"
          />
        </PageContainer>
      </main>
    );
  }
}