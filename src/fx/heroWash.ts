import { clock, effect, frame, frameLoop, init, surface } from "vgpu";
import type { FrameLoopHandle } from "vgpu";
import heroWashShader from "./heroWash.wgsl";

const IVORY: readonly [number, number, number, number] = [1, 0.99215686, 0.96078431, 1];

export type HeroWashHooks = {
  onReady: () => void;
  onFallback: () => void;
};

/** Démarre le fond du hero. La fonction renvoyée libère le device et le canvas. */
export function startHeroWash(canvas: HTMLCanvasElement, section: HTMLElement, hooks: HeroWashHooks): () => void {
  let disposed = false;
  let revealed = false;
  let loop: FrameLoopHandle | undefined;
  let gpu: Awaited<ReturnType<typeof init>> | undefined;
  let canvasSurface: ReturnType<typeof surface> | undefined;
  let wash: ReturnType<typeof effect> | undefined;
  let unsubscribeResize: (() => void) | undefined;
  let unsubscribeError: (() => void) | undefined;
  let observer: IntersectionObserver | undefined;
  let time = 0;
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reduced = motion.matches;
  let onScreen = true;
  let pageVisible = document.visibilityState !== "hidden";

  const reveal = () => {
    if (disposed || revealed) return;
    revealed = true;
    hooks.onReady();
  };

  const teardown = () => {
    if (disposed) return;
    disposed = true;
    observer?.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    motion.removeEventListener("change", onMotion);
    loop?.stop();
    loop = undefined;
    unsubscribeResize?.();
    unsubscribeResize = undefined;
    unsubscribeError?.();
    unsubscribeError = undefined;
    canvasSurface?.dispose();
    canvasSurface = undefined;
    gpu?.dispose();
    gpu = undefined;
  };

  const fallback = () => {
    if (disposed) return;
    teardown();
    hooks.onFallback();
  };

  const canAnimate = () => !disposed && !reduced && onScreen && pageVisible && gpu && wash && canvasSurface;

  const stopLoop = () => {
    loop?.stop();
    loop = undefined;
  };

  const startLoop = () => {
    if (!canAnimate() || loop || !gpu || !wash || !canvasSurface) return;
    const currentGpu = gpu;
    const currentWash = wash;
    const currentSurface = canvasSurface;
    const gpuClock = clock(currentGpu);
    loop = frameLoop(currentGpu, (currentFrame) => {
      time = gpuClock.time;
      currentWash.set({ params: { time } });
      currentFrame.pass(currentSurface, currentWash);
      reveal();
    }, { fps: 30 });
  };

  const paintStill = () => {
    if (disposed || !gpu || !wash || !canvasSurface) return;
    const currentGpu = gpu;
    const currentWash = wash;
    const currentSurface = canvasSurface;
    frame(currentGpu, (currentFrame) => {
      currentWash.set({ params: { time } });
      currentFrame.pass(currentSurface, currentWash);
    });
    reveal();
  };

  const sync = () => {
    if (disposed) return;
    if (canAnimate()) startLoop();
    else stopLoop();
  };

  function onVisibility() {
    pageVisible = document.visibilityState !== "hidden";
    sync();
  }

  function onMotion() {
    reduced = motion.matches;
    if (reduced) paintStill();
    sync();
  }

  void (async () => {
    try {
      const next = await init({ powerPreference: "low-power" });
      if (disposed) {
        next.dispose();
        return;
      }
      gpu = next;
      unsubscribeError = gpu.onError((error) => {
        if (error.severity === "error") fallback();
      });
      void gpu.lost.then(() => {
        fallback();
      });

      const mobile = window.matchMedia("(max-width: 899px)").matches;
      canvasSurface = surface(gpu, canvas, {
        dpr: mobile ? [1, 1.5] : [1, 2],
        clearColor: IVORY,
        alphaMode: "opaque",
      });
      const currentSurface = canvasSurface;
      wash = effect(gpu, heroWashShader, {
        label: "hero-wash",
        set: {
          params: {
            time: 0,
            width: currentSurface.size[0],
            height: currentSurface.size[1],
          },
        },
      });
      const currentWash = wash;
      unsubscribeResize = currentSurface.onResize(({ width, height }) => {
        currentWash.set({ params: { width, height } });
      });
      await currentWash.compile(currentSurface);
      if (disposed) return;

      const rect = section.getBoundingClientRect();
      onScreen = rect.bottom > 0 && rect.top < window.innerHeight;
      observer = new IntersectionObserver(([entry]) => {
        onScreen = Boolean(entry?.isIntersecting);
        sync();
      });
      observer.observe(section);
      document.addEventListener("visibilitychange", onVisibility);
      motion.addEventListener("change", onMotion);

      if (reduced || !onScreen || !pageVisible) paintStill();
      else startLoop();
    } catch {
      fallback();
    }
  })();

  return teardown;
}
