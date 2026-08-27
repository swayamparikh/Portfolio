import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportError } from "../lib/error-reporting";
import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-7xl text-mocha">404</h1>
        <p className="mt-4 text-mocha/70">This page got lost in the steam.</p>
        <Link to="/" className="mt-6 inline-block rounded-sm bg-mocha px-6 py-3 text-sm text-cream hover:bg-roast transition-colors">
          Back home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => { reportError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-3xl text-mocha">Something went wrong</h1>
        <div className="mt-6 flex justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="rounded-sm bg-mocha px-5 py-2 text-sm text-cream">Try again</button>
          <a href="/" className="rounded-sm border border-mocha/20 px-5 py-2 text-sm">Go home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Ethos Roast — Artisan Coffee & Franchise" },
      { name: "description", content: "Small-batch artisan coffee, brewed to perfection. Premium franchise opportunities across India." },
      { property: "og:title", content: "Ethos Roast — Artisan Coffee & Franchise" },
      { property: "og:description", content: "Small-batch artisan coffee, brewed to perfection. Premium franchise opportunities across India." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Ethos Roast — Artisan Coffee & Franchise" },
      { name: "twitter:description", content: "Small-batch artisan coffee, brewed to perfection. Premium franchise opportunities across India." },
      { property: "og:image", content: "https://ethos-roast.vercel.app/og-image.jpg" },
      { name: "twitter:image", content: "https://ethos-roast.vercel.app/og-image.jpg" },
      { name: "theme-color", content: "#3c2f2c" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,500&family=Instrument+Sans:wght@400;500;600&display=swap" },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
      { rel: "icon", href: "/favicon.ico" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-cream text-mocha relative">
        <div className="fixed inset-0 texture-overlay z-[100]" aria-hidden />
        <SiteHeader />
        <main><Outlet /></main>
        <SiteFooter />
      </div>
    </QueryClientProvider>
  );
}
