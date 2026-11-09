import { useEffect, type ReactNode } from "react";
import { pageByPath, type PageMeta } from "../content/pages";
import { publicAsset } from "../lib/paths";
import { site } from "../lib/site";
import { useRoute } from "../router";

export function Seo({ page }: { page: PageMeta }) {
  const url =
    page.id === "not-found" ? site.url : page.path === "/" ? site.url : `${site.url}${page.path.replace(/^\//, "")}/`;
  const image = `${site.url}${page.image}`;

  useEffect(() => {
    document.title = page.title;
    setMeta("name", "description", page.description);
    setMeta("property", "og:title", page.title);
    setMeta("property", "og:description", page.description);
    setMeta("property", "og:url", url);
    setMeta("property", "og:image", image);
    setMeta("property", "og:image:alt", page.imageAlt);
    setMeta("name", "twitter:title", page.title);
    setMeta("name", "twitter:description", page.description);
    setMeta("name", "twitter:image", image);
    setMeta("name", "twitter:image:alt", page.imageAlt);
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) canonical.href = url;
  }, [page, url, image]);

  return null;
}

function setMeta(attr: "name" | "property", key: string, value: string) {
  const node = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (node) node.content = value;
}

export function usePage(): PageMeta {
  const { path } = useRoute();
  return pageByPath(path);
}

function resolveSrcSet(srcSet: string) {
  return srcSet
    .split(",")
    .map((part) => {
      const [url, descriptor] = part.trim().split(/\s+/);
      return descriptor ? `${publicAsset(url)} ${descriptor}` : publicAsset(url);
    })
    .join(", ");
}

export function Photo({
  src,
  alt,
  width,
  height,
  srcSet,
  sizes,
  priority = false,
  className,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  srcSet?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <img
      className={className}
      src={publicAsset(src)}
      srcSet={srcSet ? resolveSrcSet(srcSet) : undefined}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      width={width}
      height={height}
      decoding="async"
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
    />
  );
}

export function SectionHead({ title, intro }: { title: string; intro?: string }) {
  return (
    <header className="section-head">
      <h2>{title}</h2>
      {intro ? <p className="lede">{intro}</p> : null}
    </header>
  );
}

export function BookLink({
  href,
  label,
  children,
  className = "btn btn-primary",
}: {
  href: string;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer" aria-label={`${label} (s’ouvre dans un nouvel onglet)`}>
      {children}
    </a>
  );
}
