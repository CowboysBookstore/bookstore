import { Link } from "react-router-dom";
import StorefrontLayout from "../components/StorefrontLayout";
import { formatCurrency } from "../storefront/data";
import { useStorefront } from "../storefront/StorefrontContext";

export default function CartPage() {
  const { cart, getProduct, removeFromCart, updateCartQuantity } = useStorefront();

  const cartItems = cart
    .map((line) => {
      const product = getProduct(line.productId);
      if (!product) {
        return null;
      }

      return {
        ...line,
        product,
        lineTotal: Number((line.quantity * product.price).toFixed(2)),
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const subtotal = Number(
    cartItems.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2)
  );
  const estimatedTax = Number((subtotal * 0.0875).toFixed(2));
  const estimatedTotal = Number((subtotal + estimatedTax).toFixed(2));

  return (
    <StorefrontLayout>
      <section className="animate-rise grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-mcneeseBlue">
                Cart page
              </p>
              <h1 className="mt-3 text-4xl font-semibold text-slate-900">
                Your cart
              </h1>
            </div>
            <p className="text-sm text-slate-500">
              {cartItems.length} distinct item{cartItems.length === 1 ? "" : "s"}
            </p>
          </div>

          {cartItems.length === 0 ? (
            <div className="mt-10 rounded-[28px] border border-dashed border-slate-300 px-6 py-12 text-center">
              <h2 className="text-2xl font-semibold text-slate-900">Cart is empty</h2>
              <p className="mt-3 text-sm text-slate-500">
                Start on the search page and add products to preview the cart layout.
              </p>
              <Link
                to="/products"
                className="mt-6 inline-flex rounded-full bg-mcneeseBlue px-5 py-3 text-sm font-semibold text-white"
              >
                Browse products
              </Link>
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              {cartItems.map((item) => (
                <article
                  key={item.product.id}
                  className="grid gap-5 rounded-[28px] border border-slate-200 p-5 lg:grid-cols-[160px_1fr_auto]"
                >
                  <div
                    className="h-32 rounded-[22px] p-4 text-white"
                    style={{ background: item.product.coverGradient }}
                  >
                    <p className="text-xs uppercase tracking-[0.18em] text-white/70">
                      {item.product.category}
                    </p>
                    <h2 className="mt-4 text-xl font-semibold">{item.product.title}</h2>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      {item.product.badge}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {item.product.shortDescription}
                    </p>
                    <p className="mt-3 text-sm font-medium text-slate-700">
                      {item.product.pickupNote}
                    </p>
                  </div>

                  <div className="flex flex-col items-start gap-3 lg:items-end">
                    <p className="text-xl font-semibold text-slate-900">
                      {formatCurrency(item.lineTotal)}
                    </p>
                    <div className="flex items-center gap-2 rounded-full bg-slate-100 p-1">
                      <button
                        type="button"
                        onClick={() =>
                          updateCartQuantity(item.product.id, item.quantity - 1)
                        }
                        className="h-9 w-9 rounded-full bg-white text-lg font-semibold text-slate-700 shadow-sm"
                      >
                        -
                      </button>
                      <span className="min-w-10 text-center text-sm font-semibold text-slate-700">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateCartQuantity(item.product.id, item.quantity + 1)
                        }
                        className="h-9 w-9 rounded-full bg-white text-lg font-semibold text-slate-700 shadow-sm"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-sm font-semibold text-slate-500 transition hover:text-slate-800"
                    >
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-mcneeseBlue">
            Order summary
          </p>
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Estimated tax</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(estimatedTax)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-base text-slate-900">
              <span className="font-medium">Estimated total</span>
              <span className="text-xl font-semibold">
                {formatCurrency(estimatedTotal)}
              </span>
            </div>
          </div>

          <div className="mt-8 rounded-[24px] bg-slate-50 p-5 text-sm leading-6 text-slate-600">
            Campus pickup is free. Delivery charges are shown during checkout when the
            user chooses the delivery option.
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <Link
              to="/checkout"
              className={`rounded-full px-5 py-3 text-center text-sm font-semibold ${
                cartItems.length === 0
                  ? "pointer-events-none bg-slate-200 text-slate-400"
                  : "bg-mcneeseBlue text-white transition hover:bg-blue-800"
              }`}
            >
              Continue to checkout
            </Link>
            <Link
              to="/products"
              className="rounded-full border border-slate-200 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Keep shopping
            </Link>
          </div>
        </aside>
      </section>
    </StorefrontLayout>
  );
}
