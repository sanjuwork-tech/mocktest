import "server-only";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { allowedOrigin } from "./security";
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function requireOrigin(request: Request) {
  let origin = request.headers.get("origin");
  if (!origin) {
    const referer = request.headers.get("referer");
    if (referer) {
      try {
        origin = new URL(referer).origin;
      } catch {
        origin = null;
      }
    }
  }
  if (!allowedOrigin(origin))
    throw new ApiError(
      403,
      "This request must come from the TestDisha application.",
    );
}
export async function readJson(
  request: Request,
  limit = 16384,
): Promise<unknown> {
  if (
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .startsWith("application/json")
  )
    throw new ApiError(415, "Send application/json.");
  if (Number(request.headers.get("content-length")) > limit)
    throw new ApiError(413, "Request too large.");
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError(400, "A JSON body is required.");
  const chunks: Uint8Array[] = [];
  let length = 0;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    length += value.length;
    if (length > limit) {
      await reader.cancel();
      throw new ApiError(413, "Request too large.");
    }
    chunks.push(value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new ApiError(400, "Invalid JSON.");
  }
}
export function json(value: unknown, status = 200) {
  return NextResponse.json(value, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
export function apiError(error: unknown) {
  if (error instanceof ApiError)
    return json({ error: error.message }, error.status);
  const code =
    (error as { code?: string; cause?: { code?: string } })?.cause?.code ??
    (error as { code?: string })?.code;
  if (code === "23505")
    return json({ error: "That record already exists." }, 409);
  if (code === "23503")
    return json({ error: "This record is referenced by other data." }, 409);
  if (code === "23514")
    return json({ error: "The record does not satisfy the data rules." }, 400);
  const requestId = randomUUID();
  console.error("api_failure", { requestId, code: code ?? "internal" });
  return json(
    {
      error: "The service is temporarily unavailable. Please try again.",
      requestId,
    },
    503,
  );
}
