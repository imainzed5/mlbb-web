import { ImageResponse } from "next/og";

import { OgCard } from "@/app/og/OgCard";

export const alt = "MLBB Stats hero builds, counters, rankings, and live meta snapshots";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <OgCard
        eyebrow="MLBB Stats"
        title="Hero builds, counters, rank boards, and live MLBB snapshots"
        description="A fast Mobile Legends dashboard for browsing heroes, reading matchup edges, and tracking the current rank board."
        badges={[
          { label: "Hero Hub", tone: "accent" },
          { label: "Live rank board", tone: "success" },
          { label: "SEO-ready routes", tone: "warning" },
        ]}
        metrics={[
          { label: "Focus", value: "Heroes" },
          { label: "Views", value: "Browser + Detail" },
          { label: "Data", value: "Live API" },
        ]}
      />
    ),
    size
  );
}