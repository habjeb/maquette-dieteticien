import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type AnchorHTMLAttributes,
  type ReactNode,
} from "react";
import { normalizePath } from "./lib/paths";

type RouteValue = {
  path: string;
  navigate: (href: string) => void;
};

const RouteContext = createContext<RouteValue | null>(null);

function locationKey() {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

export function RouteProvider({ children }: { children: ReactNode }) {
  const [key, setKey] = useState(locationKey);
  const path = normalizePath(key.split("#")[0] || "/");

  useEffect(() => {
    const sync = () => setKey(locationKey());
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const behavior: ScrollBehavior = reduce ? "auto" : "smooth";
    if (hash) {
      document.getElementById(hash)?.scrollIntoView({ behavior, block: "start" });
      return;
    }
    window.scrollTo({ top: 0, behavior });
    document.getElementById("contenu")?.focus({ preventScroll: true });
  }, [key]);

  const navigate = useCallback((href: string) => {
    const url = new URL(href, window.location.origin);
    window.history.pushState({}, "", `${url.pathname}${url.search}${url.hash}`);
    setKey(locationKey());
  }, []);

  const value = useMemo(() => ({ path, navigate }), [path, navigate]);
  return <RouteContext.Provider value={value}>{children}</RouteContext.Provider>;
}

export function useRoute() {
  const value = useContext(RouteContext);
  if (!value) throw new Error("useRoute doit être utilisé dans RouteProvider.");
  return value;
}

type AnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export function A({ href, onClick, children, ...rest }: AnchorProps) {
  const { navigate } = useRoute();
  const external = /^https?:/i.test(href);
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <a
      href={href}
      {...rest}
      onClick={(event) => {
        onClick?.(event);
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }
        event.preventDefault();
        navigate(href);
      }}
    >
      {children}
    </a>
  );
}
