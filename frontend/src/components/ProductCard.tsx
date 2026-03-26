import { Link } from "react-router-dom";
import { formatCurrency } from "../storefront/data";
import { useStorefront } from "../storefront/StorefrontContext";
import type { Product } from "../storefront/types";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, wishlist, cart } = useStorefront();
  const isWishlisted = wishlist.some((item) => item.productId === product.id);
  const cartQuantity =
    cart.find((item) => item.productId === product.id)?.quantity ?? 0;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div
        className="relative h-44 p-5 text-white"
        style={{ background: product.coverGradient }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/95">
              {product.category}
            </span>
            {cartQuantity > 0 && (
              <span className="rounded-full bg-black/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                In cart: {cartQuantity}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => toggleWishlist(product.id)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              isWishlisted
                ? "bg-white text-slate-900"
                : "bg-black/15 text-white hover:bg-black/25"
            }`}
          >
            {isWishlisted ? "Saved" : "Wishlist"}
          </button>
        </div>
        <div className="mt-10 max-w-[15rem]">
          <p className="text-xs uppercase tracking-[0.24em] text-white/70">
            {product.badge}
          </p>
          <h3 className="mt-2 text-2xl font-semibold leading-tight">
            {product.title}
          </h3>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">{product.shortDescription}</p>
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
              {product.format}
              {product.course ? ` - ${product.course}` : ""}
            </p>
          </div>
          <p className="text-lg font-semibold text-slate-900">
            <span className="inline-block rounded-full bg-mcneeseGold px-3 py-1 text-sm font-semibold text-slate-900">
              {formatCurrency(product.price)}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {product.highlights.slice(0, 2).map((highlight) => (
            <span
              key={highlight}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
            >
              {highlight}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/products/${product.id}`}
            className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            View details
          </Link>

          <button
            type="button"
            onClick={() => toggleWishlist(product.id)}
            aria-pressed={isWishlisted}
            className={`h-10 w-10 flex-shrink-0 rounded-full border border-slate-200 transition flex items-center justify-center text-sm font-semibold ${
              isWishlisted ? "bg-mcneeseGold text-slate-900" : "bg-white text-slate-700 hover:bg-slate-50"
            }`}
            title={isWishlisted ? "Saved" : "Add to wishlist"}
          >
            {isWishlisted ? "♥" : "♡"}
          </button>

          <button
            type="button"
            onClick={() => addToCart(product.id)}
            className="flex-1 rounded-full bg-mcneeseBlue px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            {cartQuantity > 0 ? "Add another" : "Add to cart"}
          </button>
        </div>
      </div>
    </article>
  );
}
