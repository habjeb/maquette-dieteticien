import { useId, useLayoutEffect, useState } from "react";
import { resyncReveals } from "../fx/motion";
import { sitePath } from "../lib/paths";
import { A } from "../router";

export function FaqList({
  items,
}: {
  items: readonly {
    id: string;
    q: string;
    a: string;
    links?: readonly { href: string; label: string }[];
  }[];
}) {
  const [open, setOpen] = useState<string | null>(null);
  const baseId = useId();
  useLayoutEffect(() => {
    resyncReveals();
  });
  return (
    <div className="faq-list">
      {items.map((item) => {
        const expanded = open === item.id;
        const panelId = `${baseId}-${item.id}`;
        const buttonId = `${panelId}-button`;
        return (
          <article className={`faq-item${expanded ? " is-open" : ""}`} key={item.id}>
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => setOpen(expanded ? null : item.id)}
              >
                <span className="faq-q" data-reveal="title">
                  {item.q}
                </span>
                <span className="faq-symbol" aria-hidden="true">
                  {expanded ? "–" : "+"}
                </span>
              </button>
            </h3>
            <div className="faq-panel" id={panelId} role="region" aria-labelledby={buttonId} inert={expanded ? undefined : true}>
              <div className="faq-panel-inner">
                <p>
                  {item.a}
                  {item.links?.length ? (
                    <>
                      {" "}
                      {item.links.map((link, index) => (
                        <span key={link.href}>
                          {index > 0 ? " · " : ""}
                          <A href={sitePath(link.href)}>{link.label}</A>
                        </span>
                      ))}
                    </>
                  ) : null}
                </p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
