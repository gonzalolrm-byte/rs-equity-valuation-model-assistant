/**
 * Lovable AI Gateway helpers (server-only).
 *
 * Jinnie currently runs on Lovable AI. To move her to Claude with your own
 * Anthropic key later, only `createJinnieModel` below has to change.
 */

const RUN_ID_HEADER = "X-Lovable-AIG-Run-ID";

export function getLovableAiGatewayRunId(request: Request): string | undefined {
  return request.headers.get(RUN_ID_HEADER) ?? undefined;
}

export type LovableAiGatewayRunIdFetch = {
  fetch: typeof fetch;
  getRunId: () => string | undefined;
};

/** Wraps fetch so the gateway run id is captured and resent per request. */
export function createLovableAiGatewayRunIdFetch(
  initialRunId?: string,
): LovableAiGatewayRunIdFetch {
  let runId = initialRunId;

  const wrapped: typeof fetch = async (input, init) => {
    const headers = new Headers(init?.headers);
    if (runId) headers.set(RUN_ID_HEADER, runId);
    const response = await fetch(input as RequestInfo, { ...init, headers });
    const returned = response.headers.get(RUN_ID_HEADER);
    if (returned) runId = returned;
    return response;
  };

  return { fetch: wrapped, getRunId: () => runId };
}

export function getLovableAiGatewayResponseHeaders(
  _unused?: unknown,
  extra?: Record<string, string>,
): Record<string, string> {
  return { ...(extra ?? {}) };
}

export function withLovableAiGatewayRunIdHeader(
  response: Response,
  runIdFetch: LovableAiGatewayRunIdFetch,
): Response {
  const runId = runIdFetch.getRunId();
  if (!runId) return response;
  const headers = new Headers(response.headers);
  headers.set(RUN_ID_HEADER, runId);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
