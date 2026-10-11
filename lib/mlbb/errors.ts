export class MlbbApiError extends Error {
  status?: number;
  url?: string;

  constructor(message: string, options?: { status?: number; url?: string; cause?: unknown }) {
    super(message, { cause: options?.cause });
    this.name = "MlbbApiError";
    this.status = options?.status;
    this.url = options?.url;
  }
}

export function reportMlbbCollectionFailure(path: string, error: unknown) {
  let upstreamHost: string | undefined;
  if (error instanceof MlbbApiError && error.url) {
    try {
      upstreamHost = new URL(error.url).host;
    } catch {
      // Do not log an unparsed URL: it could contain credentials or query values.
    }
  }

  const cause = error instanceof Error ? error.cause : undefined;
  const networkCode = cause && typeof cause === "object" && "code" in cause
    ? String(cause.code)
    : undefined;

  console.error("[mlbb] Public collection unavailable", {
    endpoint: path.split("?")[0],
    upstreamHost,
    status: error instanceof MlbbApiError ? error.status : undefined,
    errorType: error instanceof Error ? error.name : "UnknownError",
    message: error instanceof Error
      ? error.message.replace(/https?:\/\/\S+/gi, "[URL omitted]").slice(0, 300)
      : "Unknown error",
    networkCode,
  });
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error";
}
