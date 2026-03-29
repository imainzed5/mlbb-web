import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getPlayerSession, buildPlayerRouteKey } from "@/lib/auth/session";
import { PageContainer } from "@/components/layout/PageContainer";
import { PlayerConnectPanel } from "@/components/player/PlayerConnectPanel";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Account Connect",
  description:
    "Connect your MLBB account with role ID, zone ID, and a verification code to open a private dashboard.",
  noIndex: true,
  path: "/player",
});

export default async function PlayerPage() {
  const session = await getPlayerSession();

  if (session) {
    redirect(`/player/${buildPlayerRouteKey(session.roleId, session.zoneId)}`);
  }

  return (
    <main>
      <PageContainer className="space-y-6 py-10">
        <PlayerConnectPanel />
      </PageContainer>
    </main>
  );
}
