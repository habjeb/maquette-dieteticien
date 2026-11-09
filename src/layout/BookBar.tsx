import { useEffect, useState } from "react";
import { site } from "../lib/site";
import { useRoute } from "../router";
import { BookLink } from "../components/ui";

export function BookBar() {
  const { path } = useRoute();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 899px)");
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-booking-visible]"));
    if (!("IntersectionObserver" in window)) return undefined;
    const visible = new Set<Element>();
    const sync = () => setHidden(!mobile.matches || visible.size > 0);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        });
        sync();
      },
      { threshold: 0.25 },
    );
    nodes.forEach((node) => observer.observe(node));
    mobile.addEventListener("change", sync);
    return () => {
      observer.disconnect();
      mobile.removeEventListener("change", sync);
    };
  }, [path]);

  return (
    <div className={`book-bar${hidden ? " is-hidden" : ""}`}>
      <BookLink href={site.booking.general} label="Prendre rendez-vous" className="btn btn-primary btn-block">
        Prendre rendez-vous
      </BookLink>
      <p className="privacy-note">{site.privacyNote}</p>
    </div>
  );
}
