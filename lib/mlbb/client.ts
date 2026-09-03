import { MlbbApiError } from "@/lib/mlbb/errors";

import {
  DEFAULT_MLBB_API_BASE_URL,
  DEFAULT_MLBB_API_FALLBACK_BASE_URLS,
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
  headers?: Record<string, string>;
  revalidate?: number;
  searchParams?: Record<string, number | string | null | undefined>;
};

type MlbbMutationOptions<BodyType> = {
  body?: BodyType;
} & MlbbFetchOptions;

type MlbbQueryOptions = MlbbFetchOptions & {
  jwt?: string;
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

function normalizeBaseUrl(value: string) {
  const url = new URL(value.trim());
  const normalizedPath = url.pathname.replace(/\/+$/, "");

  if (normalizedPath === "") {
    url.pathname = "/api";
  } else {
    url.pathname = normalizedPath;
  }

  return url.toString();
}

function resolveAlternativeBaseUrl(value: unknown) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  try {
    return normalizeBaseUrl(value);
  } catch {
    return null;
  }
}

function shouldRetryWithFallback(status: number) {
  return status === 404 || status === 429 || status >= 500;
}

function getBaseUrlCandidates() {
  const dedupe = new Set<string>();
  const candidates: string[] = [];

  for (const candidate of [
    MLBB_API_BASE_URL,
    ...MLBB_API_FALLBACK_BASE_URLS,
    DEFAULT_MLBB_API_BASE_URL,
    ...DEFAULT_MLBB_API_FALLBACK_BASE_URLS,
  ]) {
    if (!candidate) {
      continue;
    }

    try {
      const normalizedCandidate = normalizeBaseUrl(candidate);

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

async function fetchMlbbResponse(
  path: string,
  request: {
    body?: BodyInit;
    method: "GET" | "POST";
    options?: MlbbFetchOptions;
  }
) {
  const baseUrlQueue = getBaseUrlCandidates();
  const attemptedBaseUrls = new Set<string>();
  let lastError: MlbbApiError | null = null;

  while (baseUrlQueue.length > 0) {
    const baseUrl = baseUrlQueue.shift();

    if (!baseUrl || attemptedBaseUrls.has(baseUrl)) {
      continue;
    }

    attemptedBaseUrls.add(baseUrl);

    const url = createMlbbUrl(path, baseUrl);
    if (request.options?.searchParams) {
      Object.entries(request.options.searchParams).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
          return;
        }

        url.searchParams.set(key, String(value));
      });
    }

    const headers = new Headers(request.options?.headers);
    headers.set("accept", "application/json");
    headers.set("accept-language", DEFAULT_LANGUAGE);

    if (request.body !== undefined) {
      headers.set("content-type", "application/json");
    }

    let response: Response;

    try {
      response = await fetch(url, {
        body: request.body,
        cache: request.options?.revalidate ? undefined : "no-store",
        headers,
        method: request.method,
        next: request.options?.revalidate
          ? { revalidate: request.options.revalidate }
          : undefined,
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
  const { response, url } = await fetchMlbbResponse(path, {
    method: "GET",
    options,
  });

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
  const body = options.body === undefined ? undefined : JSON.stringify(options.body);
  const { response, url } = await fetchMlbbResponse(path, {
    body,
    method: "POST",
    options,
  });

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

export async function fetchMlbbQuery<ResponseType>(
  path: string,
  options: MlbbQueryOptions
) {
  const headers = {
    ...options.headers,
    ...(options.jwt ? { authorization: `Bearer ${options.jwt}` } : {}),
  };
  const { response, url } = await fetchMlbbResponse(path, {
    method: "GET",
    options: {
      ...options,
      headers,
    },
  });

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
