import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/PageContainer";
import { MetaDashboardClient } from "@/components/meta/MetaDashboardClient";
import { JsonLd } from "@/components/seo/JsonLd";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StateMessage } from "@/components/ui/StateMessage";
import { normalizeHeroDetailRank } from "@/lib/hero/constants";
import { normalizeMetaLane, normalizeMetaRole } from "@/lib/meta/dashboard";
import { getMetaDashboardData } from "@/lib/meta/getMetaDashboardData";
import { getErrorMessage } from "@/lib/mlbb/errors";
import { createBreadcrumbJsonLd, createHeroItemListJsonLd } from "@/lib/seo/jsonld";
import { createPageMetadata } from "@/lib/seo/metadata";

type MetaPageProps = {
  searchParams: Promise<{
    lane?: string | string[];
    rank?: string | string[];
    role?: string | string[];
  }>;
};

function getSearchParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export const metadata: Metadata = createPageMetadata({
  title: "Meta Tracker",
  description:
    "Track the live MLBB meta with lane-aware power boards, contested picks, rising heroes, and tier snapshots.",
  path: "/meta",
});

export default async function MetaPage({ searchParams }: MetaPageProps) {
  try {
    const params = await searchParams;
    const lane = normalizeMetaLane(getSearchParamValue(params.lane));
    const role = normalizeMetaRole(getSearchParamValue(params.role));
    const rank = normalizeHeroDetailRank(getSearchParamValue(params.rank));
    const metaDashboardData = await getMetaDashboardData({ lane, rank, role });

    return (
      <main>
        <PageContainer className="space-y-6 py-8 sm:space-y-7 sm:py-10">
          <JsonLd
            data={[
              createBreadcrumbJsonLd([
                { name: "MLBB Stats", path: "/" },
                { name: "Meta Tracker", path: "/meta" },
              ]),
              createHeroItemListJsonLd({
                description:
                  "Track the live MLBB meta with lane-aware power boards, contested picks, rising heroes, and tier snapshots.",
                heroes: metaDashboardData.heroes,
                name: "MLBB Meta Tracker",
                path: "/meta",
              }),
            ]}
          />

          <SectionHeading
            title="Meta Tracker"
            description="Lane, role, and rank-aware meta reads built on the same normalized hero aggregation used by the Hero Hub, with comparison boards for rising, contested, and safer power picks."
            titleClassName="text-[20px]"
            descriptionClassName="text-[13px]"
          />

          <MetaDashboardClient data={metaDashboardData} />
        </PageContainer>
      </main>
    );
  } catch (error) {
    return (
      <main>
        <PageContainer className="py-10">
          <StateMessage
            title="Unable to load meta tracker"
            description={getErrorMessage(error)}
            tone="error"
          />
        </PageContainer>
      </main>
    );
  }
}