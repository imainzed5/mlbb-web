import type { Metadata } from "next";

type CreatePageMetadataOptions = {
  description: string;
  imagePath?: string;
  keywords?: string[];
  noIndex?: boolean;
  path?: string;
  title?: string;
};

export const SITE_NAME = "mlbbstats";
export const SITE_DESCRIPTION =
  "MLBB hero builds, counters, rankings, and meta snapshots in a fast beginner-friendly dashboard.";

const configuredSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://mlbbstats.gg";

export const SITE_URL = configuredSiteUrl.endsWith("/")
  ? configuredSiteUrl.slice(0, -1)
  : configuredSiteUrl;

export function absoluteUrl(path = "/") {
  return new URL(path, `${SITE_URL}/`).toString();
}

function buildShareTitle(title?: string) {
  return title ? `${title} | ${SITE_NAME}` : SITE_NAME;
}

export function createRootMetadata(): Metadata {
  return {
    applicationName: SITE_NAME,
    description: SITE_DESCRIPTION,
    metadataBase: new URL(`${SITE_URL}/`),
    openGraph: {
      description: SITE_DESCRIPTION,
      images: [absoluteUrl("/opengraph-image")],
      locale: "en_US",
      siteName: SITE_NAME,
      title: SITE_NAME,
      type: "website",
      url: absoluteUrl("/"),
    },
    title: {
      default: SITE_NAME,
      template: `%s | ${SITE_NAME}`,
    },
    twitter: {
      card: "summary_large_image",
      description: SITE_DESCRIPTION,
      images: [absoluteUrl("/opengraph-image")],
      title: SITE_NAME,
    },
  };
}

export function createPageMetadata({
  description,
  imagePath = "/opengraph-image",
  keywords,
  noIndex = false,
  path = "/",
  title,
}: CreatePageMetadataOptions): Metadata {
  const canonical = absoluteUrl(path);
  const image = absoluteUrl(imagePath);
  const shareTitle = buildShareTitle(title);

  return {
    alternates: {
      canonical,
    },
    description,
    keywords,
    openGraph: {
      description,
      images: [image],
      locale: "en_US",
      siteName: SITE_NAME,
      title: shareTitle,
      type: "website",
      url: canonical,
    },
    robots: noIndex
      ? {
          follow: false,
          index: false,
        }
      : undefined,
    title,
    twitter: {
      card: "summary_large_image",
      description,
      images: [image],
      title: shareTitle,
    },
  };
}
