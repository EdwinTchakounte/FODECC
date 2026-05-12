import { getTranslations } from "next-intl/server";

import LocaleSwitcher from "@/components/LocaleSwitcher";
import { Link } from "@/i18n/navigation";

// TODO : remplacer ces entrées en dur par le snippet `MainMenu` de Wagtail
// (récupéré via l'API) une fois l'arborescence éditoriale figée.
const NAV: Array<{ key: string; href: string }> = [
  { key: "about", href: "/le-fodecc" },
  { key: "producers", href: "/guichet-producteurs" },
  { key: "news", href: "/actualites" },
  { key: "transparency", href: "/transparence" },
  { key: "partners", href: "/partenaires" },
  { key: "library", href: "/documentation" },
  { key: "contact", href: "/contact" },
];

export default async function Header() {
  const t = await getTranslations();

  return (
    <header className="border-b border-cacao-100">
      <div className="mx-auto max-w-6xl px-4 flex items-center justify-between gap-6 h-16">
        <Link href="/" className="font-extrabold text-lg text-cacao-900 shrink-0">
          FODECC
        </Link>
        <nav aria-label={t("common.menu")} className="hidden md:flex items-center gap-5 text-sm">
          {NAV.map((item) => (
            <Link key={item.key} href={item.href} className="hover:text-cacao-700">
              {t(`nav.${item.key}`)}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/recherche" className="text-sm hover:text-cacao-700" aria-label={t("common.search")}>
            🔍
          </Link>
          <LocaleSwitcher />
        </div>
      </div>
    </header>
  );
}
