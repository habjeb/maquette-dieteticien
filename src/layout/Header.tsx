import { useEffect, useId, useRef, useState } from "react";
import { useActiveSection } from "../hooks/useActiveSection";
import { NAV, SECTION_IDS } from "../lib/nav";
import { sitePath } from "../lib/paths";
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
          {NAV.map((item) => (
            <A key={item.id} href={item.href} aria-current={active === item.id ? "true" : undefined}>
              {item.label}
            </A>
          ))}
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
            <A key={item.id} href={item.href} aria-current={active === item.id ? "true" : undefined} onClick={close}>
              {item.label}
            </A>
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
