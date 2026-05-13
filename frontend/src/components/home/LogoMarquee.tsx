/**
 * Bandeau de partenaires en défilement continu (s'arrête au survol).
 * Liste dédoublée pour une boucle sans couture (cf. `.marquee-track` dans globals.css).
 */
export default function LogoMarquee({ items }: { items: string[] }) {
  const doubled = [...items, ...items];
  return (
    <div
      className="relative overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
      aria-label="Partenaires et opérateurs"
    >
      <ul className="marquee-track flex w-max items-center gap-4">
        {doubled.map((name, i) => (
          <li
            key={`${name}-${i}`}
            aria-hidden={i >= items.length}
            className="shrink-0 rounded-2xl border border-cacao-200 bg-white px-6 py-3 text-sm font-semibold text-cacao-800 shadow-sm"
          >
            {name}
          </li>
        ))}
      </ul>
    </div>
  );
}
