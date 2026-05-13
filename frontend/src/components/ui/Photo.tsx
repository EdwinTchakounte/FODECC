"use client";

import { useState } from "react";

import { cn } from "@/lib/cn";

/**
 * `<img>` avec dégradé de repli si la source échoue (ex. site fodecc.cm hors-ligne).
 * À utiliser pour les visuels décoratifs ; un parent en `relative overflow-hidden`
 * est attendu si on veut l'`object-cover` plein cadre.
 */
export default function Photo({
  src,
  alt = "",
  className,
  fallbackClassName = "bg-gradient-to-br from-cacao-200 via-cacao-300 to-forest-200",
}: {
  src?: string | null;
  alt?: string;
  className?: string;
  fallbackClassName?: string;
}) {
  const [ok, setOk] = useState(Boolean(src));
  if (!src || !ok) {
    return <div aria-hidden className={cn("h-full w-full", fallbackClassName, className)} />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setOk(false)}
      className={cn("h-full w-full object-cover", className)}
    />
  );
}
