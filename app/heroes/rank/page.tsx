import type { Metadata } from "next";

import { HeroRankBoardClient } from "@/components/heroes/HeroRankBoardClient";
import { PageContainer } from "@/components/layout/PageContainer";
import { JsonLd } from "@/components/seo/JsonLd";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StateMessage } from "@/components/ui/StateMessage";
import { getHeroBrowserData } from "@/lib/heroes/getHeroBrowserData";
import { getErrorMessage } from "@/lib/mlbb/errors";
import { createHeroItemListJsonLd } from "@/lib/seo/jsonld";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Hero Rank",
  description:
    "Track MLBB hero rankings with tier grouping plus live win, pick, and ban rate context.",
  path: "/heroes/rank",
});

export default async function HeroRankPage() {
  try {
    const heroBrowserData = await getHeroBrowserData();

    return (
      <main>
        <PageContainer className="space-y-5 py-8 sm:space-y-6 sm:py-10">
          <JsonLd
            data={createHeroItemListJsonLd({
              description:
                "Track MLBB hero rankings with tier grouping plus live win, pick, and ban rate context.",
              heroes: heroBrowserData.heroes,
              name: "MLBB Hero Rank Board",
              path: "/heroes/rank",
            })}
          />
          <SectionHeading
            title="Hero Rank"
            description="A denser ranking board for the current MLBB roster with tier grouping, fast filters, and live win, pick, and ban rate context."
            titleClassName="text-[20px]"
            descriptionClassName="text-[13px]"
          />
          <HeroRankBoardClient heroes={heroBrowserData.heroes} />
        </PageContainer>
      </main>
    );
  } catch (error) {
    return (
      <main>
        <PageContainer className="space-y-5 py-8 sm:space-y-6 sm:py-10">
          <SectionHeading
            title="Hero Rank"
            description="The ranking board could not be loaded from the upstream MLBB API right now."
            titleClassName="text-[20px]"
            descriptionClassName="text-[13px]"
          />
          <StateMessage
            title="Unable to load rank board"
            description={getErrorMessage(error)}
            tone="error"
          />
        </PageContainer>
      </main>
    );
  }
}