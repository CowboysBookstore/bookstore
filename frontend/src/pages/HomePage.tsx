import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import StorefrontLayout from "../components/StorefrontLayout";
import { useStorefront } from "../storefront/StorefrontContext";

function StatCard({
  value,
  label,
  detail,
}: {
  value: string;
  label: string;
  detail: string;
}) {
  return (
    <div className="rounded-[28px] border border-white/20 bg-white/10 p-5 text-white shadow-lg shadow-blue-950/20 backdrop-blur">
      <p className="text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-sm font-medium uppercase tracking-[0.16em] text-blue-100">
        {label}
      </p>
      <p className="mt-3 text-sm text-blue-100/90">{detail}</p>
    </div>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-mcneeseBlue">
        Feature
      </p>
      <h3 className="mt-3 text-xl font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

export default function HomePage() {
  const { products, cartCount, wishlistCount, orders } = useStorefront();
  const featuredProducts = products.slice(0, 4);

  return (
    <StorefrontLayout>
      <section className="animate-rise overflow-hidden rounded-[36px] bg-slate-950 text-white shadow-2xl shadow-slate-300/60">
        <div className="grid gap-10 px-8 py-10 lg:grid-cols-[1.2fr_0.8fr] lg:px-12 lg:py-14">
          <div>
            <p className="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-blue-100">
              Cowboy Online Bookstore
            </p>
            <h1 className="mt-6 max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">
              Course materials, ready to order.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              This site is built around the project brief: a secure,
              user-friendly online bookstore where students can browse textbooks
              and office supplies, manage wishlists, and move into checkout with
              pickup or delivery options.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/products"
                className="rounded-full bg-mcneeseGold px-6 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110"
              >
                Explore catalog
              </Link>
              <Link
                to="/checkout"
                className="rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                View checkout page
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <StatCard
                value="Semester-ready"
                label="Catalog"
                detail="Textbooks, supplies, tech, and gear refreshed for a full school-store lineup."
              />
              <StatCard
                value={`${wishlistCount}`}
                label="Wishlist items"
                detail="Students can save products first, then move them into the cart later."
              />
              <StatCard
                value={`${cartCount}`}
                label="Cart quantity"
                detail="The header stays in sync as users add products across the site."
              />
            </div>
          </div>

          <div className="animate-drift rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="rounded-[26px] bg-white p-5 text-slate-900 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Quick overview
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    Student-first flow
                  </h2>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                  Store ready
                </span>
              </div>
              <div className="mt-6 space-y-4">
                {[
                  "Search and filter products by category and keywords.",
                  "Save items to a wishlist or add them straight to the cart.",
                  "Review order totals and choose pickup or delivery at checkout.",
                  "See recent orders and confirmation states on the orders page.",
                ].map((step, index) => (
                  <div
                    key={step}
                    className="flex gap-4 rounded-2xl bg-slate-50 p-4"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mcneeseBlue text-sm font-semibold text-white">
                      {index + 1}
                    </div>
                    <p className="text-sm leading-6 text-slate-600">{step}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
                {orders.length} recent order{orders.length === 1 ? "" : "s"}{" "}
                available on the orders page.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="animate-rise-delay mt-10 grid gap-5 md:grid-cols-3">
        <FeatureCard
          title="Explore catalog"
          description="Browse the full catalog and open individual product pages for details and availability."
        />
        <FeatureCard
          title="Student-first flow"
          description="Search and filter products, save items to a wishlist, and add them to cart with minimal friction."
        />
        <FeatureCard
          title="Checkout & orders"
          description="Choose pickup or delivery at checkout and review recent orders in one place."
        />
      </section>

      <section className="mt-12">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-mcneeseBlue">
              Featured products
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">
              Inventory shown reflects product records from the catalog
            </h2>
          </div>
          <Link
            to="/products"
            className="text-sm font-semibold text-mcneeseBlue transition hover:text-blue-800"
          >
            See all products
          </Link>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4 items-stretch">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </StorefrontLayout>
  );
}
