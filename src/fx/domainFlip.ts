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
  return t >= 1 ? 1 : 1 - 2 ** (-10 * t);
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function frame() {
  return new Promise((resolve) => window.requestAnimationFrame(resolve));
}

function viewportRect(): Rect {
  return {
    top: 0,
    left: 0,
    width: document.documentElement.clientWidth,
    height: window.visualViewport?.height ?? window.innerHeight,
  };
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

function coverCrop(
  boxW: number,
  boxH: number,
  imgW: number,
  imgH: number,
  scale: number,
): [number, number, number, number] {
  if (boxW <= 0 || boxH <= 0 || imgW <= 0 || imgH <= 0) return [0, 0, 1, 1];
  const box = boxW / boxH;
  const img = imgW / imgH;
  let u0 = 0;
  let v0 = 0;
  let u1 = 1;
  let v1 = 1;
  if (img > box) {
    const visible = box / img;
    u0 = (1 - visible) / 2;
    u1 = u0 + visible;
  } else {
    const visible = img / box;
    v0 = (1 - visible) / 2;
    v1 = v0 + visible;
  }
  const zoom = Math.max(scale, 0.01);
  const cu = (u0 + u1) / 2;
  const cv = (v0 + v1) / 2;
  const halfW = (u1 - u0) / (2 * zoom);
  const halfH = (v1 - v0) / (2 * zoom);
  return [cu - halfW, cv - halfH, cu + halfW, cv + halfH];
}

function makeLayer(image: HTMLImageElement, rect: Rect, scale: number) {
  const layer = document.createElement("div");
  layer.className = "flip-layer";
  layer.setAttribute("aria-hidden", "true");
  const img = document.createElement("img");
  img.src = image.currentSrc || image.src;
  img.alt = "";
  img.style.transformOrigin = "center center";
  img.style.transform = `scale(${scale})`;
  layer.appendChild(img);
  place(layer, rect, Math.min(rect.width, rect.height) / 2);
  document.body.appendChild(layer);
  return { layer, img };
}

async function zoom(options: {
  layer: HTMLElement;
  img: HTMLImageElement;
  source: HTMLImageElement;
  from: Rect;
  to: Rect;
  fromScale: number;
  toScale: number;
  fromRadius: number;
  toRadius: number;
}) {
  const fx: { liquid: Liquid | null; canvas: HTMLCanvasElement | null } = {
    liquid: null,
    canvas: null,
  };
  if (mode() === "full") {
    void import("./liquid")
      .then((mod) => {
        if (!options.layer.isConnected) return;
        const canvas = document.createElement("canvas");
        canvas.className = "flip-canvas";
        options.layer.appendChild(canvas);
        const liquid = mod.createLiquid(canvas, options.source);
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
  const duration = 900;
  const start = performance.now();
  await new Promise<void>((resolve) => {
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const e = ease(t);
      const rect = {
        top: lerp(options.from.top, options.to.top, e),
        left: lerp(options.from.left, options.to.left, e),
        width: lerp(options.from.width, options.to.width, e),
        height: lerp(options.from.height, options.to.height, e),
      };
      place(options.layer, rect, lerp(options.fromRadius, options.toRadius, e));
      const scale = lerp(options.fromScale, options.toScale, e);
      options.img.style.transform = `scale(${scale})`;
      if (fx.liquid && fx.canvas) {
        const amount = Math.sin(Math.PI * t) * 0.7;
        const crop = coverCrop(
          rect.width,
          rect.height,
          options.source.naturalWidth || options.source.width,
          options.source.naturalHeight || options.source.height,
          scale,
        );
        fx.liquid.draw((now - start) / 1000, amount, crop);
      }
      if (t < 1) window.requestAnimationFrame(step);
      else resolve();
    };
    window.requestAnimationFrame(step);
  });
  fx.liquid?.destroy();
  fx.canvas?.remove();
}

function finish() {
  busy = false;
  document.documentElement.classList.remove("is-zooming");
  delete document.documentElement.dataset.flip;
  delete document.documentElement.dataset.locked;
  delete document.documentElement.dataset.reveal;
  document.querySelector(".flip-layer")?.remove();
  try {
    history.scrollRestoration = "auto";
  } catch {
    /* ignore */
  }
}

async function settleHome(id: string) {
  const start = performance.now();
  while (performance.now() - start < 1200) {
    const pill = document.querySelector<HTMLElement>(`[data-pill="${id}"]`);
    if (pill && pill.getBoundingClientRect().width > 0) {
      pill.scrollIntoView({ block: "center", behavior: "auto" });
      await frame();
      await frame();
      const rect = pill.getBoundingClientRect();
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        window.scrollBy(0, rect.top - (window.innerHeight - rect.height) / 2);
        await frame();
      }
      return pill;
    }
    await frame();
  }
  return null;
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
  if (current !== "full") {
    if (current === "fade" && "startViewTransition" in document) {
      document.startViewTransition(() => options.navigate(options.href, { fromPills: true }));
      return;
    }
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
  const { layer, img } = makeLayer(image, from, 1);
  document.documentElement.classList.add("is-zooming");
  try {
    await zoom({
      layer,
      img,
      source: image,
      from,
      to: viewportRect(),
      fromScale: 1,
      toScale: 1.15,
      fromRadius: Math.min(from.width, from.height) / 2,
      toRadius: 0,
    });
    const pin = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    pin();
    document.documentElement.dataset.flip = "open";
    options.navigate(options.href, { fromPills: true });
    for (let i = 0; i < 12; i += 1) {
      pin();
      await frame();
      if (window.scrollY <= 1) break;
    }
    pin();
    document.documentElement.dataset.locked = "1";
    await frame();
    const hero = document.querySelector("[data-domain-hero]");
    const heroRect = hero?.getBoundingClientRect();
    if (!heroRect || heroRect.top > 4 || window.scrollY > 1) {
      delete document.documentElement.dataset.locked;
      pin();
      await frame();
      pin();
      document.documentElement.dataset.locked = "1";
      await frame();
    }
    layer.remove();
    await frame();
    document.documentElement.dataset.reveal = "1";
    const timer = window.setInterval(pin, 50);
    await wait(620);
    window.clearInterval(timer);
    pin();
  } finally {
    finish();
  }
}

async function shrinkToPill(id: string, image: HTMLImageElement, go: () => void) {
  busy = true;
  try {
    history.scrollRestoration = "manual";
  } catch {
    /* ignore */
  }
  window.scrollTo(0, 0);
  const from = viewportRect();
  const { layer, img } = makeLayer(image, from, 1.15);
  place(layer, from, 0);
  document.documentElement.dataset.flip = "close";
  go();
  try {
    const pill = await settleHome(id);
    if (!pill) return;
    const to = pill.getBoundingClientRect();
    await zoom({
      layer,
      img,
      source: image,
      from,
      to,
      fromScale: 1.15,
      toScale: 1,
      fromRadius: 0,
      toRadius: Math.min(to.width, to.height) / 2,
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
  const go = () => {
    const state = history.state as { fromPills?: boolean } | null;
    if (state?.fromPills) history.back();
    else navigate(sitePath("/#accompagnements"));
  };
  if (!hero || !(image instanceof HTMLImageElement) || !id || mode() !== "full") {
    if (mode() === "fade" && "startViewTransition" in document) {
      document.startViewTransition(go);
      return;
    }
    go();
    return;
  }
  await shrinkToPill(id, image, go);
}

export function returnFromPop(commit: () => void) {
  if (busy) {
    commit();
    return;
  }
  const hero = document.querySelector<HTMLElement>("[data-domain-hero]");
  const image = hero?.querySelector("img");
  const id = hero?.dataset.domainHero;
  if (!hero || !(image instanceof HTMLImageElement) || !id || mode() !== "full") {
    if (mode() === "fade" && "startViewTransition" in document && hero) {
      document.startViewTransition(commit);
      return;
    }
    commit();
    return;
  }
  void shrinkToPill(id, image, commit);
}
