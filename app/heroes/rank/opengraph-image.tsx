import { ImageResponse } from "next/og";

import { OgCard } from "@/app/og/OgCard";

export const alt = "MLBB hero rank board with tiers and live win, pick, and ban rates";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <OgCard
        eyebrow="Rank Board"
        title="Track the current MLBB tier list"
        description="See hero rankings with tier grouping plus live win, pick, and ban rate context in one denser board."
        badges={[
          { label: "Tier first", tone: "warning" },
          { label: "Win / Pick / Ban", tone: "accent" },
          { label: "Live roster", tone: "success" },
        ]}
        metrics={[
          { label: "Focus", value: "Rank" },
          { label: "View", value: "Tier board" },
          { label: "Use", value: "Meta reads" },
        ]}
      />
    ),
    size
  );
}
