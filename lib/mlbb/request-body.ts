export class BodyTooLargeError extends Error {
  constructor() { super("Scenario is too large (maximum 64 KB)."); }
}

/** Bound bytes while reading, including chunked requests without Content-Length. */
export async function readScenarioBody(request: Request) {
  const limit = 65536;
  if (Number(request.headers.get("content-length") || 0) > limit) throw new BodyTooLargeError();
  if (!request.body) throw new Error("A JSON scenario is required.");
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let bytes = 0; let body = "";
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > limit) { await reader.cancel(); throw new BodyTooLargeError(); }
      body += decoder.decode(chunk.value, { stream: true });
    }
    body += decoder.decode();
    return JSON.parse(body) as unknown;
  } finally { reader.releaseLock(); }
}
