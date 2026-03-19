import { Link } from "react-router-dom";
import StorefrontLayout from "../components/StorefrontLayout";
import { formatCurrency } from "../storefront/data";
import { useStorefront } from "../storefront/StorefrontContext";

export default function WishlistPage() {
  const {
    wishlist,
    getProduct,
    moveWishlistToCart,
    moveAllWishlistToCart,
    removeFromWishlist,
  } = useStorefront();

  const savedProducts = wishlist
    .map((productId) => getProduct(productId))
    .filter((product): product is NonNullable<typeof product> => Boolean(product));

  return (
    <StorefrontLayout>
      <section className="animate-rise rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-mcneeseBlue">
              Wishlist page
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-slate-900">
              Saved for later
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Let students bookmark books and supplies before they are ready to
              purchase. This page helps compare saved products and move them into
              the cart when the time is right.
            </p>
          </div>

          {savedProducts.length > 0 && (
            <button
              type="button"
              onClick={moveAllWishlistToCart}
              className="rounded-full bg-mcneeseBlue px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              Move all to cart
            </button>
          )}
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
          {savedProducts.map((product) => (
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
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {product.badge}
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-slate-900">
                    {formatCurrency(product.price)}
                  </p>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                    {product.description}
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => moveWishlistToCart(product.id)}
                    className="rounded-full bg-mcneeseBlue px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
                  >
                    Move to cart
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
