import type { CSSProperties } from "react";

type OgCardBadge = {
  label: string;
  tone?: "accent" | "muted" | "success" | "warning";
};

type OgCardMetric = {
  label: string;
  value: string;
};

type OgCardProps = {
  badges?: OgCardBadge[];
  description: string;
  eyebrow: string;
  metrics?: OgCardMetric[];
  title: string;
};

const badgeStyles: Record<NonNullable<OgCardBadge["tone"]>, CSSProperties> = {
  accent: {
    background: "rgba(55, 138, 221, 0.18)",
    borderColor: "rgba(133, 183, 235, 0.28)",
    color: "#85b7eb",
  },
  muted: {
    background: "rgba(28, 33, 48, 0.9)",
    borderColor: "rgba(42, 47, 62, 0.9)",
    color: "#8892a0",
  },
  success: {
    background: "rgba(74, 222, 128, 0.12)",
    borderColor: "rgba(74, 222, 128, 0.25)",
    color: "#4ade80",
  },
  warning: {
    background: "rgba(250, 204, 21, 0.12)",
    borderColor: "rgba(250, 204, 21, 0.25)",
    color: "#facc15",
  },
};

export function OgCard({
  badges = [],
  description,
  eyebrow,
  metrics = [],
  title,
}: OgCardProps) {
  return (
    <div
      style={{
        alignItems: "stretch",
        background:
          "radial-gradient(circle at top right, rgba(55, 138, 221, 0.20), transparent 36%), linear-gradient(135deg, #0f1117, #161b27 58%, #1c2130)",
        color: "#e2e8f0",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
        padding: "52px 56px",
        position: "relative",
        width: "100%",
      }}
    >
      <div
        style={{
          border: "1px solid rgba(42, 47, 62, 0.82)",
          borderRadius: 36,
          inset: 24,
          opacity: 0.85,
          position: "absolute",
        }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 22, position: "relative" }}>
        <div style={{ color: "#85b7eb", fontSize: 20, letterSpacing: "0.32em", textTransform: "uppercase" }}>
          {eyebrow}
        </div>
        <div
          style={{
            fontSize: 66,
            fontWeight: 700,
            letterSpacing: "-0.05em",
            lineHeight: 1.04,
            maxWidth: 860,
          }}
        >
          {title}
        </div>
        <div
          style={{
            color: "#8892a0",
            fontSize: 28,
            lineHeight: 1.4,
            maxWidth: 840,
          }}
        >
          {description}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24, position: "relative" }}>
        {badges.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {badges.map((badge) => (
              <div
                key={badge.label}
                style={{
                  ...badgeStyles[badge.tone ?? "muted"],
                  borderRadius: 999,
                  borderStyle: "solid",
                  borderWidth: 1,
                  display: "flex",
                  fontSize: 18,
                  fontWeight: 600,
                  padding: "10px 18px",
                }}
              >
                {badge.label}
              </div>
            ))}
          </div>
        ) : null}

        {metrics.length > 0 ? (
          <div style={{ display: "flex", gap: 16 }}>
            {metrics.map((metric) => (
              <div
                key={metric.label}
                style={{
                  background: "rgba(28, 33, 48, 0.72)",
                  border: "1px solid rgba(42, 47, 62, 0.9)",
                  borderRadius: 22,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  minWidth: 180,
                  padding: "18px 20px",
                }}
              >
                <div style={{ color: "#8892a0", fontSize: 16, textTransform: "uppercase" }}>
                  {metric.label}
                </div>
                <div style={{ fontSize: 28, fontWeight: 700 }}>{metric.value}</div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}