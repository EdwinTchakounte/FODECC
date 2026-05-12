/**
 * Rendu d'un StreamField Wagtail (clé `body` des pages).
 * Chaque `block.type` est mappé vers un composant ; les blocs inconnus sont
 * ignorés silencieusement (tolérance aux évolutions du modèle).
 */
import { mediaUrl } from "@/lib/wagtail";
import type { StreamFieldBlock } from "@/lib/types";

export default function StreamField({ blocks }: { blocks?: StreamFieldBlock[] | null }) {
  if (!blocks?.length) return null;
  return (
    <div className="stream-content space-y-8">
      {blocks.map((block) => (
        <Block key={block.id ?? `${block.type}-${Math.random()}`} block={block} />
      ))}
    </div>
  );
}

function Block({ block }: { block: StreamFieldBlock }) {
  switch (block.type) {
    case "heading": {
      const v = block.value as { text: string; level: "h2" | "h3" | "h4" };
      const Tag = v.level ?? "h2";
      return <Tag className="font-bold text-cacao-900">{v.text}</Tag>;
    }
    case "paragraph":
      return (
        <div
          className="rich-text"
          // contenu maîtrisé, produit par l'éditeur Wagtail
          dangerouslySetInnerHTML={{ __html: block.value as string }}
        />
      );
    case "image": {
      const v = block.value as {
        image?: { meta?: { download_url?: string }; download_url?: string; url?: string };
        caption?: string;
        alt_text?: string;
      };
      const src = mediaUrl(v.image?.meta?.download_url ?? v.image?.download_url ?? v.image?.url);
      if (!src) return null;
      return (
        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={v.alt_text ?? ""} className="rounded w-full h-auto" />
          {v.caption && <figcaption className="text-sm text-gray-500 mt-2">{v.caption}</figcaption>}
        </figure>
      );
    }
    case "gallery": {
      const v = block.value as { images: Array<{ image?: { url?: string }; caption?: string; alt_text?: string }> };
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {v.images?.map((img, i) => {
            const src = mediaUrl(img.image?.url);
            return src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={src} alt={img.alt_text ?? ""} className="rounded object-cover w-full h-48" />
            ) : null;
          })}
        </div>
      );
    }
    case "embed":
      return (
        <div
          className="aspect-video [&_iframe]:w-full [&_iframe]:h-full"
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
        <a href={href} className="flex items-center gap-3 rounded border border-cacao-100 p-4 hover:bg-cacao-50">
          <span aria-hidden className="text-2xl">📄</span>
          <span>
            <span className="font-semibold text-cacao-900 block">{v.title ?? v.document?.title}</span>
            {v.description && <span className="text-sm text-gray-600">{v.description}</span>}
          </span>
        </a>
      );
    }
    case "callout": {
      const v = block.value as { style: "info" | "success" | "warning"; title?: string; text: string };
      const tone = {
        info: "bg-blue-50 border-blue-200",
        success: "bg-cafe-500/10 border-cafe-500/30",
        warning: "bg-amber-50 border-amber-200",
      }[v.style ?? "info"];
      return (
        <aside className={`rounded border-l-4 p-4 ${tone}`}>
          {v.title && <p className="font-semibold mb-1">{v.title}</p>}
          <div className="rich-text" dangerouslySetInnerHTML={{ __html: v.text }} />
        </aside>
      );
    }
    case "cta": {
      const v = block.value as { label: string; url: string; style: "primary" | "secondary" };
      const cls =
        v.style === "secondary"
          ? "border border-cacao-700 text-cacao-700 hover:bg-cacao-50"
          : "bg-cacao-700 text-white hover:bg-cacao-900";
      return (
        <a href={v.url} className={`inline-block rounded px-5 py-2.5 font-medium ${cls}`}>
          {v.label}
        </a>
      );
    }
    case "key_figures": {
      const v = block.value as { figures: Array<{ value: string; unit?: string; label: string }> };
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6">
          {v.figures?.map((f, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-extrabold text-cacao-700">
                {f.value}
                {f.unit && <span className="text-lg font-bold"> {f.unit}</span>}
              </div>
              <div className="text-sm text-gray-600 mt-1">{f.label}</div>
            </div>
          ))}
        </div>
      );
    }
    case "accordion": {
      const v = block.value as { items: Array<{ question: string; answer: string }> };
      return (
        <div className="divide-y divide-cacao-100 border-y border-cacao-100">
          {v.items?.map((it, i) => (
            <details key={i} className="py-3">
              <summary className="cursor-pointer font-semibold text-cacao-900">{it.question}</summary>
              <div className="rich-text mt-2" dangerouslySetInnerHTML={{ __html: it.answer }} />
            </details>
          ))}
        </div>
      );
    }
    case "table": {
      const v = block.value as { caption?: string; rows: string[][] };
      const [head, ...body] = v.rows ?? [];
      return (
        <table className="w-full text-sm border-collapse">
          {v.caption && <caption className="text-left font-semibold mb-2">{v.caption}</caption>}
          {head && (
            <thead>
              <tr>{head.map((c, i) => <th key={i} className="border p-2 bg-cacao-50 text-left">{c}</th>)}</tr>
            </thead>
          )}
          <tbody>
            {body.map((row, i) => (
              <tr key={i}>{row.map((c, j) => <td key={j} className="border p-2">{c}</td>)}</tr>
            ))}
          </tbody>
        </table>
      );
    }
    case "html":
      return <div dangerouslySetInnerHTML={{ __html: block.value as string }} />;
    default:
      return null;
  }
}
