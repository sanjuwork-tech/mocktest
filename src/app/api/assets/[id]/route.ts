import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

const ID = /^[a-f0-9]{24}$/;

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!ID.test(id)) return new Response("Not found", { status: 404 });

  const base = process.env.ASSET_PUBLIC_BASE_URL?.replace(/\/+$/, "");
  if (base) return Response.redirect(`${base}/${id}.png`, 308);

  try {
    const bytes = await readFile(path.join(process.cwd(), "data", "assets", `${id}.png`));
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
