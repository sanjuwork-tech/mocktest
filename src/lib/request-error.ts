export function requestError(body: unknown, fallback: string): string {
  if (!body || typeof body !== "object" || !("error" in body)) return fallback;
  const error = body.error;
  if (typeof error === "string") return error;
  if (
    error &&
    typeof error === "object" &&
    "fieldErrors" in error &&
    error.fieldErrors &&
    typeof error.fieldErrors === "object"
  ) {
    const messages = Object.entries(error.fieldErrors).flatMap(
      ([field, items]) =>
        Array.isArray(items)
          ? items
              .filter((item) => typeof item === "string")
              .map((item) => `${field}: ${item}`)
          : [],
    );
    if (messages.length) return messages.join(". ");
  }
  return fallback;
}
