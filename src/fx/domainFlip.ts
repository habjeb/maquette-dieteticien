import { sitePath } from "../lib/paths";
import type { Liquid } from "./liquid";

type Mode = "full" | "fade" | "none";

const SCALE = 1.15;
const DURATION = 1000;
const EASING = "cubic-bezier(0.25, 0.1, 0.2, 1)";

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

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function frame() {
  return new Promise((resolve) => window.requestAnimationFrame(resolve));
}

function measureViewport() {
  const width = document.documentElement.clientWidth;
  const probe = document.createElement("div");
  probe.style.cssText = "position:fixed;left:0;top:0;width:100%;height:100dvh;visibility:hidden;pointer-events:none;";
  document.body.appendChild(probe);
  const height = probe.getBoundingClientRect().height;
  probe.remove();
  return { width, height };
}

function coverCrop(boxW: number, boxH: number, imgW: number, imgH: number, scale: number): [number, number, number, number] {
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
  return [cu - (u1 - u0) / (2 * zoom), cv - (v1 - v0) / (2 * zoom), cu + (u1 - u0) / (2 * zoom), cv + (v1 - v0) / (2 * zoom)];
}

export function syncPillWindows() {
  const { width, height } = measureViewport();
  document.querySelectorAll<HTMLElement>("[data-pill]").forEach((pill) => {
    const img = pill.querySelector("img");
    if (!(img instanceof HTMLImageElement)) return;
    const rect = pill.getBoundingClientRect();
    img.style.width = `${width}px`;
    img.style.height = `${height}px`;
    img.style.left = `${-rect.left}px`;
    img.style.top = `${-rect.top}px`;
  });
}

function clipFor(rect: { top: number; left: number; width: number; height: number }, view: { width: number; height: number }) {
  const top = rect.top;
  const left = rect.left;
  const right = view.width - (rect.left + rect.width);
  const bottom = view.height - (rect.top + rect.height);
  const radius = Math.min(Math.max(rect.width, 0), Math.max(rect.height, 0)) / 2;
  return `inset(${top}px ${right}px ${bottom}px ${left}px round ${radius}px)`;
}

function fullClip() {
  return "inset(0px 0px 0px 0px round 0px)";
}

function makeStage(source: HTMLImageElement, view: { width: number; height: number }) {
  const layer = document.createElement("div");
  layer.className = "flip-layer";
  layer.setAttribute("aria-hidden", "true");
  layer.style.width = `${view.width}px`;
  layer.style.height = `${view.height}px`;
  const img = document.createElement("img");
  img.src = source.currentSrc || source.src;
  img.alt = "";
  layer.appendChild(img);
  document.body.appendChild(layer);
  return layer;
}

async function playClip(layer: HTMLElement, from: string, to: string, source: HTMLImageElement, view: { width: number; height: number }) {
  layer.style.clipPath = from;
  layer.getBoundingClientRect();
  await frame();
  await frame();
  const fx: { liquid: Liquid | null; canvas: HTMLCanvasElement | null } = { liquid: null, canvas: null };
  const crop = coverCrop(view.width, view.height, source.naturalWidth || source.width, source.naturalHeight || source.height, SCALE);
  if (mode() === "full") {
    void import("./liquid")
      .then((mod) => {
        if (!layer.isConnected) return;
        const canvas = document.createElement("canvas");
        canvas.className = "flip-canvas";
        layer.appendChild(canvas);
        const liquid = mod.createLiquid(canvas, source);
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
  const anim = layer.animate([{ clipPath: from }, { clipPath: to }], {
    duration: DURATION,
    easing: EASING,
    fill: "forwards",
  });
  await new Promise<void>((resolve) => {
    const step = () => {
      const time = Number(anim.currentTime || 0);
      const t = Math.min(1, time / DURATION);
      if (fx.liquid) fx.liquid.draw(time / 1000, Math.sin(Math.PI * t) * 0.55, crop);
      if (!layer.isConnected || anim.playState === "finished" || anim.playState === "idle") {
        resolve();
        return;
      }
      window.requestAnimationFrame(step);
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

async function placePill(id: string) {
  const start = performance.now();
  while (performance.now() - start < 1200) {
    const pill = document.querySelector<HTMLElement>(`[data-pill="${id}"]`);
    if (pill && pill.getBoundingClientRect().width > 0) {
      pill.scrollIntoView({ block: "center", inline: "center", behavior: "auto" });
      await frame();
      await frame();
      syncPillWindows();
      await frame();
      const rect = pill.getBoundingClientRect();
      if (rect.top < 0 || rect.bottom > window.innerHeight || rect.left < 0 || rect.right > document.documentElement.clientWidth) {
        window.scrollBy({ left: 0, top: rect.top - (window.innerHeight - rect.height) / 2, behavior: "auto" });
        await frame();
        syncPillWindows();
        await frame();
      }
      return pill;
    }
    await frame();
  }
  return null;
}

function pinTop() {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
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
  syncPillWindows();
  await frame();
  const view = measureViewport();
  const fromRect = options.source.getBoundingClientRect();
  const layer = makeStage(image, view);
  const from = clipFor(fromRect, view);
  try {
    document.documentElement.classList.add("is-zooming");
    await playClip(layer, from, fullClip(), image, view);
    pinTop();
    document.documentElement.dataset.flip = "open";
    options.navigate(options.href, { fromPills: true });
    for (let i = 0; i < 12; i += 1) {
      pinTop();
      await frame();
      if (window.scrollY <= 1) break;
    }
    pinTop();
    document.documentElement.dataset.locked = "1";
    await frame();
    layer.remove();
    await frame();
    document.documentElement.dataset.reveal = "1";
    const timer = window.setInterval(pinTop, 50);
    await wait(620);
    window.clearInterval(timer);
    pinTop();
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
  pinTop();
  const view = measureViewport();
  const layer = makeStage(image, view);
  layer.style.clipPath = fullClip();
  document.documentElement.dataset.flip = "close";
  go();
  try {
    const pill = await placePill(id);
    if (!pill) return;
    const viewNow = measureViewport();
    layer.style.width = `${viewNow.width}px`;
    layer.style.height = `${viewNow.height}px`;
    await playClip(layer, fullClip(), clipFor(pill.getBoundingClientRect(), viewNow), image, viewNow);
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
