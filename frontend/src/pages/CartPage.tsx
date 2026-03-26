import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StorefrontLayout from "../components/StorefrontLayout";
import { formatCurrency, promoOffers } from "../storefront/data";
import { useStorefront } from "../storefront/StorefrontContext";

function SummaryCard({
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

export default function CartPage() {
  const {
    cartItems,
    wishlist,
    wishlistCount,
    appliedPromoCode,
    applyPromoCode,
    clearPromoCode,
    removeFromCart,
    updateCartQuantity,
    moveCartToWishlist,
    getPricingSummary,
    clearCart,
  } = useStorefront();
  const [promoInput, setPromoInput] = useState(appliedPromoCode ?? "");
  const [promoFeedback, setPromoFeedback] = useState("");

  useEffect(() => {
    setPromoInput(appliedPromoCode ?? "");
  }, [appliedPromoCode]);

  const pickupSummary = getPricingSummary("pickup");
  const deliverySummary = getPricingSummary("delivery");
  const lowStockCount = cartItems.filter(
    (item) => item.product.stock - item.quantity <= 3
  ).length;

  const handleApplyPromo = () => {
    const result = applyPromoCode(promoInput);
    setPromoFeedback(result.message);
  };

  const handleClearPromo = () => {
    clearPromoCode();
    setPromoFeedback("Promo code removed from this cart.");
  };

  return (
    <StorefrontLayout>
      <section className="animate-rise rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="grid gap-8 xl:grid-cols-[1fr_0.92fr] xl:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-mcneeseBlue">
              Cart management
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-slate-900">
              Review the bag before checkout
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              This milestone turns the cart into a proper management screen with
              quantity controls, save-for-later actions, promo support, delivery
              planning, and a cleaner handoff into checkout.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <SummaryCard
              label="Units in cart"
              value={`${cartItems.reduce((sum, item) => sum + item.quantity, 0)}`}
              detail="Counts every textbook, planner, and accessory already added."
            />
            <SummaryCard
              label="Saved items"
              value={`${wishlistCount}`}
              detail="Wishlist items stay close so students can move between both lists."
            />
            <SummaryCard
              label="Delivery perk"
              value={
                deliverySummary.freeDeliveryRemaining === 0
                  ? "Unlocked"
                  : formatCurrency(deliverySummary.freeDeliveryRemaining)
              }
              detail={
                deliverySummary.freeDeliveryRemaining === 0
                  ? "This cart now qualifies for free delivery at checkout."
                : "More spend needed to unlock free delivery on shipped orders."
              }
            />
          </div>
        </div>
      </section>

      {cartItems.length === 0 ? (
        <section className="mt-8 rounded-[32px] border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">Cart is empty</h2>
          <p className="mt-3 text-sm text-slate-500">
            Start on the search page and add products to preview the cart flow.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/products"
              className="inline-flex rounded-full bg-mcneeseBlue px-5 py-3 text-sm font-semibold text-white"
            >
              Browse products
            </Link>
            {wishlistCount > 0 && (
              <Link
                to="/wishlist"
                className="inline-flex rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Open wishlist
              </Link>
            )}
          </div>
        </section>
      ) : (
        <section className="mt-8 grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            {cartItems.map((item) => {
              const alreadySaved = wishlist.some(
                (entry) => entry.productId === item.product.id
              );
              const remainingStock = item.product.stock - item.quantity;

              return (
                <article
                  key={item.product.id}
                  className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="grid gap-6 lg:grid-cols-[180px_1fr_auto] lg:items-start">
                    <div
                      className="rounded-[24px] p-5 text-white"
                      style={{ background: item.product.coverGradient }}
                    >
                      <p className="text-xs uppercase tracking-[0.18em] text-white/70">
                        {item.product.category}
                      </p>
                      <h2 className="mt-4 text-2xl font-semibold leading-tight">
                        {item.product.title}
                      </h2>
                      <p className="mt-5 text-sm text-white/80">{item.product.badge}</p>
                    </div>

                    <div>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                          {item.product.format}
                        </span>
                        {item.product.course && (
                          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-900">
                            {item.product.course}
                          </span>
                        )}
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-900">
                          {item.product.pickupNote}
                        </span>
                      </div>

                      <p className="mt-4 text-sm leading-7 text-slate-600">
                        {item.product.description}
                      </p>

                      <div className="mt-5 grid gap-3 md:grid-cols-2">
                        <div className="rounded-[20px] bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                          <p className="font-semibold text-slate-900">Delivery note</p>
                          <p className="mt-1">{item.product.deliveryNote}</p>
                        </div>
                        <div className="rounded-[20px] bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                          <p className="font-semibold text-slate-900">Stock watch</p>
                          <p className="mt-1">
                            {remainingStock <= 0
                              ? "You are at the current stock limit for this item."
                              : `${remainingStock} more available before stock runs low.`}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-start gap-3 lg:items-end">
                      <p className="text-xl font-semibold text-slate-900">
                        {formatCurrency(item.lineTotal)}
                      </p>
                      <p className="text-sm text-slate-500">
                        {formatCurrency(item.product.price)} each
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
                          className={`h-9 w-9 rounded-full text-lg font-semibold shadow-sm ${
                            item.quantity >= item.product.stock
                              ? "cursor-not-allowed bg-slate-200 text-slate-400"
                              : "bg-white text-slate-700"
                          }`}
                          disabled={item.quantity >= item.product.stock}
                        >
                          +
                        </button>
                      </div>

                      {alreadySaved ? (
                        <span className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                          Saved in wishlist
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => moveCartToWishlist(item.product.id)}
                          className="text-sm font-semibold text-mcneeseBlue transition hover:text-blue-800"
                        >
                          Save for later
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-sm font-semibold text-slate-500 transition hover:text-slate-800"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-mcneeseBlue">
              Order summary
            </p>
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(pickupSummary.subtotal)}
                </span>
              </div>
              {pickupSummary.discount > 0 && (
                <div className="flex items-center justify-between text-sm text-emerald-700">
                  <span>Promo savings</span>
                  <span className="font-semibold">
                    -{formatCurrency(pickupSummary.discount)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Estimated tax</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(pickupSummary.tax)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Pickup total</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(pickupSummary.total)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-base text-slate-900">
                <span className="font-medium">Delivery total</span>
                <span className="text-xl font-semibold">
                  {formatCurrency(deliverySummary.total)}
                </span>
              </div>
            </div>

            <div className="mt-8 rounded-[24px] bg-slate-50 p-5">
              <label className="block text-sm font-medium text-slate-700">
                Promo code
                <div className="mt-3 flex gap-3">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(event) => setPromoInput(event.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm uppercase transition focus:border-mcneeseBlue focus:ring-2 focus:ring-mcneeseBlue/10"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                  >
                    Apply
                  </button>
                </div>
              </label>

              <div className="mt-4 flex flex-wrap gap-2">
                {promoOffers.map((offer) => (
                  <button
                    key={offer.code}
                    type="button"
                    onClick={() => setPromoInput(offer.code)}
                    className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 transition hover:bg-white"
                  >
                    {offer.code}
                  </button>
                ))}
              </div>

              {(promoFeedback || appliedPromoCode) && (
                <div className="mt-4 rounded-2xl bg-white p-4 text-sm leading-6 text-slate-600">
                  {promoFeedback && <p>{promoFeedback}</p>}
                  {appliedPromoCode && (
                    <button
                      type="button"
                      onClick={handleClearPromo}
                      className="mt-3 font-semibold text-mcneeseBlue transition hover:text-blue-800"
                    >
                      Remove {appliedPromoCode}
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="mt-8 rounded-[24px] bg-blue-50 p-5 text-sm leading-6 text-blue-900">
              {deliverySummary.freeDeliveryRemaining === 0
                ? "Delivery is free on this order right now."
                : `${formatCurrency(
                    deliverySummary.freeDeliveryRemaining
                  )} away from free delivery.`}
            </div>

            {lowStockCount > 0 && (
              <div className="mt-4 rounded-[24px] bg-amber-50 p-5 text-sm leading-6 text-amber-900">
                {lowStockCount} cart item{lowStockCount === 1 ? "" : "s"}{" "}
                {lowStockCount === 1 ? "is" : "are"} getting close to the available
                stock limit.
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3">
              <Link
                to="/checkout"
                className="rounded-full bg-mcneeseBlue px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-800"
              >
                Continue to checkout
              </Link>
              <Link
                to="/products"
                className="rounded-full border border-slate-200 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Keep shopping
              </Link>
              <button
                type="button"
                onClick={clearCart}
                className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-50"
              >
                Clear cart
              </button>
            </div>
          </aside>
        </section>
      )}
    </StorefrontLayout>
  );
}
