import "@fontsource/outfit/400.css";
import "@fontsource/outfit/500.css";
import "@fontsource/outfit/600.css";
import "@fontsource/outfit/700.css";
import "@fontsource/outfit/800.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Toaster } from "sonner";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";
import { MobileNav } from "../components/mobile-nav";
import { MobileHeader } from "../components/mobile-header";
import { supabase } from "@/integrations/supabase/client";
import { CartDrawer } from "../components/cart-drawer";
import { FlyToCartProvider } from "../components/fly-to-cart-provider";
import { MiniCart } from "../components/mini-cart";
import { GlobalQuickView } from "../components/global-quick-view";
import { GlobalSearchModal } from "../components/global-search-modal";
import { AiShoppingModal } from "../components/ai-shopping-modal";
import { FloatingAiButton } from "../components/floating-ai-button";
import { CustomCursor } from "../components/custom-cursor";
import { OfflineOverlay } from "../components/offline-overlay";
import { useAddressStore } from "@/lib/address-store";
import { lazy, Suspense } from "react";

const AddressPickerModal = lazy(() => import("../components/address-picker-modal").then(m => ({ default: m.AddressPickerModal })));

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform active:scale-95"
          >
            Back to shop
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-input bg-background px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
          >
            Go home
          </a>
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
      { title: "Himanshu Store | Premium Grocery" },
      {
        name: "description",
        content: "Premium grocery delivery. Fresh produce, sustainable products, and luxury essentials delivered to your door.",
      },
      { property: "og:title", content: "Himanshu Store | Premium Grocery" },
      {
        property: "og:description",
        content: "Premium grocery delivery. Fresh produce, sustainable products, and luxury essentials delivered to your door.",
      },
      { property: "og:image", content: "/og-image.png" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Himanshu Store | Premium Grocery" },
      { name: "twitter:description", content: "Premium grocery delivery. Fresh produce, sustainable products, and luxury essentials delivered to your door." },
      { name: "twitter:image", content: "/og-image.png" },
      { name: "theme-color", content: "#22C55E" },
      { name: "apple-mobile-web-app-title", content: "Himanshu Store" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600&display=swap" },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "icon", href: "/favicon.ico", sizes: "32x32" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/manifest.json" },
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
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { isPickerOpen, setIsPickerOpen, loadAddresses } = useAddressStore();

  useEffect(() => {
    // Initialize global stores
    loadAddresses();
  }, [loadAddresses]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => sub.subscription.unsubscribe();
  }, [router, queryClient]);

  const isAuthPage = /^\/(login|signup|forgot-password|reset-password|otp)/.test(pathname);
  const isAdminRoute = pathname.startsWith('/admin');
  const isCheckoutRoute = pathname.startsWith('/checkout');
  const showCustomerUI = !isAuthPage && !isAdminRoute && !isCheckoutRoute;

  const showMobileNavHeader = !isAuthPage && !isAdminRoute && !isCheckoutRoute;

  return (
    <QueryClientProvider client={queryClient}>
      <FlyToCartProvider>
        <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background sm:max-w-none overflow-x-hidden">
        {showMobileNavHeader && (
          <>
            <div className="hidden sm:block">
              <SiteHeader />
            </div>
            <MobileHeader />
          </>
        )}
        <main className="flex-1 pb-20 sm:pb-0 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="h-full w-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
            {showCustomerUI && <GlobalQuickView />}
        </main>
        {showCustomerUI && (
          <>
            <MobileNav />
            <div className="hidden sm:block">
              <SiteFooter />
            </div>
            <CartDrawer />
            <MiniCart />
          </>
        )}
        <Toaster position="top-center" richColors />
        {showCustomerUI && (
          <>
            <GlobalSearchModal />
            <FloatingAiButton />
            <AiShoppingModal />
          </>
        )}
        <OfflineOverlay />
        {isMounted && (
          <Suspense fallback={null}>
            <AddressPickerModal isOpen={isPickerOpen} onClose={() => setIsPickerOpen(false)} />
          </Suspense>
        )}
        <CustomCursor />
      </div>
      </FlyToCartProvider>
    </QueryClientProvider>
  );
}
