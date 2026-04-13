import { MlbbApiError } from "@/lib/mlbb/errors";

import {
  DEFAULT_LANGUAGE,
  MLBB_API_BASE_URL,
  MLBB_API_FALLBACK_BASE_URLS,
} from "./constants";
import type { MlbbCollectionResponse, MlbbMutationResponse } from "./types";

type MlbbErrorPayload = {
  detail?: unknown;
  details?: {
    alternative_endpoint?: unknown;
  } | null;
  message?: unknown;
  msg?: unknown;
};

function createMlbbUrl(path: string, baseUrl = MLBB_API_BASE_URL) {
  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;

  return new URL(path.replace(/^\//, ""), normalizedBaseUrl);
}

type MlbbFetchOptions = {
  revalidate?: number;
};

type MlbbMutationOptions<BodyType> = {
  body: BodyType;
  revalidate?: number;
  searchParams?: Record<string, number | string | null | undefined>;
};

function readErrorText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

async function readMlbbErrorPayload(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return null;
  }

  try {
    const payload = (await response.clone().json()) as MlbbErrorPayload;
    return payload;
  } catch {
    return null;
  }
}

function readMlbbErrorMessage(payload: MlbbErrorPayload | null) {
  return (
    readErrorText(payload?.message) ??
    readErrorText(payload?.msg) ??
    readErrorText(payload?.detail)
  );
}

function resolveAlternativeBaseUrl(value: unknown) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  try {
    const alternativeUrl = new URL(value.trim());
    const normalizedPath = alternativeUrl.pathname.replace(/\/+$/, "");

    if (normalizedPath === "" || normalizedPath === "/") {
      alternativeUrl.pathname = "/api";
    }

    return alternativeUrl.toString();
  } catch {
    return null;
  }
}

function shouldRetryWithFallback(status: number) {
  return status === 429 || status >= 500;
}

function getCollectionBaseUrlCandidates() {
  const dedupe = new Set<string>();
  const candidates: string[] = [];

  for (const candidate of [MLBB_API_BASE_URL, ...MLBB_API_FALLBACK_BASE_URLS]) {
    if (!candidate) {
      continue;
    }

    try {
      const normalizedCandidate = new URL(candidate.trim()).toString();

      if (dedupe.has(normalizedCandidate)) {
        continue;
      }

      dedupe.add(normalizedCandidate);
      candidates.push(normalizedCandidate);
    } catch {
      continue;
    }
  }

  return candidates;
}

async function fetchMlbbCollectionResponse(
  path: string,
  options?: MlbbFetchOptions
) {
  const baseUrlQueue = getCollectionBaseUrlCandidates();
  const attemptedBaseUrls = new Set<string>();
  let lastError: MlbbApiError | null = null;

  while (baseUrlQueue.length > 0) {
    const baseUrl = baseUrlQueue.shift();

    if (!baseUrl || attemptedBaseUrls.has(baseUrl)) {
      continue;
    }

    attemptedBaseUrls.add(baseUrl);

    const url = createMlbbUrl(path, baseUrl);
    let response: Response;

    try {
      response = await fetch(url, {
        headers: {
          accept: "application/json",
          "accept-language": DEFAULT_LANGUAGE,
        },
        next: options?.revalidate ? { revalidate: options.revalidate } : undefined,
      });
    } catch (error) {
      lastError = new MlbbApiError(
        error instanceof Error ? error.message : "Failed to fetch MLBB API data.",
        {
          url: url.toString(),
        }
      );
      continue;
    }

    if (response.ok) {
      return {
        response,
        url,
      };
    }

    const errorPayload = await readMlbbErrorPayload(response);
    const alternativeBaseUrl = resolveAlternativeBaseUrl(
      errorPayload?.details?.alternative_endpoint
    );

    if (alternativeBaseUrl && !attemptedBaseUrls.has(alternativeBaseUrl)) {
      baseUrlQueue.push(alternativeBaseUrl);
    }

    lastError = new MlbbApiError(
      readMlbbErrorMessage(errorPayload) ?? "Failed to fetch MLBB API data.",
      {
        status: response.status,
        url: url.toString(),
      }
    );

    if (!shouldRetryWithFallback(response.status)) {
      throw lastError;
    }
  }

  if (lastError) {
    throw lastError;
  }

  throw new MlbbApiError("Failed to fetch MLBB API data.");
}

export async function fetchMlbbCollection<RecordType>(
  path: string,
  options?: MlbbFetchOptions
) {
  const { response, url } = await fetchMlbbCollectionResponse(path, options);

  const payload = (await response.json()) as MlbbCollectionResponse<RecordType>;

  if (payload.code !== 0) {
    throw new MlbbApiError(payload.message || "MLBB API returned an error.", {
      status: response.status,
      url: url.toString(),
    });
  }

  return payload;
}

export async function fetchMlbbMutation<ResponseType, BodyType>(
  path: string,
  options: MlbbMutationOptions<BodyType>
) {
  const url = createMlbbUrl(path);

  if (options.searchParams) {
    Object.entries(options.searchParams).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        return;
      }

      url.searchParams.set(key, String(value));
    });
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      accept: "application/json",
      "accept-language": DEFAULT_LANGUAGE,
      "content-type": "application/json",
    },
    body: JSON.stringify(options.body),
    cache: options.revalidate ? undefined : "no-store",
    next: options.revalidate ? { revalidate: options.revalidate } : undefined,
  });

  if (!response.ok) {
    throw new MlbbApiError("Failed to fetch MLBB API data.", {
      status: response.status,
      url: url.toString(),
    });
  }

  const payload = (await response.json()) as MlbbMutationResponse<ResponseType>;

  if (payload.code !== 0) {
    throw new MlbbApiError(
      payload.message ?? payload.msg ?? "MLBB API returned an error.",
      {
        status: response.status,
        url: url.toString(),
      }
    );
  }

  return payload;
}