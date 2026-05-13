"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Compteur animé (count-up) déclenché à l'entrée dans le viewport.
 * Accepte un nombre OU une chaîne contenant un nombre (« 13 000+ », « 2,5 Mds »).
 * Respecte `prefers-reduced-motion` (affiche directement la valeur finale).
 */
export default function Counter({
  value,
  duration = 1600,
  className,
}: {
  value: string | number;
  duration?: number;
  className?: string;
}) {
  const raw = String(value);
  const match = raw.match(/[\d\s.,]*\d/);
  const numStr = match ? match[0].replace(/[\s ]/g, "") : "";
  const target = numStr ? parseFloat(numStr.replace(",", ".")) : NaN;
  const prefix = match ? raw.slice(0, match.index) : raw;
  const suffix = match ? raw.slice((match.index ?? 0) + match[0].length) : "";
  const hasComma = match?.[0]?.includes(",");
  const decimals = (numStr.split(".")[1] || "").length;

  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(Number.isNaN(target) ? raw : "");

  useEffect(() => {
    if (Number.isNaN(target)) return;
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fmt = (n: number) => {
      const fixed = n.toFixed(decimals);
      const grouped = fixed.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
      return prefix + (hasComma ? grouped.replace(".", ",") : grouped) + suffix;
    };
    if (reduce) {
      setDisplay(fmt(target));
      return;
    }
    let raf = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          setDisplay(fmt(target * eased));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <span ref={ref} className={className}>
      {display || raw}
    </span>
  );
}
