import { sitePath } from "../lib/paths";
import { pauseScroll, resumeScroll } from "./motion";
import type { Liquid } from "./liquid";

type Mode = "full" | "plain";

const SCALE = 1.15;
const DURATION = 1000;
const PLAIN_DURATION = 700;

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
  const visual = window.visualViewport;
  // innerWidth/innerHeight include the scrollbar, like 100vw/100dvh.
  // clientWidth is narrower once the page is scrolled, and sizing the
  // overlay with it makes the hero crop jump when the bar disappears.
  const width = Math.max(window.innerWidth, Math.round(visual?.width ?? 0));
  const height = Math.max(window.innerHeight, Math.round(visual?.height ?? 0));
  document.documentElement.style.setProperty("--flip-w", `${width}px`);
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
  const narrow = window.matchMedia("(max-width: 899px)").matches;
  document.querySelectorAll<HTMLElement>("[data-pill]").forEach((pill) => {
    const img = pill.querySelector("img");
    if (!(img instanceof HTMLImageElement)) return;
    if (narrow) {
      img.style.width = "";
      img.style.height = "";
      img.style.left = "";
      img.style.top = "";
      return;
    }
    const rect = pill.getBoundingClientRect();
    img.style.width = `${width}px`;
    img.style.height = `${height}px`;
    img.style.left = `${-rect.left}px`;
    img.style.top = `${-rect.top}px`;
  });
}

function cornerRadius(el: HTMLElement) {
  const raw = getComputedStyle(el).borderTopLeftRadius.trim();
  const value = Number.parseFloat(raw);
  if (!Number.isFinite(value)) return 0;
  if (raw.endsWith("%")) {
    const rect = el.getBoundingClientRect();
    return (value / 100) * Math.min(rect.width, rect.height);
  }
  return value;
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
  const row = source.closest(".sector-cards");
  scrollMemory = {
    top: window.scrollY,
    left: row instanceof HTMLElement ? row.scrollLeft : 0,
  };
}

function restoreScroll() {
  if (!scrollMemory) return;
  window.scrollTo(0, scrollMemory.top);
  const row = document.querySelector(".sector-cards");
  if (row instanceof HTMLElement) row.scrollLeft = scrollMemory.left;
}

function setClip(layer: HTMLElement, value: string) {
  layer.style.clipPath = value;
  layer.style.setProperty("-webkit-clip-path", value);
}

function coversViewport(layer: HTMLElement, view: { width: number; height: number }) {
  const rect = layer.getBoundingClientRect();
  if (rect.left > 1 || rect.top > 1) return false;
  if (rect.right < view.width - 2 || rect.bottom < view.height - 2) return false;
  const clip = getComputedStyle(layer).clipPath;
  if (clip === "none" || clip === "unset") {
    return (Number.parseFloat(getComputedStyle(layer).borderRadius) || 0) < 0.5;
  }
  const nums = [...clip.matchAll(/[\d.]+/g)].map(Number);
  if (nums.length === 0) return clip === "inset(0px)" || clip === "inset(0)";
  const round = clip.includes("round") ? nums[nums.length - 1] : 0;
  const insets = clip.includes("round") ? nums.slice(0, -1) : nums;
  return insets.every((value) => value < 1) && (round ?? 0) < 1;
}

function clipPathAnimates() {
  if (clipReady !== null) return clipReady;
  const forced = (window as Window & { __forceBox?: boolean }).__forceBox;
  if (forced || typeof CSS === "undefined" || !CSS.supports("clip-path", "inset(8px round 8px)")) {
    clipReady = false;
    return false;
  }
  const probe = document.createElement("div");
  probe.className = "flip-layer";
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

function mix(from: number, to: number, t: number) {
  return from + (to - from) * t;
}

function mixBox(from: Box, to: Box, t: number): Box {
  return {
    top: mix(from.top, to.top, t),
    left: mix(from.left, to.left, t),
    width: mix(from.width, to.width, t),
    height: mix(from.height, to.height, t),
  };
}

function ease(t: number) {
  const x1 = 0.25;
  const y1 = 0.1;
  const x2 = 0.2;
  const y2 = 1;
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  let u = t;
  for (let i = 0; i < 6; i += 1) {
    const x = ((ax * u + bx) * u + cx) * u - t;
    const dx = (3 * ax * u + 2 * bx) * u + cx;
    if (Math.abs(dx) < 1e-5) break;
    u -= x / dx;
  }
  const clamped = Math.min(1, Math.max(0, u));
  return ((ay * clamped + by) * clamped + cy) * clamped;
}

function dropAnimations(layer: HTMLElement) {
  layer.getAnimations().forEach((anim) => anim.cancel());
}

function applyBox(layer: HTMLElement, rect: Box, radius: number) {
  layer.style.top = `${rect.top}px`;
  layer.style.left = `${rect.left}px`;
  layer.style.width = `${rect.width}px`;
  layer.style.height = `${rect.height}px`;
  layer.style.borderRadius = `${radius}px`;
}

function paintFrame(
  layer: HTMLElement,
  img: HTMLImageElement,
  rect: Box,
  radius: number,
  view: { width: number; height: number },
  useClip: boolean,
) {
  dropAnimations(layer);
  if (useClip) {
    layer.style.top = "0px";
    layer.style.left = "0px";
    layer.style.width = `${view.width}px`;
    layer.style.height = `${view.height}px`;
    layer.style.borderRadius = "0px";
    setClip(layer, clipFor(rect, view, radius));
  } else {
    setClip(layer, "none");
    applyBox(layer, rect, radius);
  }
  alignWindow(img, layer, view);
}

async function confirmCover(layer: HTMLElement, view: { width: number; height: number }) {
  for (let i = 0; i < 8; i += 1) {
    await frame();
    if (!coversViewport(layer, view)) continue;
    document.documentElement.dataset.zoomPhase = "covered";
    await frame();
    return coversViewport(layer, view);
  }
  return false;
}

async function playZoom(options: {
  layer: HTMLElement;
  img: HTMLImageElement;
  source: HTMLImageElement;
  from: Box;
  to: Box;
  fromRadius: number;
  toRadius: number;
  view: { width: number; height: number };
}) {
  const { layer, img, source, from, to, fromRadius, toRadius, view } = options;
  const duration = zoomDuration();
  const useClip = clipPathAnimates();
  document.documentElement.dataset.zoomTech = useClip ? "clip" : "box";
  const ripple = attachRipple(layer, source, view);
  // Each frame is an inline style. A WAAPI clip-path leaves the corner radius
  // stuck on the pill value under Chrome, and fill:forwards then beats the
  // final inline style. animation:none (Windows animation effects) can also
  // mark that animation idle before the last keyframe is painted.
  paintFrame(layer, img, from, fromRadius, view, useClip);
  layer.getBoundingClientRect();
  await frame();
  await frame();
  const started = performance.now();
  await new Promise<void>((resolve) => {
    const step = (now: number) => {
      const raw = Math.min(1, (now - started) / duration);
      const t = raw >= 1 ? 1 : ease(raw);
      paintFrame(layer, img, mixBox(from, to, t), mix(fromRadius, toRadius, t), view, useClip);
      if (ripple.liquid && ripple.crop) ripple.liquid.draw(t, Math.sin(Math.PI * t) * 0.55, ripple.crop);
      if (raw < 1) window.requestAnimationFrame(step);
      else resolve();
    };
    window.requestAnimationFrame(step);
  });
  paintFrame(layer, img, to, toRadius, view, useClip);
  let covered = toRadius !== 0 || (await confirmCover(layer, view));
  if (toRadius === 0 && !covered) {
    paintFrame(layer, img, to, 0, view, false);
    document.documentElement.dataset.zoomTech = "box";
    covered = await confirmCover(layer, view);
  }
  if (toRadius === 0 && covered) await wait(180);
  ripple.liquid?.destroy();
  ripple.canvas?.remove();
  return toRadius === 0 ? covered : true;
}

function finish() {
  busy = false;
  document.documentElement.classList.remove("is-zooming");
  delete document.documentElement.dataset.flip;
  delete document.documentElement.dataset.locked;
  delete document.documentElement.dataset.reveal;
  delete document.documentElement.dataset.zoomPhase;
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
  pauseScroll();
  const heldScroll = window.scrollY;
  const keepScroll = () => {
    if (document.documentElement.dataset.zoomPhase === "run" && Math.abs(window.scrollY - heldScroll) > 1) {
      window.scrollTo(0, heldScroll);
    }
  };
  window.addEventListener("scroll", keepScroll, { passive: true });
  syncPillWindows();
  await frame();
  const view = measureViewport();
  const fromRect = options.source.getBoundingClientRect();
  const { layer, img } = makeStage(image);
  const full: Box = { top: 0, left: 0, width: view.width, height: view.height };
  const generation = pinGeneration;
  try {
    if (current === "full") document.documentElement.classList.add("is-zooming");
    document.documentElement.dataset.zoomPhase = "run";
    const covered = await playZoom({
      layer,
      img,
      source: image,
      from: fromRect,
      to: full,
      fromRadius: cornerRadius(options.source),
      toRadius: 0,
      view,
    });
    if (!covered || !coversViewport(layer, view)) {
      paintFrame(layer, img, full, 0, view, false);
      await confirmCover(layer, view);
    }
    window.removeEventListener("scroll", keepScroll);
    if (!coversViewport(layer, view)) {
      layer.remove();
      options.navigate(options.href, { fromPills: true, scrollY: scrollMemory?.top ?? 0 });
      resumeScroll(0);
      return;
    }
    document.documentElement.dataset.zoomPhase = "covered";
    document.documentElement.dataset.flip = "open";
    try {
      history.scrollRestoration = "auto";
    } catch {
      /* ignore */
    }
    options.navigate(options.href, { fromPills: true, scrollY: scrollMemory?.top ?? 0 });
  } finally {
    window.removeEventListener("scroll", keepScroll);
    release();
  }
  if (generation !== pinGeneration || document.documentElement.dataset.flip === "close") {
    layer.remove();
    resumeScroll(scrollMemory?.top);
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
    resumeScroll(scrollMemory?.top);
    return;
  }
  document.documentElement.dataset.locked = "1";
  for (let i = 0; i < 20; i += 1) {
    const stage = document.querySelector("[data-domain-hero]");
    const photo = stage?.querySelector("img");
    if (stage instanceof HTMLElement && photo instanceof HTMLImageElement && photo.complete) {
      const rect = stage.getBoundingClientRect();
      if (rect.top <= 2 && rect.left <= 2 && rect.width >= view.width - 4 && rect.height >= view.height - 4) break;
    }
    await frame();
  }
  if (!coversViewport(layer, view)) paintFrame(layer, img, full, 0, view, false);
  await frame();
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
  if (generation === pinGeneration && document.documentElement.dataset.flip === "open") {
    pinTop();
    delete document.documentElement.dataset.locked;
  }
  resumeScroll(0);
}

async function shrinkToPill(id: string, image: HTMLImageElement, go: () => void) {
  pinGeneration += 1;
  busy = true;
  try {
    history.scrollRestoration = "manual";
  } catch {
    /* ignore */
  }
  pauseScroll();
  const onHome = /\/maquette-dieteticien\/?$/.test(window.location.pathname);
  if (!onHome) pinTop();
  const viewNow = measureViewport();
  const { layer, img } = makeStage(image);
  const full: Box = { top: 0, left: 0, width: viewNow.width, height: viewNow.height };
  paintFrame(layer, img, full, 0, viewNow, clipPathAnimates());
  if (!(await confirmCover(layer, viewNow))) {
    paintFrame(layer, img, full, 0, viewNow, false);
    await confirmCover(layer, viewNow);
  }
  document.documentElement.dataset.flip = "close";
  go();
  try {
    const pill = await placePill(id);
    if (!pill) return;
    const viewNext = measureViewport();
    await playZoom({
      layer,
      img,
      source: image,
      from: { top: 0, left: 0, width: viewNext.width, height: viewNext.height },
      to: pill.getBoundingClientRect(),
      fromRadius: 0,
      toRadius: cornerRadius(pill),
      view: viewNext,
    });
    restoreScroll();
  } finally {
    layer.remove();
    finish();
    restoreScroll();
    resumeScroll(scrollMemory?.top);
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
