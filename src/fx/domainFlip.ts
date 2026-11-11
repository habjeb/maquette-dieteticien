import { sitePath } from "../lib/paths";
import type { Liquid } from "./liquid";

type Mode = "full" | "fade" | "none";

type Rect = { top: number; left: number; width: number; height: number };

let busy = false;

export function flipBusy() {
  return busy;
}

function mode(): Mode {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "none";
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return "fade";
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory > 0 && nav.deviceMemory <= 2) return "fade";
  if ((navigator.hardwareConcurrency ?? 8) <= 2) return "fade";
  return "full";
}

function ease(t: number) {
  return 1 - (1 - t) ** 4;
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function frame() {
  return new Promise((resolve) => window.requestAnimationFrame(resolve));
}

async function waitFor(selector: string) {
  const start = performance.now();
  while (performance.now() - start < 1200) {
    const node = document.querySelector<HTMLElement>(selector);
    if (node && node.getBoundingClientRect().width > 0) return node;
    await frame();
  }
  return null;
}

function place(layer: HTMLElement, rect: Rect, radius: number) {
  layer.style.top = `${rect.top}px`;
  layer.style.left = `${rect.left}px`;
  layer.style.width = `${rect.width}px`;
  layer.style.height = `${rect.height}px`;
  layer.style.borderRadius = `${radius}px`;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function makeLayer(image: HTMLImageElement, rect: Rect) {
  const layer = document.createElement("div");
  layer.className = "flip-layer";
  layer.setAttribute("aria-hidden", "true");
  const img = document.createElement("img");
  img.src = image.currentSrc || image.src;
  img.alt = "";
  layer.appendChild(img);
  place(layer, rect, rect.height / 2);
  document.body.appendChild(layer);
  return layer;
}

async function animateLayer(options: {
  layer: HTMLElement;
  image: HTMLImageElement;
  from: Rect;
  to: Rect;
  dest?: HTMLElement | null;
  lockScroll?: boolean;
  reveal?: boolean;
}) {
  const { layer, image, from, reveal } = options;
  let to = options.to;
  const fx: { liquid: Liquid | null; canvas: HTMLCanvasElement | null } = { liquid: null, canvas: null };
  if (mode() === "full") {
    void import("./liquid")
      .then((mod) => {
        if (!layer.isConnected) return;
        const canvas = document.createElement("canvas");
        canvas.className = "flip-canvas";
        layer.appendChild(canvas);
        const liquid = mod.createLiquid(canvas, image);
        if (!liquid) {
          canvas.remove();
          return;
        }
        fx.canvas = canvas;
        fx.liquid = liquid;
      })
      .catch(() => {
        fx.liquid = null;
      });
  }
  const duration = 820;
  const start = performance.now();
  const naturalW = image.naturalWidth || image.width;
  const naturalH = image.naturalHeight || image.height;
  let revealed = false;
  await new Promise<void>((resolve) => {
    const step = (now: number) => {
      if (options.lockScroll) {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
      if (options.dest?.isConnected) to = options.dest.getBoundingClientRect();
      const t = Math.min(1, (now - start) / duration);
      const e = ease(t);
      const rect = {
        top: lerp(from.top, to.top, e),
        left: lerp(from.left, to.left, e),
        width: lerp(from.width, to.width, e),
        height: lerp(from.height, to.height, e),
      };
      const radius = lerp(Math.min(from.width, from.height) / 2, 0, e);
      place(layer, rect, radius);
      if (fx.liquid) {
        const amount = Math.sin(Math.PI * t) * 0.85;
        const crop = coverCropSafe(rect.width, rect.height, naturalW, naturalH);
        fx.liquid.draw((now - start) / 1000, amount, crop);
      }
      if (reveal && !revealed && t > 0.62) {
        revealed = true;
        document.documentElement.dataset.reveal = "1";
      }
      if (t < 1) window.requestAnimationFrame(step);
      else resolve();
    };
    window.requestAnimationFrame(step);
  });
  fx.liquid?.destroy();
  fx.canvas?.remove();
}

function coverCropSafe(boxW: number, boxH: number, imgW: number, imgH: number): [number, number, number, number] {
  if (boxW <= 0 || boxH <= 0 || imgW <= 0 || imgH <= 0) return [0, 0, 1, 1];
  const box = boxW / boxH;
  const img = imgW / imgH;
  if (box > img) {
    const visible = img / box;
    const v0 = (1 - visible) / 2;
    return [0, v0, 1, 1 - v0];
  }
  const visible = box / img;
  const u0 = (1 - visible) / 2;
  return [u0, 0, 1 - u0, 1];
}

function finish() {
  busy = false;
  delete document.documentElement.dataset.flip;
  delete document.documentElement.dataset.reveal;
  document.querySelector(".flip-layer")?.remove();
  try {
    history.scrollRestoration = "auto";
  } catch {
    /* ignore */
  }
}

export async function openDomain(options: {
  id: string;
  source: HTMLElement;
  href: string;
  navigate: (href: string, state?: unknown) => void;
}) {
  if (busy) return;
  const image = options.source.querySelector("img");
  if (!(image instanceof HTMLImageElement)) {
    options.navigate(options.href, { fromPills: true });
    return;
  }
  const current = mode();
  if (current === "none") {
    options.navigate(options.href, { fromPills: true });
    return;
  }
  if (current === "fade" && "startViewTransition" in document) {
    document.startViewTransition(() => options.navigate(options.href, { fromPills: true }));
    return;
  }
  if (current === "fade") {
    options.navigate(options.href, { fromPills: true });
    return;
  }
  busy = true;
  try {
    history.scrollRestoration = "manual";
  } catch {
    /* ignore */
  }
  const from = options.source.getBoundingClientRect();
  const layer = makeLayer(image, from);
  options.source.closest(".pill-row")?.classList.add("is-dimmed");
  document.documentElement.dataset.flip = "open";
  options.navigate(options.href, { fromPills: true });
  window.scrollTo(0, 0);
  await frame();
  window.scrollTo(0, 0);
  const dest = await waitFor(`[data-domain-hero="${options.id}"]`);
  if (!dest) {
    layer.remove();
    finish();
    return;
  }
  window.scrollTo(0, 0);
  try {
    await animateLayer({
      layer,
      image,
      from,
      to: dest.getBoundingClientRect(),
      dest,
      lockScroll: true,
      reveal: true,
    });
  } finally {
    layer.remove();
    finish();
  }
}

export async function closeDomain(navigate: (href: string) => void) {
  if (busy) return;
  const hero = document.querySelector<HTMLElement>("[data-domain-hero]");
  const image = hero?.querySelector("img");
  const id = hero?.dataset.domainHero;
  if (!hero || !(image instanceof HTMLImageElement) || !id) {
    navigate(sitePath("/#accompagnements"));
    return;
  }
  const current = mode();
  const go = () => {
    const state = history.state as { fromPills?: boolean } | null;
    if (state?.fromPills) history.back();
    else navigate(sitePath("/#accompagnements"));
  };
  if (current === "none") {
    go();
    return;
  }
  if (current === "fade" && "startViewTransition" in document) {
    document.startViewTransition(go);
    return;
  }
  if (current === "fade") {
    go();
    return;
  }
  busy = true;
  const from = hero.getBoundingClientRect();
  const layer = makeLayer(image, from);
  document.documentElement.dataset.flip = "close";
  go();
  await frame();
  await frame();
  const pill = await waitFor(`[data-pill="${id}"]`);
  if (!pill) {
    layer.remove();
    finish();
    return;
  }
  pill.scrollIntoView({ block: "center", behavior: "auto" });
  await frame();
  try {
    await animateLayer({ layer, image, from, to: pill.getBoundingClientRect() });
  } finally {
    layer.remove();
    finish();
  }
}

export function returnFromPop(commit: () => void) {
  if (busy) {
    commit();
    return;
  }
  const hero = document.querySelector<HTMLElement>("[data-domain-hero]");
  const image = hero?.querySelector("img");
  const id = hero?.dataset.domainHero;
  const nextIsHome = true;
  if (!hero || !(image instanceof HTMLImageElement) || !id || !nextIsHome || mode() !== "full") {
    if (mode() === "fade" && "startViewTransition" in document && hero) {
      document.startViewTransition(commit);
      return;
    }
    commit();
    return;
  }
  busy = true;
  const from = hero.getBoundingClientRect();
  const layer = makeLayer(image, from);
  document.documentElement.dataset.flip = "close";
  commit();
  void (async () => {
    await frame();
    await frame();
    const pill = await waitFor(`[data-pill="${id}"]`);
    if (!pill) {
      layer.remove();
      finish();
      return;
    }
    pill.scrollIntoView({ block: "center", behavior: "auto" });
    await wait(16);
    try {
      await animateLayer({ layer, image, from, to: pill.getBoundingClientRect() });
    } finally {
      layer.remove();
      finish();
    }
  })();
}
