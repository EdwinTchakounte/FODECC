import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Active le mode brouillon (Draft Mode) puis redirige vers la page demandée.
 * Appelé depuis l'admin Wagtail (« Prévisualiser ») via wagtail-headless-preview.
 *
 *   GET /api/preview?secret=...&url=/fr/le-fodecc/notre-histoire/
 *
 * Désactivation : GET /api/preview?disable=1
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dm = await draftMode();

  if (searchParams.get("disable")) {
    dm.disable();
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!process.env.REVALIDATE_SECRET || searchParams.get("secret") !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false, error: "secret invalide" }, { status: 401 });
  }

  dm.enable();
  const target = searchParams.get("url") || "/";
  // n'autorise que des chemins internes
  const safe = target.startsWith("/") ? target : "/";
  return NextResponse.redirect(new URL(safe, request.url));
}
