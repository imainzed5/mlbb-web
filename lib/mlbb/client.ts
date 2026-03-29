import { MlbbApiError } from "@/lib/mlbb/errors";

import { DEFAULT_LANGUAGE, MLBB_API_BASE_URL } from "./constants";
import type { MlbbCollectionResponse, MlbbMutationResponse } from "./types";

function createMlbbUrl(path: string) {
  const baseUrl = MLBB_API_BASE_URL.endsWith("/")
    ? MLBB_API_BASE_URL
    : `${MLBB_API_BASE_URL}/`;

  return new URL(path.replace(/^\//, ""), baseUrl);
}

type MlbbFetchOptions = {
  revalidate?: number;
};

type MlbbMutationOptions<BodyType> = {
  body: BodyType;
  revalidate?: number;
  searchParams?: Record<string, number | string | null | undefined>;
};

export async function fetchMlbbCollection<RecordType>(
  path: string,
  options?: MlbbFetchOptions
) {
  const url = createMlbbUrl(path);
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      "accept-language": DEFAULT_LANGUAGE,
    },
    next: options?.revalidate ? { revalidate: options.revalidate } : undefined,
  });

  if (!response.ok) {
    throw new MlbbApiError("Failed to fetch MLBB API data.", {
      status: response.status,
      url: url.toString(),
    });
  }

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