import { publicCatalog, productInput, saveProduct } from "@/server/products";
import { requireAdmin } from "@/server/auth";
import {
  apiError,
  ApiError,
  json,
  readJson,
  requireOrigin,
} from "@/server/http";
export const runtime = "nodejs";
export async function GET() {
  try {
    return json({ products: await publicCatalog() });
  } catch (e) {
    return apiError(e);
  }
}
export async function POST(request: Request) {
  try {
    requireOrigin(request);
    const actor = await requireAdmin();
    const p = productInput.safeParse(await readJson(request));
    if (!p.success)
      throw new ApiError(400, "Check the series fields and try again.");
    return json(await saveProduct(actor, p.data), 201);
  } catch (e) {
    return apiError(e);
  }
}
