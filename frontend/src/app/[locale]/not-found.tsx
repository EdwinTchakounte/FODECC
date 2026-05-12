import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("common");
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <p className="text-6xl font-extrabold text-cacao-300">404</p>
      <h1 className="mt-4 text-2xl font-bold text-cacao-900">{t("notFoundTitle")}</h1>
      <p className="mt-2 text-gray-600">{t("notFoundText")}</p>
      <Link href="/" className="mt-8 inline-block rounded bg-cacao-700 px-6 py-3 font-semibold text-white hover:bg-cacao-900">
        {t("backToList")}
      </Link>
    </div>
  );
}
