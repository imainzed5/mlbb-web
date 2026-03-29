import { ImageResponse } from "next/og";

import { OgCard } from "@/app/og/OgCard";

export const alt = "MLBB hero browser with tiers, roles, and live performance context";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <OgCard
        eyebrow="Hero Browser"
        title="Browse MLBB heroes faster"
        description="Filter heroes by role, tier, pick rate, and win rate in a cleaner browser built for quick reads."
        badges={[
          { label: "Role filters", tone: "accent" },
          { label: "Tier context", tone: "warning" },
          { label: "Live hero data", tone: "success" },
        ]}
        metrics={[
          { label: "Focus", value: "Heroes" },
          { label: "View", value: "Browser" },
          { label: "Use", value: "Draft prep" },
        ]}
      />
    ),
    size
  );
}
