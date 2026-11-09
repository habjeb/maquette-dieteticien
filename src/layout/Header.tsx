import { useEffect, useId, useRef, useState } from "react";
import { useActiveSection } from "../hooks/useActiveSection";
import { NAV, SECTION_IDS, type NavItem } from "../lib/nav";
import { normalizePath, sitePath } from "../lib/paths";
import { site } from "../lib/site";
import { A, useRoute } from "../router";
import { BookLink } from "../components/ui";

export function Header() {
  const { path } = useRoute();
  const [open, setOpen] = useState(false);
  const [stuck, setStuck] = useState(false);
  const active = useActiveSection(SECTION_IDS, path === "/");
  const closeRef = useRef<HTMLButtonElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    document.body.classList.toggle("nav-open", open);
    return () => document.body.classList.remove("nav-open");
  }, [open]);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setStuck(window.scrollY > 8);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1080px)");
    const onChange = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener("change", onChange);
    return () => desktop.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const sheet = document.getElementById("menu-sheet");
    const focusable = sheet ? Array.from(sheet.querySelectorAll<HTMLElement>("a, button")) : [];
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (event.key !== "Tab" || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className={`site-header${stuck ? " is-scrolled" : ""}`}>
      <div className="header-bar">
        <A className="brand" href={sitePath("/")}>
          <span className="brand-mark" aria-hidden="true">
            NB
          </span>
          <span className="brand-text">
            <span className="brand-name">{site.fullName}</span>
            <span className="brand-role">{site.jobTitle}</span>
          </span>
        </A>
        <nav className="nav-desktop" aria-label="Sections">
          {NAV.map((item) =>
            item.children ? (
              <DomainMenu key={item.id} item={item} path={path} sectionCurrent={active === item.id} />
            ) : (
              <A key={item.id} href={item.href} aria-current={active === item.id ? "true" : undefined}>
                {item.label}
              </A>
            ),
          )}
        </nav>
        <div className="header-tools">
          <BookLink href={site.booking.general} label="Prendre rendez-vous" className="btn btn-primary nav-cta">
            Prendre rendez-vous
          </BookLink>
          <button
            ref={toggleRef}
            type="button"
            className="menu-btn"
            aria-expanded={open}
            aria-controls="menu-sheet"
            onClick={() => setOpen(true)}
          >
            <span className="sr-only">Ouvrir le menu</span>
            <MenuIcon />
          </button>
        </div>
      </div>

      <div
        className={`menu-sheet${open ? " is-open" : ""}`}
        id="menu-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-hidden={open ? undefined : true}
        inert={open ? undefined : true}
      >
        <div className="menu-sheet-top">
          <A className="brand" href={sitePath("/")} onClick={close}>
            <span className="brand-mark" aria-hidden="true">
              NB
            </span>
            <span className="brand-name" id={titleId}>
              {site.fullName}
            </span>
          </A>
          <button
            ref={closeRef}
            type="button"
            className="menu-btn"
            onClick={() => {
              setOpen(false);
              toggleRef.current?.focus();
            }}
          >
            <span className="sr-only">Fermer le menu</span>
            <CloseIcon />
          </button>
        </div>
        <nav className="menu-links" aria-label="Menu">
          {NAV.map((item) => (
            <div key={item.id}>
              <A
                href={item.href}
                aria-current={active === item.id || childCurrent(item, path) ? "true" : undefined}
                onClick={close}
              >
                {item.label}
              </A>
              {item.children ? (
                <div className="menu-sub">
                  {item.children.map((child) => (
                    <A
                      key={child.id}
                      href={child.href}
                      aria-current={routeOf(child.href) === path ? "page" : undefined}
                      onClick={close}
                    >
                      {child.label}
                    </A>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </nav>
        <div className="menu-foot">
          <BookLink href={site.booking.general} label="Prendre rendez-vous" className="btn btn-primary btn-block">
            Prendre rendez-vous
          </BookLink>
        </div>
      </div>
    </header>
  );
}

function routeOf(href: string) {
  return normalizePath(href.split("#")[0] || "/");
}

function childCurrent(item: NavItem, path: string) {
  return item.children?.some((child) => routeOf(child.href) === path) ?? false;
}

function DomainMenu({
  item,
  path,
  sectionCurrent,
}: {
  item: NavItem;
  path: string;
  sectionCurrent: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const onPage = childCurrent(item, path);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      rootRef.current?.querySelector("a")?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div
      className={`nav-drop${open ? " is-open" : ""}`}
      ref={rootRef}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => {
        if (!rootRef.current?.contains(document.activeElement)) setOpen(false);
      }}
      onFocus={(event) => {
        const target = event.target as Node | null;
        if (target === buttonRef.current) setOpen(true);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <A href={item.href} aria-current={sectionCurrent || onPage ? "true" : undefined} onClick={() => setOpen(false)}>
        {item.label}
      </A>
      <button
        ref={buttonRef}
        type="button"
        className="nav-more"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label="Domaines d’accompagnement"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => setOpen(true)}
      >
        <Chevron open={open} />
      </button>
      <div className="nav-sub" id={menuId} role="group" aria-label="Domaines d’accompagnement" hidden={open ? undefined : true}>
        {item.children?.map((child) => (
          <A
            key={child.id}
            href={child.href}
            aria-current={routeOf(child.href) === path ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            {child.label}
          </A>
        ))}
      </div>
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" className={open ? "is-open" : undefined}>
      <path d="M3 5.2l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
      <path d="M3 6.5h16M3 11h16M3 15.5h16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
      <path d="M5 5l12 12M17 5L5 17" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
