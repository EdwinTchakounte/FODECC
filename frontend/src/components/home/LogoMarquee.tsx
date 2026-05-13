/**
 * Bandeau de logos en défilement horizontal continu (s'arrête au survol).
 * Liste dédoublée pour une boucle sans couture (cf. `.marquee-track` dans globals.css).
 */
export default function LogoMarquee({ items }: { items: Array<{ name: string; src: string }> }) {
  const doubled = [...items, ...items];
  return (
    <div
      className="relative overflow-hidden py-4 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]"
      aria-label="Partenaires et opérateurs"
    >
      <ul className="marquee-track flex w-max items-center gap-10 sm:gap-16">
        {doubled.map((p, i) => (
          <li key={`${p.name}-${i}`} aria-hidden={i >= items.length} title={p.name} className="flex shrink-0 items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.src}
              alt={p.name}
              loading="lazy"
              className="h-12 w-auto max-w-[180px] object-contain opacity-80 grayscale transition hover:opacity-100 hover:grayscale-0 sm:h-14"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
