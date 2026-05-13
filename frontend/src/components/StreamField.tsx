/**
 * Rendu d'un StreamField Wagtail (clé `body` des pages).
 * Chaque `block.type` → un composant ; blocs inconnus ignorés silencieusement.
 * Style aligné sur le design system (formes douces, ombres légères).
 */
import { cn } from "@/lib/cn";
import type { StreamFieldBlock } from "@/lib/types";
import { mediaUrl } from "@/lib/wagtail";

export default function StreamField({
  blocks,
  className,
}: {
  blocks?: StreamFieldBlock[] | null;
  className?: string;
}) {
  if (!blocks?.length) return null;
  return (
    <div className={cn("space-y-7", className)}>
      {blocks.map((block, i) => (
        <Block key={block.id ?? `${block.type}-${i}`} block={block} />
      ))}
    </div>
  );
}

function imgFrom(v: { meta?: { download_url?: string }; download_url?: string; url?: string } | undefined) {
  return mediaUrl(v?.meta?.download_url ?? v?.download_url ?? v?.url);
}

function Block({ block }: { block: StreamFieldBlock }) {
  switch (block.type) {
    case "heading": {
      const v = block.value as { text: string; level: "h2" | "h3" | "h4" };
      const Tag = (v.level ?? "h2") as "h2";
      const size = { h2: "text-2xl sm:text-3xl", h3: "text-xl sm:text-2xl", h4: "text-lg sm:text-xl" }[v.level ?? "h2"];
      return <Tag className={cn("pt-2 font-bold text-cacao-950", size)}>{v.text}</Tag>;
    }

    case "paragraph":
      return <div className="prose-fodecc" dangerouslySetInnerHTML={{ __html: block.value as string }} />;

    case "image": {
      const v = block.value as { image?: object; caption?: string; alt_text?: string };
      const src = imgFrom(v.image as never);
      if (!src) return null;
      return (
        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={v.alt_text ?? ""} loading="lazy" className="w-full rounded-lg shadow-card" />
          {v.caption ? <figcaption className="mt-2.5 text-sm text-cacao-600">{v.caption}</figcaption> : null}
        </figure>
      );
    }

    case "gallery": {
      const v = block.value as { images: Array<{ image?: object; alt_text?: string }> };
      return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {v.images?.map((img, i) => {
            const src = imgFrom(img.image as never);
            return src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={src} alt={img.alt_text ?? ""} loading="lazy" className="h-48 w-full rounded-lg object-cover shadow-card" />
            ) : null;
          })}
        </div>
      );
    }

    case "embed":
      return (
        <div
          className="overflow-hidden rounded-lg bg-cacao-950 shadow-card [&_iframe]:aspect-video [&_iframe]:h-auto [&_iframe]:w-full"
          dangerouslySetInnerHTML={{ __html: (block.value as { html?: string }).html ?? "" }}
        />
      );

    case "document": {
      const v = block.value as {
        document?: { meta?: { download_url?: string }; title?: string };
        title?: string;
        description?: string;
      };
      const href = mediaUrl(v.document?.meta?.download_url);
      if (!href) return null;
      return (
        <a
          href={href}
          className="group flex items-center gap-4 rounded-lg border border-cacao-100 bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-card"
        >
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gold-300/40 text-cacao-800" aria-hidden>
            <DocIcon />
          </span>
          <span className="min-w-0">
            <span className="block font-semibold text-cacao-950 group-hover:text-forest-700">{v.title ?? v.document?.title}</span>
            {v.description ? <span className="block text-sm text-cacao-600">{v.description}</span> : null}
          </span>
          <span className="ml-auto text-forest-700">
            <DownloadIcon />
          </span>
        </a>
      );
    }

    case "callout": {
      const v = block.value as { style: "info" | "success" | "warning"; title?: string; text: string };
      const tone =
        { info: "border-forest-300 bg-forest-50", success: "border-forest-400 bg-forest-50", warning: "border-gold-400 bg-gold-300/20" }[
          v.style ?? "info"
        ];
      return (
        <aside className={cn("rounded-lg border-l-4 px-5 py-4", tone)}>
          {v.title ? <p className="font-semibold text-cacao-950">{v.title}</p> : null}
          <div className="prose-fodecc text-cacao-800" dangerouslySetInnerHTML={{ __html: v.text }} />
        </aside>
      );
    }

    case "cta": {
      const v = block.value as { label: string; url: string; style: "primary" | "secondary" };
      const cls =
        v.style === "secondary"
          ? "border border-cacao-900/20 text-cacao-900 hover:bg-cacao-900/5"
          : "bg-cacao-900 text-cream hover:bg-cacao-800 shadow-card";
      return (
        <div>
          <a href={v.url} className={cn("inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold transition-all active:scale-[0.98]", cls)}>
            {v.label}
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden>
              <path d="M4 10h11M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      );
    }

    case "key_figures": {
      const v = block.value as { figures: Array<{ value: string; unit?: string; label: string }> };
      return (
        <div className="grid gap-4 rounded-lg bg-cacao-950 p-8 text-cream sm:grid-cols-2 lg:grid-cols-4">
          {v.figures?.map((f, i) => (
            <div key={i}>
              <div className="text-3xl font-extrabold text-gold-300 sm:text-4xl">
                {f.value}
                {f.unit ? <span className="ml-1 text-xl font-bold text-cream/80">{f.unit}</span> : null}
              </div>
              <div className="mt-1.5 text-sm text-cream/70">{f.label}</div>
            </div>
          ))}
        </div>
      );
    }

    case "accordion": {
      const v = block.value as { items: Array<{ question: string; answer: string }> };
      return (
        <div className="divide-y divide-cacao-100 overflow-hidden rounded-lg border border-cacao-100 bg-white">
          {v.items?.map((it, i) => (
            <details key={i} className="group px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-4 font-semibold text-cacao-950">
                {it.question}
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-cacao-900/5 text-cacao-700 transition-transform group-open:rotate-45">
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden>
                    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </span>
              </summary>
              <div className="prose-fodecc mt-3" dangerouslySetInnerHTML={{ __html: it.answer }} />
            </details>
          ))}
        </div>
      );
    }

    case "table": {
      const v = block.value as { caption?: string; rows: string[][] };
      const [head, ...body] = v.rows ?? [];
      return (
        <div className="overflow-x-auto">
          <table className="w-full overflow-hidden rounded-lg text-sm shadow-card">
            {v.caption ? <caption className="mb-2 text-left font-semibold text-cacao-950">{v.caption}</caption> : null}
            {head ? (
              <thead>
                <tr>{head.map((c, i) => <th key={i} className="bg-cacao-900 px-4 py-3 text-left font-semibold text-cream">{c}</th>)}</tr>
              </thead>
            ) : null}
            <tbody className="bg-white">
              {body.map((row, i) => (
                <tr key={i} className="border-b border-cacao-100 last:border-0">
                  {row.map((c, j) => <td key={j} className="px-4 py-3">{c}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case "html":
      return <div className="prose-fodecc" dangerouslySetInnerHTML={{ __html: block.value as string }} />;

    default:
      return null;
  }
}

function DocIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" aria-hidden>
      <path d="M5 2h7l4 4v12H5z M12 2v4h4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
function DownloadIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" aria-hidden>
      <path d="M10 3v9m0 0l-3.5-3.5M10 12l3.5-3.5M4 16h12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
