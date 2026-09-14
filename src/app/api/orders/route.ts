import { apiError, ApiError, requireOrigin } from "@/server/http";
export const runtime = "nodejs";
// Commercial checkout remains closed until verified payments and entitlements exist.
export async function POST(request: Request) {
  try {
    requireOrigin(request);
    throw new ApiError(
      409,
      "Enrolment is not open. Prices are proposed; no order or payment has been created.",
    );
  } catch (e) {
    return apiError(e);
  }
}
