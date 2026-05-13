import { getTranslations } from "next-intl/server";

import Button from "@/components/ui/Button";

export default async function NotFound() {
  const t = await getTranslations("common");
  return (
    <div className="bg-gradient-to-b from-sand to-cream">
      <div className="container-x flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
        <p className="text-7xl font-extrabold tracking-tight text-cacao-200">404</p>
        <h1 className="mt-4 text-2xl font-extrabold text-cacao-950 sm:text-3xl">{t("notFoundTitle")}</h1>
        <p className="mt-3 max-w-md text-cacao-900/70">{t("notFoundText")}</p>
        <div className="mt-8">
          <Button href="/" variant="primary" size="lg">
            {t("backHome")}
          </Button>
        </div>
      </div>
    </div>
  );
}
