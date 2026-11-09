import { useEffect, useState } from "react";

export function useActiveSection(ids: readonly string[], enabled: boolean) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return undefined;
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);
    if (!sections.length || !("IntersectionObserver" in window)) return undefined;

    const spy = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-40% 0px -45% 0px", threshold: [0, 0.2, 0.5] },
    );
    sections.forEach((section) => spy.observe(section));
    return () => spy.disconnect();
  }, [ids, enabled]);

  return enabled ? active : null;
}
