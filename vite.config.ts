import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import react from "@vitejs/plugin-react";
import { build } from "esbuild";
import { defineConfig, type Plugin } from "vite";

type HeadPage = {
  id: string;
  path: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  url: string;
  jsonld: unknown;
  noscript: string;
};

function esc(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
}

function serialize(data: unknown) {
  return JSON.stringify(data).replaceAll("<", "\\u003c");
}

function fill(html: string, page: HeadPage, origin: string) {
  const image = `${origin}${page.image.replace(/^\//, "")}`;
  return html
    .replaceAll("__SEO_TITLE__", esc(page.title))
    .replaceAll("__SEO_DESCRIPTION__", esc(page.description))
    .replaceAll("__SEO_URL__", esc(page.url))
    .replaceAll("__SEO_IMAGE__", esc(image))
    .replaceAll("__SEO_IMAGE_ALT__", esc(page.imageAlt))
    .replaceAll("__SEO_JSONLD__", serialize(page.jsonld))
    .replace("<!--SEO_NOSCRIPT-->", `<noscript>${page.noscript}</noscript>`);
}

function seoPlugin(pages: HeadPage[]): Plugin {
  const home = pages.find((page) => page.id === "home");
  if (!home) throw new Error("Page d’accueil absente du manifeste SEO.");
  let template = "";
  for (const page of pages) {
    if (page.title.length < 50 || page.title.length > 65) {
      throw new Error(`Titre SEO « ${page.id} » : ${page.title.length} caractères (attendu 50–65).`);
    }
    if (page.description.length < 140 || page.description.length > 165) {
      throw new Error(`Description SEO « ${page.id} » : ${page.description.length} caractères (attendu 140–165).`);
    }
  }
  const rawLd = JSON.stringify(pages.map((page) => page.jsonld));
  if (/"telephone"\s*:/.test(rawLd) || /"email"\s*:/.test(rawLd) || /streetAddress/.test(rawLd)) {
    throw new Error("Le JSON-LD ne doit pas contenir de téléphone, d’e-mail ou d’adresse tant qu’ils ne sont pas réels.");
  }
  if (/"priceRange"\s*:/.test(rawLd) || /"price"\s*:/.test(rawLd) || /"offers"\s*:/.test(rawLd)) {
    throw new Error("Le JSON-LD ne doit pas publier de tarif ni d’offre chiffrée.");
  }

  return {
    name: "seo-routes",
    transformIndexHtml(html) {
      template = html;
      return fill(html, home, "https://habjeb.github.io/maquette-dieteticien/");
    },
    closeBundle() {
      const dist = path.resolve("dist");
      if (!template.includes("__SEO_TITLE__")) {
        template = readFileSync(path.join(dist, "index.html"), "utf8");
      }
      for (const page of pages) {
        if (page.id === "home") continue;
        const html = fill(template, page, "https://habjeb.github.io/maquette-dieteticien/");
        if (page.id === "not-found") {
          writeFileSync(path.join(dist, "404.html"), html);
          continue;
        }
        const dir = path.join(dist, page.path.replace(/^\//, ""));
        mkdirSync(dir, { recursive: true });
        writeFileSync(path.join(dir, "index.html"), html);
      }
    },
  };
}

export default defineConfig(async () => {
  const outfile = path.resolve("node_modules/.tmp/seo-manifest.mjs");
  mkdirSync(path.dirname(outfile), { recursive: true });
  await build({
    entryPoints: [path.resolve("src/seo/manifest.ts")],
    bundle: true,
    format: "esm",
    platform: "node",
    outfile,
    absWorkingDir: process.cwd(),
  });
  const mod = (await import(`${pathToFileURL(outfile).href}?t=${Date.now()}`)) as {
    manifest: { pages: HeadPage[] };
  };

  return {
    base: "/maquette-dieteticien/",
    plugins: [react(), seoPlugin(mod.manifest.pages)],
  };
});
