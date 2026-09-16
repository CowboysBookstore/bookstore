import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ProductImage from "../components/ProductImage";
import StorefrontLayout from "../components/StorefrontLayout";
import {
  formatCurrency,
  getPickupWindows,
} from "../storefront/utils";
import { promoOffers } from "../storefront/data";
import { useStorefront } from "../storefront/StorefrontContext";
import type { FulfillmentMethod } from "../storefront/types";

function formatPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length < 4) {
    return digits;
  }
  if (digits.length < 7) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  }

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const {
    cartItems,
    appliedPromoCode,
    applyPromoCode,
    clearPromoCode,
    getPricingSummary,
    placeOrder,
  } = useStorefront();
  const pickupWindows = getPickupWindows();
  const [fulfillment, setFulfillment] = useState<FulfillmentMethod>("pickup");
  const [pickupSlot, setPickupSlot] = useState(pickupWindows[0] ?? "");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [promoInput, setPromoInput] = useState(appliedPromoCode ?? "");
  const [promoFeedback, setPromoFeedback] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setPromoInput(appliedPromoCode ?? "");
  }, [appliedPromoCode]);

  useEffect(() => {
    if (pickupWindows.length > 0 && !pickupWindows.includes(pickupSlot)) {
      setPickupSlot(pickupWindows[0]);
    }
  }, [pickupSlot, pickupWindows]);

  const pricing = getPricingSummary(fulfillment);

  const handleApplyPromo = async () => {
    const result = await applyPromoCode(promoInput);
    setPromoFeedback(result.message);
  };

  const handleClearPromo = () => {
    clearPromoCode();
    setPromoFeedback("Promo code removed from checkout.");
  };

  const handlePlaceOrder = async () => {
    setError("");

    if (cartItems.length === 0) {
      setError("Add items to the cart before checking out.");
      return;
    }

    if (fulfillment === "delivery" && deliveryAddress.trim() === "") {
      setError("Enter a delivery address to continue.");
      return;
    }

    if (
      fullName.trim() === "" ||
      email.trim() === "" ||
      phone.replace(/\D/g, "").length !== 10
    ) {
      setError("Complete the contact details before placing the order.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address before placing the order.");
      return;
    }

    if (!agreedToTerms) {
      setError("Review your order and confirm you understand payment is not collected here.");
      return;
    }

    const order = await placeOrder({
      fulfillment,
      pickupSlot: fulfillment === "pickup" ? pickupSlot : undefined,
      deliveryAddress: fulfillment === "delivery" ? deliveryAddress : undefined,
      deliveryInstructions:
        fulfillment === "delivery" ? deliveryInstructions : undefined,
      customer: {
        fullName,
        email,
        phone,
      },
      paymentMethod: "pay-later",
      paymentLabel: "Payment to be arranged",
      promoCode: appliedPromoCode ?? undefined,
      discount: pricing.discount,
    });

    if (!order) {
      setError("Unable to create the order right now.");
      return;
    }

    navigate("/orders", { state: { orderId: order.id } });
  };

  return (
    <StorefrontLayout>
      <section className="animate-rise border-b border-slate-200 pb-6 pt-3">
        <p className="text-xs font-semibold uppercase text-mcneeseBlue">
          Checkout
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">
          Review your order
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Tell us how you would like your items and leave a way to reach you.
          Payment is arranged after your request is confirmed.
        </p>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          {error && (
            <div className="rounded-[24px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">
              Fulfillment
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                {
                  id: "pickup" as const,
                  title: "Campus pickup",
                  description:
                    "Pickup is free. Tell us which window works for you.",
                },
                {
                  id: "delivery" as const,
                  title: "Delivery",
                  description:
                    cartItems.length === 0
                      ? "Add items to see the delivery estimate."
                      : pricing.freeDeliveryRemaining === 0
                      ? "This order already qualifies for free delivery."
                      : "Delivery adds a fee until the order crosses the free-delivery threshold.",
                },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setFulfillment(option.id)}
                  className={`rounded-[24px] border p-5 text-left transition ${
                    fulfillment === option.id
                      ? "border-mcneeseBlue bg-blue-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <p className="text-lg font-semibold text-slate-900">
                    {option.title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {option.description}
                  </p>
                </button>
              ))}
            </div>

            {fulfillment === "pickup" ? (
              <label className="mt-6 block text-sm font-medium text-slate-700">
                Preferred pickup window
                <select
                  value={pickupSlot}
                  onChange={(event) => setPickupSlot(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm transition focus:border-mcneeseBlue focus:ring-2 focus:ring-mcneeseBlue/10"
                >
                  {pickupWindows.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <div className="mt-6 grid gap-4">
                <label className="block text-sm font-medium text-slate-700">
                  Delivery address
                  <textarea
                    value={deliveryAddress}
                    onChange={(event) => setDeliveryAddress(event.target.value)}
                    rows={4}
                    placeholder="Residence hall or off-campus address"
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm transition focus:border-mcneeseBlue focus:ring-2 focus:ring-mcneeseBlue/10"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Delivery instructions
                  <textarea
                    value={deliveryInstructions}
                    onChange={(event) =>
                      setDeliveryInstructions(event.target.value)
                    }
                    rows={3}
                    placeholder="Entry code, desk drop, or residence hall details"
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm transition focus:border-mcneeseBlue focus:ring-2 focus:ring-mcneeseBlue/10"
                  />
                </label>
              </div>
            )}
          </section>

          <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">
              Contact information
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <label className="block text-sm font-medium text-slate-700">
                Full name
                <input
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm transition focus:border-mcneeseBlue focus:ring-2 focus:ring-mcneeseBlue/10"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm transition focus:border-mcneeseBlue focus:ring-2 focus:ring-mcneeseBlue/10"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Phone
                <input
                  type="tel"
                  value={phone}
                  onChange={(event) =>
                    setPhone(formatPhoneNumber(event.target.value))
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm transition focus:border-mcneeseBlue focus:ring-2 focus:ring-mcneeseBlue/10"
                />
              </label>
            </div>
          </section>

          <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">
              Payment comes later
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              This site records your order request but does not charge a card or
              campus account. Payment and availability need to be confirmed
              separately before pickup or delivery.
            </p>

            <label className="mt-6 flex items-start gap-3 rounded-[24px] bg-slate-50 p-5 text-sm leading-6 text-slate-600">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(event) => setAgreedToTerms(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-mcneeseBlue focus:ring-mcneeseBlue"
              />
              <span>
                I reviewed the order details and understand no payment is
                collected here. The request still needs confirmation.
              </span>
            </label>
          </section>
        </div>

        <aside className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-mcneeseBlue">
            Review order
          </p>
          {cartItems.length === 0 ? (
            <div className="mt-6 rounded-[24px] border border-dashed border-slate-300 px-5 py-8 text-center">
              <p className="text-lg font-semibold text-slate-900">
                Nothing to review yet
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Add items to your cart before visiting checkout.
              </p>
              <Link
                to="/products"
                className="mt-5 inline-flex rounded-full bg-mcneeseBlue px-5 py-3 text-sm font-semibold text-white"
              >
                Browse products
              </Link>
            </div>
          ) : (
            <>
              <div className="mt-6 space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-start gap-4 rounded-[22px] bg-slate-50 p-4"
                  >
                    <ProductImage
                      product={item.product}
                      className="h-16 w-16 flex-shrink-0 rounded-2xl"
                      overlayClassName="bg-slate-950/5"
                    />
                    <div className="flex flex-1 items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {item.product.title}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Qty {item.quantity} - {item.product.category}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">
                        {formatCurrency(item.lineTotal)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-3 border-t border-slate-200 pt-6 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(pricing.subtotal)}
                  </span>
                </div>
                {pricing.discount > 0 && (
                  <div className="flex items-center justify-between text-emerald-700">
                    <span>Promo savings</span>
                    <span className="font-semibold">
                      -{formatCurrency(pricing.discount)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span>Estimated tax</span>
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(pricing.tax)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>
                    {fulfillment === "pickup" ? "Pickup" : "Delivery fee"}
                  </span>
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(pricing.fulfillmentFee)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-base text-slate-900">
                  <span className="font-medium">Total</span>
                  <span className="text-xl font-semibold">
                    {formatCurrency(pricing.total)}
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
                      onChange={(event) =>
                        setPromoInput(event.target.value.toUpperCase())
                      }
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

              <div className="mt-6 rounded-[24px] bg-blue-50 p-5 text-sm leading-6 text-blue-900">
                {fulfillment === "pickup"
                  ? `Preferred pickup window: ${pickupSlot}. We will confirm availability.`
                  : pricing.freeDeliveryRemaining === 0
                    ? "Delivery is free on this order."
                    : `${formatCurrency(
                        pricing.freeDeliveryRemaining,
                      )} away from free delivery.`}
              </div>

              <button
                type="button"
                onClick={handlePlaceOrder}
                className="mt-8 w-full rounded-full bg-mcneeseBlue px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
              >
                Send order request - {formatCurrency(pricing.total)}
              </button>
              <Link
                to="/cart"
                className="mt-3 block rounded-full border border-slate-200 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Back to cart
              </Link>
            </>
          )}
        </aside>
      </section>
    </StorefrontLayout>
  );
}
