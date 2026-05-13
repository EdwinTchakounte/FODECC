import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import "../globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  return {
    title: { default: "FODECC", template: "%s · FODECC" },
    description:
      locale === "fr"
        ? "Fonds de Développement des Filières Cacao et Café du Cameroun."
        : "Cameroon Cocoa and Coffee Sub-Sectors Development Fund.",
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  };
}

export default async function LocaleLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  if (!(routing.locales as readonly string[]).includes(locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();
  const t = await getTranslations("common");

  return (
    <html lang={locale}>
      <head>
        {/* Police Plus Jakarta Sans via Google Fonts (chargée par le navigateur, pas au build). */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <a href="#main-content" className="skip-link">
            {t("skipToContent")}
          </a>
          <Header />
          <main id="main-content" className="flex-1">
            {props.children}
          </main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
