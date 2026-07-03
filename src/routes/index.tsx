import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Leaf, RotateCcw, Zap } from "lucide-react";
import heroBasket from "@/assets/hero-basket.jpg";
import { CATEGORIES, PRODUCTS } from "@/lib/products";
import { ProductCard } from "@/components/product-card";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const deals = PRODUCTS.filter((p) => p.compareAt).slice(0, 4);
  const fresh = PRODUCTS.slice(0, 6);

  return (
    <div>
      {/* Hero */}
      <section className="px-4 pt-8 pb-4 sm:px-6 lg:pt-16">
        <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <span className="inline-block rounded-full bg-primary-soft px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              Freshness First
            </span>
            <h1 className="text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Freshly harvested,
              <br className="hidden sm:block" /> delivered in{" "}
              <span className="text-primary">15 minutes</span>
            </h1>
            <p className="max-w-[52ch] text-pretty text-lg text-muted-foreground">
              Skip the checkout line. We source the best local organic produce
              and artisan goods, brought straight to your doorstep.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-pop transition-transform active:scale-95"
              >
                Start shopping
                <ArrowRight className="size-4" />
              </Link>
              <a
                href="#deals"
                className="rounded-full bg-secondary px-6 py-3.5 text-sm font-semibold ring-1 ring-black/5 hover:bg-muted"
              >
                Today's deals
              </a>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <div className="flex -space-x-2">
                <div className="size-8 rounded-full bg-orange-200 ring-2 ring-background" />
                <div className="size-8 rounded-full bg-emerald-200 ring-2 ring-background" />
                <div className="size-8 rounded-full bg-rose-200 ring-2 ring-background" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                +12,400 happy locals this week
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square w-full overflow-hidden rounded-[32px] bg-primary-soft ring-1 ring-black/5">
              <img
                src={heroBasket}
                alt="Basket overflowing with fresh oranges, kale, and avocados"
                width={1024}
                height={1024}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-5 -left-5 rounded-2xl bg-card p-4 shadow-soft ring-1 ring-black/5">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-full bg-accent text-accent-foreground">
                  <Zap className="size-4" fill="currentColor" />
                </div>
                <div>
                  <p className="text-sm font-semibold leading-tight">12 min avg</p>
                  <p className="text-xs text-muted-foreground">door to door</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Shop categories</h2>
          <Link to="/products" className="text-sm font-semibold text-primary">
            See all
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6 sm:gap-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.name}
              to="/products"
              className="group text-center"
            >
              <div
                className={`${c.tint} mb-3 grid aspect-square place-items-center rounded-3xl ring-1 ring-black/5 transition-transform group-hover:scale-[1.03]`}
              >
                <span className="text-4xl sm:text-5xl">{c.emoji}</span>
              </div>
              <span className="text-sm font-semibold">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Flash Sale */}
      <section id="deals" className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="rounded-[32px] bg-foreground p-8 text-background sm:p-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-primary" />
                </span>
                Flash sale
              </div>
              <h2 className="text-3xl font-bold tracking-tight">
                Golden hour specials
              </h2>
              <p className="max-w-[44ch] text-sm text-background/70">
                Up to 40% off select produce and pantry. Ends when the sun sets
                in Brooklyn.
              </p>
            </div>
            <div className="flex items-end gap-3">
              <CountdownCell label="Hours" value="00" />
              <span className="pb-6 text-2xl font-bold text-background/40">:</span>
              <CountdownCell label="Mins" value="42" />
              <span className="pb-6 text-2xl font-bold text-background/40">:</span>
              <CountdownCell label="Secs" value="15" />
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {deals.map((p) => (
              <Link
                key={p.id}
                to="/products/$id"
                params={{ id: p.id }}
                className="group relative overflow-hidden rounded-2xl bg-background/10 p-4 backdrop-blur-md ring-1 ring-white/10 transition-colors hover:bg-background/15"
              >
                <div className="mb-3 aspect-square overflow-hidden rounded-xl bg-background">
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <p className="truncate text-sm font-semibold">{p.name}</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-base font-bold">${p.price.toFixed(2)}</span>
                  {p.compareAt && (
                    <span className="text-xs text-background/50 line-through">
                      ${p.compareAt.toFixed(2)}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Fresh Harvest */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Fresh harvest</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Picked at dawn, on your counter by noon.
            </p>
          </div>
          <Link to="/products" className="text-sm font-semibold text-primary">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {fresh.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Trust strip */}
      <section className="bg-secondary/60 px-4 py-14 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-3">
          <TrustItem
            icon={<Zap className="size-5" />}
            title="Hyper-local delivery"
            body="Averaging 12 minutes from store to your front door."
          />
          <TrustItem
            icon={<Leaf className="size-5" />}
            title="Organic guarantee"
            body="Only the highest quality seasonal picks from local farms."
          />
          <TrustItem
            icon={<RotateCcw className="size-5" />}
            title="No-hassle returns"
            body="Not happy with a pick? We'll credit your wallet instantly."
          />
        </div>
      </section>
    </div>
  );
}

function CountdownCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-background/10 text-2xl font-bold ring-1 ring-white/10">
        {value}
      </div>
      <div className="mt-1 text-[10px] uppercase tracking-wider text-background/60">
        {label}
      </div>
    </div>
  );
}

function TrustItem({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="grid size-11 shrink-0 place-items-center rounded-full bg-card text-primary ring-1 ring-black/5">
        {icon}
      </div>
      <div className="min-w-0">
        <h4 className="font-semibold">{title}</h4>
        <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}
