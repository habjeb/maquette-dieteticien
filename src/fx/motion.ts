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

type RevealMode = "title" | "lines";

type RevealItem = {
  el: HTMLElement;
  mode: RevealMode;
  intro: boolean;
  revealed: boolean;
  tween?: gsap.core.Tween;
  trigger?: ScrollTrigger;
};

const revealItems: RevealItem[] = [];
let introWait = 0;
let resizeTimer = 0;
let revealsReady = false;

function sourceText(el: HTMLElement) {
  const stored = el.dataset.revealText;
  if (stored) return stored;
  const text = (el.textContent || "").replace(/\s+/g, " ").trim();
  el.dataset.revealText = text;
  return text;
}

function splitReveal(el: HTMLElement, mode: RevealMode) {
  const text = sourceText(el);
  const words = text.split(" ").filter(Boolean);
  const sr = document.createElement("span");
  sr.className = "sr-only";
  sr.textContent = text;
  if (words.length === 0) {
    el.replaceChildren(sr);
    return [] as HTMLElement[];
  }

  const measure = document.createElement("span");
  measure.className = "reveal-measure";
  const wordMasks = words.map((word) => {
    const wordMask = document.createElement("span");
    wordMask.className = "word-mask";
    const inner = document.createElement("span");
    inner.className = "line-inner";
    inner.textContent = word;
    wordMask.appendChild(inner);
    return wordMask;
  });
  wordMasks.forEach((wordMask, index) => {
    measure.appendChild(wordMask);
    if (index < wordMasks.length - 1) {
      const gap = document.createElement("span");
      gap.className = "word-gap";
      gap.textContent = " ";
      measure.appendChild(gap);
    }
  });
  el.replaceChildren(measure);

  const groups: HTMLElement[][] = [];
  let last = -1;
  wordMasks.forEach((wordMask) => {
    const top = wordMask.offsetTop;
    if (groups.length === 0 || top - last > 3) {
      groups.push([wordMask]);
      last = top;
    } else groups[groups.length - 1].push(wordMask);
  });

  const visual = document.createElement("span");
  visual.className = "reveal-visual";
  visual.setAttribute("aria-hidden", "true");
  const inners: HTMLElement[] = [];
  groups.forEach((group) => {
    const mask = document.createElement("span");
    mask.className = "line-mask";
    if (mode === "lines") {
      const inner = document.createElement("span");
      inner.className = "line-inner";
      inner.textContent = group.map((wordMask) => wordMask.textContent || "").join(" ");
      mask.appendChild(inner);
      inners.push(inner);
    } else {
      group.forEach((wordMask, index) => {
        mask.appendChild(wordMask);
        const inner = wordMask.querySelector<HTMLElement>(".line-inner");
        if (inner) inners.push(inner);
        if (index < group.length - 1) {
          const gap = document.createElement("span");
          gap.className = "word-gap";
          gap.textContent = " ";
          mask.appendChild(gap);
        }
      });
    }
    visual.appendChild(mask);
  });
  el.replaceChildren(sr, visual);
  return inners;
}

function mountReveal(item: RevealItem, first: boolean) {
  item.trigger?.kill();
  item.tween?.kill();
  item.trigger = undefined;
  item.tween = undefined;
  const inners = splitReveal(item.el, item.mode);
  if (inners.length === 0) return;
  if (reduced()) {
    gsap.set(inners, { yPercent: 0 });
    if (item.revealed) {
      gsap.set(item.el, { opacity: 1 });
      return;
    }
    item.tween = gsap.fromTo(
      item.el,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.55,
        ease: "power1.out",
        scrollTrigger: {
          trigger: item.el,
          start: "top 90%",
          onLeave: (self) => self.animation?.progress(1),
        },
        onComplete: () => {
          item.revealed = true;
        },
      },
    );
    item.trigger = item.tween.scrollTrigger || undefined;
    return;
  }
  if (item.revealed) {
    gsap.set(inners, { yPercent: 0 });
    return;
  }
  item.tween = gsap.fromTo(
    inners,
    { yPercent: 115 },
    {
      yPercent: 0,
      duration: item.mode === "title" ? 1.4 : 1.2,
      ease: EASE,
      stagger: 0.05,
      delay: item.intro && first ? introWait : 0,
      scrollTrigger: {
        trigger: item.el,
        start: "top 84%",
        onLeave: (self) => {
          self.animation?.progress(1);
          item.revealed = true;
        },
      },
      onComplete: () => {
        item.revealed = true;
      },
    },
  );
  item.trigger = item.tween.scrollTrigger || undefined;
}

function bootReveals(root: ParentNode) {
  if (revealsReady) return;
  revealsReady = true;
  root.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
    revealItems.push({
      el,
      mode: el.dataset.reveal === "title" ? "title" : "lines",
      intro: el.dataset.revealAfter === "intro",
      revealed: false,
    });
  });
  const run = (first: boolean) => revealItems.forEach((item) => mountReveal(item, first));
  const onResize = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      run(false);
      ScrollTrigger.refresh();
    }, 180);
  };
  const start = () => {
    run(true);
    ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);
  };
  if (document.fonts?.ready) void document.fonts.ready.then(start);
  else start();
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
    if (sessionStorage.getItem("nb-intro") === "1") return 0;
    sessionStorage.setItem("nb-intro", "1");
  } catch {
    return 0;
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
  return 2.45;
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

export function resyncReveals() {
  if (!revealsReady) return;
  revealItems.forEach((item) => {
    if (!item.el.isConnected) return;
    if (item.el.querySelector(".reveal-visual")) return;
    mountReveal(item, false);
  });
}

export function mountHomeMotion() {
  const root = document.querySelector(".home");
  if (!root || homeMounted) return;
  homeMounted = true;
  enhanceButtons(document);
  introWait = reduced() ? 0 : playIntro();
  if (!reduced()) headerMotion();
  bootReveals(root);
  if (reduced()) return;
  root.querySelectorAll<HTMLElement>(".home-hero-photo, .home-call-photo, .portrait").forEach(revealImage);
  gsap.utils.toArray<HTMLElement>(".home-offer, .home-marker-grid li, .home-split-row").forEach((el) => {
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
}
