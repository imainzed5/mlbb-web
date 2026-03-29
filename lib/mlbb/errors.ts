export class MlbbApiError extends Error {
  status?: number;
  url?: string;

  constructor(message: string, options?: { status?: number; url?: string }) {
    super(message);
    this.name = "MlbbApiError";
    this.status = options?.status;
    this.url = options?.url;
  }
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error";
}