export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-background px-4 py-12 sm:px-6">
      <div className="mx-auto grid max-w-7xl gap-12 sm:grid-cols-3">
        <div className="space-y-4">
          <span className="text-xl font-bold tracking-tight text-primary">
            Zest<span className="text-foreground">.</span>
          </span>
          <p className="max-w-[32ch] text-sm leading-relaxed text-muted-foreground">
            The modern way to stock your kitchen. Sustainable, local produce
            delivered in under 15 minutes.
          </p>
        </div>
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Platform
          </h4>
          <nav className="flex flex-col gap-2 text-sm font-medium">
            <a className="hover:text-primary" href="#">Our Farmers</a>
            <a className="hover:text-primary" href="#">Delivery Zones</a>
            <a className="hover:text-primary" href="#">Partner with Us</a>
            <a className="hover:text-primary" href="#">Help Center</a>
          </nav>
        </div>
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Newsletter
          </h4>
          <p className="text-sm text-muted-foreground">
            Seasonal recipes and deals in your inbox.
          </p>
          <form
            className="flex gap-2"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="your@email.com"
              className="h-10 flex-1 rounded-full bg-secondary px-4 text-sm outline-none ring-1 ring-black/5 focus:ring-2 focus:ring-primary/40"
            />
            <button
              type="submit"
              className="h-10 rounded-full bg-foreground px-4 text-sm font-semibold text-background transition-transform active:scale-95"
            >
              Join
            </button>
          </form>
        </div>
      </div>
      <div className="mx-auto mt-12 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Zest Delivery. All rights reserved.
        </p>
        <div className="flex gap-6">
          <a href="#" className="text-xs text-muted-foreground hover:text-foreground">Privacy</a>
          <a href="#" className="text-xs text-muted-foreground hover:text-foreground">Terms</a>
        </div>
      </div>
    </footer>
  );
}
