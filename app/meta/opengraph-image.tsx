import { ImageResponse } from "next/og";

import { OgCard } from "@/app/og/OgCard";

export const alt = "MLBB meta tracker with lane-aware and role-aware power reads";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <OgCard
        eyebrow="Meta Tracker"
        title="Read the MLBB meta at a glance"
        description="Follow contested picks, rising heroes, lane pressure, and safer draft options with a cleaner meta dashboard."
        badges={[
          { label: "Lane-aware", tone: "accent" },
          { label: "Role-aware", tone: "muted" },
          { label: "Meta snapshots", tone: "success" },
        ]}
        metrics={[
          { label: "Focus", value: "Meta" },
          { label: "View", value: "Power board" },
          { label: "Use", value: "Pick phase" },
        ]}
      />
    ),
    size
  );
}
