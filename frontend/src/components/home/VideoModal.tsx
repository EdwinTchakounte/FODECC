"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Bouton « lecture » + modale vidéo (lightbox). Évite d'imposer une vidéo
 * basse résolution en fond plein écran : elle est jouée à la demande,
 * contenue, avec contrôles.
 */
export default function VideoModal({
  src,
  label,
  poster,
}: {
  src: string;
  label: string;
  poster?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    videoRef.current?.play().catch(() => {});
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group inline-flex items-center gap-3 rounded-full border border-cream/40 bg-cream/5 py-2.5 pl-2.5 pr-6 text-base font-semibold text-cream backdrop-blur-sm transition-colors hover:bg-cream/15"
      >
        <span className="grid h-10 w-10 place-items-center rounded-full bg-cream text-cacao-950 transition-transform group-hover:scale-105">
          <svg viewBox="0 0 24 24" className="ml-0.5 h-4 w-4" fill="currentColor" aria-hidden>
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
        {label}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-cacao-950/85 p-4 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
        >
          <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fermer"
              className="absolute -top-12 right-0 grid h-10 w-10 place-items-center rounded-full bg-cream/15 text-cream transition-colors hover:bg-cream/25"
            >
              <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" aria-hidden>
                <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
            <video
              ref={videoRef}
              src={src}
              poster={poster || undefined}
              controls
              playsInline
              className="aspect-video w-full rounded-2xl bg-black shadow-soft"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
