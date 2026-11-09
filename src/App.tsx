import { BookBar } from "./layout/BookBar";
import { Footer } from "./layout/Footer";
import { Header } from "./layout/Header";
import { CartePage, LegalPage, NotFoundPage } from "./pages/Subpages";
import { Seo, usePage } from "./components/ui";
import { HomePage } from "./sections/Home";
import { RouteProvider } from "./router";

export default function App() {
  return (
    <RouteProvider>
      <Frame />
    </RouteProvider>
  );
}

function Frame() {
  const page = usePage();
  return (
    <>
      <Seo page={page} />
      <a className="skip-link" href="#contenu">
        Aller au contenu
      </a>
      <Header />
      <main id="contenu" tabIndex={-1}>
        {page.id === "home" ? <HomePage /> : null}
        {page.id === "mentions" || page.id === "privacy" || page.id === "cgv" || page.id === "mediation" ? (
          <LegalPage id={page.id} />
        ) : null}
        {page.id === "carte" ? <CartePage /> : null}
        {page.id === "not-found" ? <NotFoundPage /> : null}
      </main>
      <Footer />
      <BookBar />
    </>
  );
}
