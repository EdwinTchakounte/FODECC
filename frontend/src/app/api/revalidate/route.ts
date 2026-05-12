import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

/**
 * Revalidation à la demande (ISR), appelée par Wagtail lors d'une publication.
 *   POST /api/revalidate  { "secret": "...", "path": "/le-fodecc/notre-histoire/" }
 *
 * Le secret doit correspondre à REVALIDATE_SECRET (côté Next) / REVALIDATE_SECRET
 * (côté Wagtail, cf. core/signals.py).
 */
export async function POST(request: Request) {
  let body: { secret?: string; path?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON invalide" }, { status: 400 });
  }

  if (!process.env.REVALIDATE_SECRET || body.secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false, error: "secret invalide" }, { status: 401 });
  }

  // Invalide tout le cache des données Wagtail…
  revalidateTag("wagtail");
  // …et, si fourni, la (les) page(s) concernée(s) pour les deux locales.
  if (body.path) {
    const clean = "/" + body.path.replace(/^\/(fr|en)\/?/, "").replace(/^\/+/, "");
    for (const locale of ["fr", "en"]) {
      revalidatePath(`/${locale}${clean === "/" ? "" : clean}`);
    }
  }

  return NextResponse.json({ ok: true, revalidated: true, now: Date.now() });
}
