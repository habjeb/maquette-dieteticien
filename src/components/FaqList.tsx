import { useId, useState } from "react";

export function FaqList({ items }: { items: readonly { id: string; q: string; a: string }[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const baseId = useId();
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
                <span>{item.q}</span>
                <span className="faq-symbol" aria-hidden="true">
                  {expanded ? "–" : "+"}
                </span>
              </button>
            </h3>
            <div className="faq-panel" id={panelId} role="region" aria-labelledby={buttonId} inert={expanded ? undefined : true}>
              <div className="faq-panel-inner">
                <p>{item.a}</p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
