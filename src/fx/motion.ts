import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

const EASE = "power3.out";
const EASE_IN_OUT = "power3.inOut";

type Bridge = {
  to: (target: number | Element, immediate?: boolean) => void;
};

let lenis: Lenis | null = null;
let lenisStopped = false;
let started = false;
let homeMounted = false;

function reduced() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function finePointer() {
  return window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 900px)").matches;
}

export function pauseScroll() {
  lenisStopped = true;
  lenis?.stop();
}

export function resumeScroll(y?: number) {
  if (!lenis) return;
  lenisStopped = false;
  lenis.start();
  if (typeof y === "number") lenis.scrollTo(y, { immediate: true });
}

export function scrollToTarget(target: number | Element, immediate = false) {
  if (lenis && !lenisStopped) {
    lenis.scrollTo(target, { immediate, offset: typeof target === "number" ? 0 : -72 });
    return;
  }
  if (typeof target === "number") window.scrollTo({ top: target, behavior: immediate ? "auto" : "smooth" });
  else target.scrollIntoView({ block: "start", behavior: immediate ? "auto" : "smooth" });
}

function splitLines(el: HTMLElement) {
  if (el.dataset.lines === "1" || el.children.length > 0) return [] as HTMLElement[];
  const words = (el.textContent || "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  el.textContent = "";
  const spans = words.map((word, index) => {
    const span = document.createElement("span");
    span.textContent = index === words.length - 1 ? word : `${word} `;
    span.style.display = "inline";
    el.appendChild(span);
    return span;
  });
  const groups: HTMLSpanElement[][] = [];
  let last = -1;
  spans.forEach((span) => {
    const top = span.offsetTop;
    if (groups.length === 0 || Math.abs(top - last) > 2) {
      groups.push([span]);
      last = top;
    } else groups[groups.length - 1].push(span);
  });
  const inners: HTMLElement[] = [];
  el.replaceChildren();
  groups.forEach((group) => {
    const mask = document.createElement("span");
    mask.className = "line-mask";
    const inner = document.createElement("span");
    inner.className = "line-inner";
    group.forEach((span) => inner.appendChild(span));
    mask.appendChild(inner);
    el.appendChild(mask);
    inners.push(inner);
  });
  el.dataset.lines = "1";
  return inners;
}

function revealLines(el: HTMLElement, duration: number, stagger: number) {
  const lines = splitLines(el);
  if (lines.length === 0) return;
  gsap.fromTo(
    lines,
    { yPercent: 110 },
    {
      yPercent: 0,
      duration,
      ease: EASE,
      stagger,
      scrollTrigger: {
        trigger: el,
        start: "top 88%",
        onLeave: (self) => self.animation?.progress(1),
      },
    },
  );
}

function revealImage(figure: HTMLElement) {
  const img = figure.querySelector("img");
  if (!img) return;
  gsap.fromTo(
    img,
    { scale: 1.2, yPercent: 8 },
    {
      scale: 1,
      yPercent: 0,
      duration: 1.6,
      ease: EASE,
      scrollTrigger: {
        trigger: figure,
        start: "top 86%",
        onLeave: (self) => self.animation?.progress(1),
      },
    },
  );
  if (!finePointer()) return;
  gsap.to(figure, {
    yPercent: -6,
    ease: "none",
    scrollTrigger: { trigger: figure, start: "top bottom", end: "bottom top", scrub: true },
  });
}

function driveTicker() {
  const rows = [...document.querySelectorAll<HTMLElement>(".ticker-track")];
  if (rows.length === 0) return;
  document.documentElement.classList.add("ticker-driven");
  let last = performance.now();
  let velocity = 1;
  let previous = window.scrollY;
  window.addEventListener(
    "scroll",
    () => {
      const delta = Math.abs(window.scrollY - previous);
      previous = window.scrollY;
      velocity = Math.min(3.2, Math.max(1, delta / 28));
    },
    { passive: true },
  );
  const offsets = rows.map(() => 0);
  const tick = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    velocity += (1 - velocity) * 0.08;
    rows.forEach((row, index) => {
      const half = row.scrollWidth / 2;
      if (half <= 0) return;
      const direction = index === 1 ? -1 : 1;
      const base = finePointer() ? 70 : 46;
      offsets[index] = (offsets[index] + direction * base * velocity * dt) % half;
      const x = offsets[index] > 0 ? offsets[index] - half : offsets[index];
      row.style.transform = `translate3d(${x}px,0,0)`;
    });
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function enhanceButtons(root: ParentNode) {
  root.querySelectorAll<HTMLElement>(".btn").forEach((btn) => {
    if (btn.dataset.rise === "1" || btn.querySelector("img")) return;
    const label = btn.textContent?.replace(/\s+/g, " ").trim();
    if (!label) return;
    btn.dataset.rise = "1";
    btn.textContent = "";
    const rise = document.createElement("span");
    rise.className = "btn-rise";
    const first = document.createElement("span");
    first.textContent = label;
    const second = document.createElement("span");
    second.textContent = label;
    second.setAttribute("aria-hidden", "true");
    rise.append(first, second);
    btn.append(rise);
  });
}

function playIntro() {
  try {
    if (sessionStorage.getItem("nb-intro") === "1") return;
    sessionStorage.setItem("nb-intro", "1");
  } catch {
    return;
  }
  const overlay = document.createElement("div");
  overlay.className = "home-intro";
  overlay.setAttribute("aria-hidden", "true");
  const mark = document.createElement("span");
  mark.className = "home-intro-mark";
  mark.textContent = "NB";
  overlay.append(mark);
  document.body.append(overlay);
  const tl = gsap.timeline({ onComplete: () => overlay.remove() });
  tl.fromTo(mark, { scale: 0, y: 40 }, { scale: 1, y: 0, duration: 1.2, ease: "power2.inOut" });
  tl.to(mark, { y: -80, scale: 0.6, duration: 1.1, ease: EASE_IN_OUT }, 1.6);
  tl.to(overlay, { autoAlpha: 0, duration: 0.8, ease: "power1.inOut" }, 2.2);
}

function headerMotion() {
  let last = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    const away = y > last + 6 && y > 140 && !document.body.classList.contains("nav-open") && !document.documentElement.dataset.flip;
    document.documentElement.classList.toggle("header-away", away);
    if (y < last - 4 || y < 80) document.documentElement.classList.remove("header-away");
    last = y;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
}

export function mountSiteMotion() {
  if (started) return;
  started = true;
  document.documentElement.classList.add("js");
  const bridge: Bridge = { to: scrollToTarget };
  (window as Window & { __nbScroll?: Bridge }).__nbScroll = bridge;
  if (reduced() || !finePointer()) return;
  lenis = new Lenis({
    autoRaf: true,
    lerp: 0.1,
    smoothWheel: true,
    syncTouch: false,
    allowNestedScroll: true,
  });
  lenis.on("scroll", ScrollTrigger.update);
}

export function mountHomeMotion() {
  const root = document.querySelector(".home");
  if (!root || homeMounted) return;
  homeMounted = true;
  enhanceButtons(document);
  if (reduced()) {
    gsap.fromTo(
      root.querySelectorAll("section"),
      { autoAlpha: 0.55 },
      { autoAlpha: 1, duration: 0.45, stagger: 0.04, ease: "power1.out", overwrite: true },
    );
    return;
  }
  try {
    sessionStorage.getItem("nb-intro");
  } catch {
    /* private mode */
  }
  playIntro();
  headerMotion();
  root.querySelectorAll<HTMLElement>("h1, h2:not(.sr-only), .home-statement p").forEach((el) => revealLines(el, el.tagName === "H1" ? 1.4 : 1.2, 0.05));
  root.querySelectorAll<HTMLElement>(".home-hero-photo, .home-call-photo, .portrait").forEach(revealImage);
  gsap.utils.toArray<HTMLElement>(".home-offer, .home-marker-grid li, .faq-item, .home-split-row").forEach((el) => {
    gsap.fromTo(
      el,
      { y: 40, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.8,
        ease: EASE,
        scrollTrigger: {
          trigger: el,
          start: "top 92%",
          onLeave: (self) => self.animation?.progress(1),
        },
      },
    );
  });
  driveTicker();
}
