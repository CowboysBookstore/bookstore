import { Link } from "react-router-dom";
import StorefrontLayout from "../components/StorefrontLayout";
import { formatCurrency, formatShortDate } from "../storefront/data";
import { useStorefront } from "../storefront/StorefrontContext";
import type { WishlistPriority } from "../storefront/types";

const priorityOptions: WishlistPriority[] = ["Need soon", "Compare", "Later"];

function InsightCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
    </div>
  );
}

export default function WishlistPage() {
  const {
    wishlistItems,
    cartItems,
    moveWishlistToCart,
    moveAllWishlistToCart,
    removeFromWishlist,
    updateWishlistPriority,
  } = useStorefront();

  const savedProducts = [...wishlistItems].sort((left, right) => {
    const priorityRank: Record<WishlistPriority, number> = {
      "Need soon": 0,
      Compare: 1,
      Later: 2,
    };
    return priorityRank[left.entry.priority] - priorityRank[right.entry.priority];
  });
  const totalValue = savedProducts.reduce((sum, item) => sum + item.product.price, 0);
  const urgentCount = savedProducts.filter(
    (item) => item.entry.priority === "Need soon"
  ).length;
  const cartQuantityByProduct = new Map(
    cartItems.map((item) => [item.product.id, item.quantity])
  );

  return (
    <StorefrontLayout>
      <section className="animate-rise rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="grid gap-8 xl:grid-cols-[1fr_0.92fr] xl:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-mcneeseBlue">
              Wishlist management
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-slate-900">
              Saved for later, organized on purpose
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              This screen now works like a real wishlist system: students can
              prioritize items, keep tabs on what is already in the cart, and move
              saved products back into checkout when they are ready.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <InsightCard
              label="Saved products"
              value={`${savedProducts.length}`}
              detail="Every saved item stays visible across the storefront."
            />
            <InsightCard
              label="Need soon"
              value={`${urgentCount}`}
              detail="Priority labels help students separate must-buys from maybes."
            />
            <InsightCard
              label="Wishlist value"
              value={formatCurrency(totalValue)}
              detail="A quick estimate of what the saved stack is worth right now."
            />
          </div>
        </div>
      </section>

      {savedProducts.length === 0 ? (
        <section className="mt-8 rounded-[32px] border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">Your wishlist is empty</h2>
          <p className="mt-3 text-sm text-slate-500">
            Browse the catalog and save products that students may want later.
          </p>
          <Link
            to="/products"
            className="mt-6 inline-flex rounded-full bg-mcneeseBlue px-5 py-3 text-sm font-semibold text-white"
          >
            Browse products
          </Link>
        </section>
      ) : (
        <section className="mt-8 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-slate-200 bg-white px-6 py-5 shadow-sm">
            <div>
              <p className="text-lg font-semibold text-slate-900">
                Wishlist is synced with the cart
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Items already in the bag stay visible here so students can compare
                and decide before checking out.
              </p>
            </div>
            <button
              type="button"
              onClick={moveAllWishlistToCart}
              className="rounded-full bg-mcneeseBlue px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              Move all to cart
            </button>
          </div>

          {savedProducts.map(({ entry, product }) => (
            <article
              key={product.id}
              className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="grid gap-6 lg:grid-cols-[220px_1fr_auto] lg:items-center">
                <div
                  className="h-40 rounded-[24px] p-5 text-white"
                  style={{ background: product.coverGradient }}
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-white/70">
                    {product.category}
                  </p>
                  <h2 className="mt-4 text-2xl font-semibold">{product.title}</h2>
                </div>

                <div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                      {product.badge}
                    </span>
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-900">
                      Saved {formatShortDate(entry.addedAt)}
                    </span>
                    {cartQuantityByProduct.has(product.id) && (
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-900">
                        {cartQuantityByProduct.get(product.id)} already in cart
                      </span>
                    )}
                  </div>

                  <p className="mt-4 text-2xl font-semibold text-slate-900">
                    {formatCurrency(product.price)}
                  </p>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                    {product.description}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {product.highlights.map((highlight) => (
                      <span
                        key={highlight}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-sm font-medium text-slate-700">
                    Priority
                    <select
                      value={entry.priority}
                      onChange={(event) =>
                        updateWishlistPriority(
                          product.id,
                          event.target.value as WishlistPriority
                        )
                      }
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm transition focus:border-mcneeseBlue focus:ring-2 focus:ring-mcneeseBlue/10"
                    >
                      {priorityOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    onClick={() => moveWishlistToCart(product.id)}
                    className="rounded-full bg-mcneeseBlue px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
                  >
                    Add to cart now
                  </button>
                  <Link
                    to={`/products/${product.id}`}
                    className="rounded-full border border-slate-200 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    View details
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeFromWishlist(product.id)}
                    className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </StorefrontLayout>
  );
}
