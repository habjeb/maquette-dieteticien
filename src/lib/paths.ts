/** Lien interne, préfixé par la base Vite (`/maquette-dieteticien/`). */
export function sitePath(route: string) {
  const base = import.meta.env.BASE_URL;
  if (route === "/" || route === "") return base;
  const clean = route.replace(/^\//, "").replace(/\/$/, "");
  return `${base}${clean}/`;
}

export function publicAsset(path: string) {
  const normalized = path.replace(/^\//, "");
  return `${import.meta.env.BASE_URL}${normalized}`;
}

export function normalizePath(pathname: string) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  let path = pathname;
  if (base && path.startsWith(base)) path = path.slice(base.length) || "/";
  if (!path.startsWith("/")) path = `/${path}`;
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  return path || "/";
}

export function readPath() {
  return normalizePath(window.location.pathname);
}
