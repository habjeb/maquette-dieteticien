import { sitePath } from "../lib/paths";
import type { Liquid } from "./liquid";

type Mode = "full" | "plain";

const SCALE = 1.15;
const DURATION = 1000;
const PLAIN_DURATION = 700;
const EASING = "cubic-bezier(0.25, 0.1, 0.2, 1)";

let busy = false;

export function flipBusy() {
  return busy;
}

function mode(): Mode {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const weak =
    Boolean(nav.connection?.saveData) ||
    (typeof nav.deviceMemory === "number" && nav.deviceMemory > 0 && nav.deviceMemory <= 2) ||
    (navigator.hardwareConcurrency ?? 8) <= 2;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || weak) return "plain";
  return "full";
}

function zoomDuration() {
  return mode() === "plain" ? PLAIN_DURATION : DURATION;
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function frame() {
  return new Promise((resolve) => window.requestAnimationFrame(resolve));
}

function measureViewport() {
  const probe = document.createElement("div");
  probe.style.cssText = "position:fixed;left:0;top:0;width:100vw;height:100dvh;visibility:hidden;pointer-events:none;";
  document.body.appendChild(probe);
  const box = probe.getBoundingClientRect();
  probe.remove();
  const visual = window.visualViewport;
  const width = Math.max(box.width, visual?.width ?? 0, window.innerWidth);
  const height = Math.max(box.height, visual?.height ?? 0, window.innerHeight);
  document.documentElement.style.setProperty("--flip-h", `${height}px`);
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

function endRadius(rect: Box, view: { width: number; height: number }) {
  const covers =
    rect.top <= 1 &&
    rect.left <= 1 &&
    rect.width >= view.width - 2 &&
    rect.height >= view.height - 2;
  if (covers) return 0;
  return Math.min(Math.max(rect.width, 0), Math.max(rect.height, 0)) / 2;
}

function clipFor(rect: Box, view: { width: number; height: number }, radius: number) {
  const top = rect.top;
  const left = rect.left;
  const right = view.width - (rect.left + rect.width);
  const bottom = view.height - (rect.top + rect.height);
  return `inset(${top}px ${right}px ${bottom}px ${left}px round ${radius}px)`;
}

type Box = { top: number; left: number; width: number; height: number };
type ScrollMemory = { top: number; left: number };

let scrollMemory: ScrollMemory | null = null;
let clipReady: boolean | null = null;
let pinGeneration = 0;

function rememberScroll(source: HTMLElement) {
  const row = source.closest(".pill-row");
  scrollMemory = {
    top: window.scrollY,
    left: row instanceof HTMLElement ? row.scrollLeft : 0,
  };
}

function restoreScroll() {
  if (!scrollMemory) return;
  window.scrollTo(0, scrollMemory.top);
  const row = document.querySelector(".pill-row");
  if (row instanceof HTMLElement) row.scrollLeft = scrollMemory.left;
}

function setClip(layer: HTMLElement, value: string) {
  layer.style.clipPath = value;
  layer.style.setProperty("-webkit-clip-path", value);
}

function clipPathAnimates() {
  if (clipReady !== null) return clipReady;
  const forced = (window as Window & { __forceBox?: boolean }).__forceBox;
  if (forced || typeof CSS === "undefined" || !CSS.supports("clip-path", "inset(8px round 8px)")) {
    clipReady = false;
    return false;
  }
  const probe = document.createElement("div");
  probe.style.cssText = "position:fixed;left:0;top:0;width:40px;height:40px;visibility:hidden;";
  setClip(probe, "inset(0px round 0px)");
  document.body.appendChild(probe);
  try {
    const anim = probe.animate(
      [
        { clipPath: "inset(0px round 0px)" },
        { clipPath: "inset(8px round 8px)" },
      ],
      { duration: 1000, fill: "both" },
    );
    anim.pause();
    anim.currentTime = 500;
    const value = getComputedStyle(probe).clipPath || probe.style.getPropertyValue("-webkit-clip-path");
    anim.cancel();
    const amount = Number(value.match(/inset\(\s*([0-9.]+)/)?.[1] ?? "0");
    clipReady = value.includes("inset") && amount > 1 && amount < 7.5;
  } catch {
    clipReady = false;
  }
  probe.remove();
  return clipReady;
}

function makeStage(source: HTMLImageElement) {
  const layer = document.createElement("div");
  layer.className = "flip-layer";
  layer.setAttribute("aria-hidden", "true");
  const img = document.createElement("img");
  img.src = source.currentSrc || source.src;
  img.alt = "";
  layer.appendChild(img);
  document.body.appendChild(layer);
  return { layer, img };
}

function alignWindow(img: HTMLImageElement, layer: HTMLElement, view: { width: number; height: number }) {
  const rect = layer.getBoundingClientRect();
  img.style.width = `${view.width}px`;
  img.style.height = `${view.height}px`;
  img.style.left = `${-rect.left}px`;
  img.style.top = `${-rect.top}px`;
}

function attachRipple(layer: HTMLElement, source: HTMLImageElement, view: { width: number; height: number }) {
  const fx: {
    liquid: Liquid | null;
    canvas: HTMLCanvasElement | null;
    crop: [number, number, number, number] | null;
  } = { liquid: null, canvas: null, crop: null };
  if (mode() !== "full") return fx;
  fx.crop = coverCrop(view.width, view.height, source.naturalWidth || source.width, source.naturalHeight || source.height, SCALE);
  const crop = fx.crop;
  void import("./liquid")
    .then((mod) => {
      if (!layer.isConnected || !crop) return;
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
      fx.liquid.draw(0, 0, crop);
    })
    .catch(() => {
      fx.liquid = null;
    });
  return fx;
}

async function runAnimation(anim: Animation, onFrame: (t: number) => void) {
  const duration = zoomDuration();
  await new Promise<void>((resolve) => {
    const step = () => {
      const time = Number(anim.currentTime || 0);
      onFrame(Math.min(1, time / duration));
      if (!anim.effect || anim.playState === "finished" || anim.playState === "idle") {
        resolve();
        return;
      }
      window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  });
}

async function playZoom(options: {
  layer: HTMLElement;
  img: HTMLImageElement;
  source: HTMLImageElement;
  from: Box;
  to: Box;
  view: { width: number; height: number };
}) {
  const { layer, img, source, from, to, view } = options;
  const duration = zoomDuration();
  const useClip = clipPathAnimates();
  document.documentElement.dataset.zoomTech = useClip ? "clip" : "box";
  const ripple = attachRipple(layer, source, view);
  if (useClip) {
    layer.style.top = "0px";
    layer.style.left = "0px";
    layer.style.width = `${view.width}px`;
    layer.style.height = `${view.height}px`;
    alignWindow(img, layer, view);
    const fromClip = clipFor(from, view, endRadius(from, view));
    const toClip = clipFor(to, view, endRadius(to, view));
    setClip(layer, fromClip);
    layer.getBoundingClientRect();
    await frame();
    await frame();
    const anim = layer.animate(
      [
        { clipPath: fromClip, webkitClipPath: fromClip },
        { clipPath: toClip, webkitClipPath: toClip },
      ],
      {
        duration,
        easing: EASING,
        fill: "forwards",
      },
    );
    await runAnimation(anim, (t) => {
      if (ripple.liquid && ripple.crop) ripple.liquid.draw(t, Math.sin(Math.PI * t) * 0.55, ripple.crop);
    });
    setClip(layer, toClip);
    if (endRadius(to, view) === 0) await wait(160);
    await frame();
  } else {
    const fromRadius = endRadius(from, view);
    const toRadius = endRadius(to, view);
    layer.style.top = `${from.top}px`;
    layer.style.left = `${from.left}px`;
    layer.style.width = `${from.width}px`;
    layer.style.height = `${from.height}px`;
    layer.style.borderRadius = `${fromRadius}px`;
    setClip(layer, "none");
    alignWindow(img, layer, view);
    layer.getBoundingClientRect();
    await frame();
    await frame();
    const anim = layer.animate(
      [
        {
          top: `${from.top}px`,
          left: `${from.left}px`,
          width: `${from.width}px`,
          height: `${from.height}px`,
          borderRadius: `${fromRadius}px`,
        },
        {
          top: `${to.top}px`,
          left: `${to.left}px`,
          width: `${to.width}px`,
          height: `${to.height}px`,
          borderRadius: `${toRadius}px`,
        },
      ],
      { duration, easing: EASING, fill: "forwards" },
    );
    await runAnimation(anim, (t) => {
      alignWindow(img, layer, view);
      if (ripple.liquid && ripple.crop) ripple.liquid.draw(t, Math.sin(Math.PI * t) * 0.55, ripple.crop);
    });
    layer.style.top = `${to.top}px`;
    layer.style.left = `${to.left}px`;
    layer.style.width = `${to.width}px`;
    layer.style.height = `${to.height}px`;
    layer.style.borderRadius = `${toRadius}px`;
    alignWindow(img, layer, view);
    if (toRadius === 0) await wait(160);
    await frame();
  }
  ripple.liquid?.destroy();
  ripple.canvas?.remove();
}

function finish() {
  busy = false;
  document.documentElement.classList.remove("is-zooming");
  delete document.documentElement.dataset.flip;
  delete document.documentElement.dataset.locked;
  delete document.documentElement.dataset.reveal;
  document.querySelector(".flip-layer")?.remove();
}

function release() {
  busy = false;
}

async function placePill(id: string) {
  const start = performance.now();
  while (performance.now() - start < 1200) {
    const pill = document.querySelector<HTMLElement>(`[data-pill="${id}"]`);
    if (pill && pill.getBoundingClientRect().width > 0) {
      if (scrollMemory) restoreScroll();
      else pill.scrollIntoView({ block: "center", inline: "center", behavior: "auto" });
      await frame();
      syncPillWindows();
      await frame();
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
  busy = true;
  try {
    history.scrollRestoration = "manual";
  } catch {
    /* ignore */
  }
  rememberScroll(options.source);
  syncPillWindows();
  await frame();
  const view = measureViewport();
  const fromRect = options.source.getBoundingClientRect();
  const { layer, img } = makeStage(image);
  const generation = pinGeneration;
  try {
    if (current === "full") document.documentElement.classList.add("is-zooming");
    await playZoom({
      layer,
      img,
      source: image,
      from: fromRect,
      to: { top: 0, left: 0, width: view.width, height: view.height },
      view,
    });
    document.documentElement.dataset.flip = "open";
    try {
      history.scrollRestoration = "auto";
    } catch {
      /* ignore */
    }
    options.navigate(options.href, { fromPills: true, scrollY: scrollMemory?.top ?? 0 });
  } finally {
    release();
  }
  if (generation !== pinGeneration || document.documentElement.dataset.flip === "close") {
    layer.remove();
    return;
  }
  pinTop();
  for (let i = 0; i < 12; i += 1) {
    if (generation !== pinGeneration || document.documentElement.dataset.flip !== "open") break;
    pinTop();
    await frame();
    if (window.scrollY <= 1) break;
  }
  if (generation !== pinGeneration || document.documentElement.dataset.flip !== "open") {
    layer.remove();
    return;
  }
  document.documentElement.dataset.locked = "1";
  layer.remove();
  document.documentElement.dataset.reveal = "1";
  const timer = window.setInterval(() => {
    if (generation !== pinGeneration || document.documentElement.dataset.flip !== "open") {
      window.clearInterval(timer);
      return;
    }
    pinTop();
  }, 50);
  await wait(420);
  window.clearInterval(timer);
  if (generation === pinGeneration && document.documentElement.dataset.flip === "open") pinTop();
}

async function shrinkToPill(id: string, image: HTMLImageElement, go: () => void) {
  pinGeneration += 1;
  busy = true;
  try {
    history.scrollRestoration = "manual";
  } catch {
    /* ignore */
  }
  const onHome = /\/maquette-dieteticien\/?$/.test(window.location.pathname);
  if (!onHome) pinTop();
  const { layer, img } = makeStage(image);
  document.documentElement.dataset.flip = "close";
  go();
  try {
    const pill = await placePill(id);
    if (!pill) return;
    const viewNow = measureViewport();
    await playZoom({
      layer,
      img,
      source: image,
      from: { top: 0, left: 0, width: viewNow.width, height: viewNow.height },
      to: pill.getBoundingClientRect(),
      view: viewNow,
    });
    restoreScroll();
  } finally {
    layer.remove();
    finish();
    restoreScroll();
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
  if (!hero || !(image instanceof HTMLImageElement) || !id) {
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
  if (!hero || !(image instanceof HTMLImageElement) || !id) {
    commit();
    return;
  }
  void shrinkToPill(id, image, commit);
}
