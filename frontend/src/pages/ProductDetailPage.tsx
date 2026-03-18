import { Link, useParams } from "react-router-dom";
import StorefrontLayout from "../components/StorefrontLayout";
import { formatCurrency } from "../storefront/data";
import { useStorefront } from "../storefront/StorefrontContext";

export default function ProductDetailPage() {
  const { productId } = useParams();
  const { products, addToCart, toggleWishlist, wishlist, getProduct } = useStorefront();

  if (!productId) {
    return null;
  }

  const product = getProduct(productId);

  if (!product) {
    return (
      <StorefrontLayout>
        <section className="rounded-[32px] border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm">
          <h1 className="text-3xl font-semibold text-slate-900">Product not found</h1>
          <p className="mt-3 text-sm text-slate-500">
            This mock product does not exist in the sample catalog yet.
          </p>
          <Link
            to="/products"
            className="mt-6 inline-flex rounded-full bg-mcneeseBlue px-5 py-3 text-sm font-semibold text-white"
          >
            Back to search
          </Link>
        </section>
      </StorefrontLayout>
    );
  }

  const relatedProducts = products
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, 3);
  const isWishlisted = wishlist.includes(product.id);

  return (
    <StorefrontLayout>
      <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div
          className="animate-rise relative overflow-hidden rounded-[36px] p-8 text-white shadow-xl"
          style={{ background: product.coverGradient }}
        >
          <span className="rounded-full bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em]">
            {product.badge}
          </span>
          <div className="mt-20 max-w-md">
            <p className="text-sm uppercase tracking-[0.22em] text-white/70">
              {product.category}
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight">
              {product.title}
            </h1>
            <p className="mt-5 text-base leading-7 text-white/90">
              {product.shortDescription}
            </p>
          </div>
        </div>

        <div className="animate-rise-delay rounded-[36px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-mcneeseBlue">
                Product details
              </p>
              <p className="mt-3 text-4xl font-semibold text-slate-900">
                {formatCurrency(product.price)}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <p>
                Rating <span className="font-semibold text-slate-900">{product.rating}</span>
              </p>
              <p className="mt-1">
                In stock <span className="font-semibold text-slate-900">{product.stock}</span>
              </p>
            </div>
          </div>

          <p className="mt-6 text-base leading-7 text-slate-600">{product.description}</p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Pickup
              </p>
              <p className="mt-2 text-sm font-medium text-slate-700">{product.pickupNote}</p>
            </div>
            <div className="rounded-[24px] bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Delivery
              </p>
              <p className="mt-2 text-sm font-medium text-slate-700">
                {product.deliveryNote}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {product.highlights.map((highlight) => (
              <span
                key={highlight}
                className="rounded-full bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900"
              >
                {highlight}
              </span>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => addToCart(product.id)}
              className="rounded-full bg-mcneeseBlue px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              Add to cart
            </button>
            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              className={`rounded-full px-6 py-3 text-sm font-semibold transition ${
                isWishlisted
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {isWishlisted ? "Saved in wishlist" : "Save to wishlist"}
            </button>
            <Link
              to="/checkout"
              className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Go to checkout
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-10 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-mcneeseBlue">
              More in this category
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">
              Related picks
            </h2>
          </div>
          <Link
            to="/products"
            className="text-sm font-semibold text-mcneeseBlue transition hover:text-blue-800"
          >
            Back to all products
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {relatedProducts.map((item) => (
            <Link
              key={item.id}
              to={`/products/${item.id}`}
              className="rounded-[24px] border border-slate-200 p-5 transition hover:-translate-y-1 hover:shadow-md"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                {item.category}
              </p>
              <h3 className="mt-3 text-xl font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.shortDescription}</p>
              <p className="mt-4 text-sm font-semibold text-mcneeseBlue">
                {formatCurrency(item.price)}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </StorefrontLayout>
  );
}
