import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ProductImage from "../components/ProductImage";
import StorefrontLayout from "../components/StorefrontLayout";
import { formatCurrency, getPickupWindows, formatCardNumber, formatExpiration, getPaymentMethodLabel } from "../storefront/utils";
import { useStorefront } from "../storefront/StorefrontContext";
import type { FulfillmentMethod, PaymentMethod } from "../storefront/types";

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-mcneeseBlue text-sm font-semibold text-white">
        {number}
      </div>
      <h2 className="mt-4 text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const {
    cartItems,
    appliedPromoCode,
    appliedPromoDetails, // New: get applied promo details
    applyPromoCode,
    clearPromoCode,
    getPricingSummary,
    placeOrder,
  } = useStorefront();
  const pickupWindows = getPickupWindows();
  const [fulfillment, setFulfillment] = useState<FulfillmentMethod>("pickup");
  const [pickupSlot, setPickupSlot] = useState(pickupWindows[0] ?? "");
  const [deliveryStreet, setDeliveryStreet] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [deliveryState, setDeliveryState] = useState("");
  const [deliveryZip, setDeliveryZip] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiration, setExpiration] = useState("");
  const [securityCode, setSecurityCode] = useState("");
  const [billingZip, setBillingZip] = useState("");
  const [campusChargeId, setCampusChargeId] = useState("");
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

  const handleApplyPromo = async () => { // Made async
    const result = await applyPromoCode(promoInput); // Await the async call
    setPromoFeedback(result.message);
  };

  const handleClearPromo = () => {
    clearPromoCode();
    setPromoFeedback("Promo code removed from checkout.");
  };

  const handlePlaceOrder = () => {
    setError("");

    if (cartItems.length === 0) {
      setError("Add items to the cart before checking out.");
      return;
    }

    if (fulfillment === "delivery") {
      if (
        !deliveryStreet.trim() ||
        !deliveryCity.trim() ||
        !deliveryState.trim() ||
        !deliveryZip.trim()
      ) {
        setError("Enter a complete delivery address to continue.");
        return;
      }
    }

    if (paymentMethod === "card") {
      const cardDigits = cardNumber.replace(/\D/g, "");
      const expirationDigits = expiration.replace(/\D/g, "");
      const securityDigits = securityCode.replace(/\D/g, "");
      const month = Number(expirationDigits.slice(0, 2));

      if (
        cardDigits.length !== 16 ||
        expirationDigits.length !== 4 ||
        month < 1 ||
        month > 12 ||
        securityDigits.length < 3 ||
        billingZip.replace(/\D/g, "").length !== 5
      ) {
        setError("Enter valid card details to continue.");
        return;
      }
    }

    if (paymentMethod === "campus-charge") {
      const idDigits = campusChargeId.replace(/\D/g, "");
      if (idDigits.length !== 9 || !idDigits.startsWith("000")) {
        setError("Student ID must be exactly 9 digits and start with 000.");
        return;
      }
    }

    if (!agreedToTerms) {
      setError("Review the order details and accept the checkout terms.");
      return;
    }

    const paymentDigits =
      paymentMethod === "card"
        ? cardNumber.replace(/\D/g, "")
        : campusChargeId.replace(/\D/g, "");

    const order = placeOrder({
      fulfillment,
      pickupSlot: fulfillment === "pickup" ? pickupSlot : undefined,
      deliveryAddress:
        fulfillment === "delivery"
          ? `${deliveryStreet.trim()}, ${deliveryCity.trim()}, ${deliveryState.trim()} ${deliveryZip.trim()}`
          : undefined,
      deliveryInstructions:
        fulfillment === "delivery" ? deliveryInstructions : undefined,
      customer: {
        fullName: "", // Placeholder: This should be populated from the authenticated user's profile.
        email: "", // Placeholder: This should be populated from the authenticated user's profile.
        phone: "", // Placeholder: This should be populated from the authenticated user's profile.
      },
      paymentMethod,
      paymentLabel: getPaymentMethodLabel(paymentMethod, paymentDigits),
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
      <section className="animate-rise rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="grid gap-8 xl:grid-cols-[1fr_0.92fr] xl:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-mcneeseBlue">
              Checkout and payment
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-slate-900">
              Secure checkout
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              The checkout flow covers fulfillment choice, verified contact
              info, promo-aware pricing, and multiple payment paths for a
              complete purchasing experience.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <StepCard
              number="1"
              title="Choose fulfillment"
              description="Switch between campus pickup and delivery without losing pricing context."
            />
            <StepCard
              number="2"
              title="Pay and place"
              description="Support card and school ID checkout in one place."
            />
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
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
                    "Pickup stays free and lets students choose the next available store window.",
                },
                {
                  id: "delivery" as const,
                  title: "Delivery",
                  description:
                    pricing.freeDeliveryRemaining === 0
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
                Pickup window
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
                  Street address
                  <input
                    type="text"
                    value={deliveryStreet}
                    onChange={(event) => setDeliveryStreet(event.target.value)}
                    placeholder="123 Main St, Apt 4B"
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm transition focus:border-mcneeseBlue focus:ring-2 focus:ring-mcneeseBlue/10"
                  />
                </label>
                <div className="grid gap-4 md:grid-cols-4">
                  <label className="block text-sm font-medium text-slate-700 md:col-span-2">
                    City
                    <input
                      type="text"
                      value={deliveryCity}
                      onChange={(event) => setDeliveryCity(event.target.value)}
                      placeholder="Lake Charles"
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm transition focus:border-mcneeseBlue focus:ring-2 focus:ring-mcneeseBlue/10"
                    />
                  </label>
                  <label className="block text-sm font-medium text-slate-700 md:col-span-1">
                    State
                    <input
                      type="text"
                      value={deliveryState}
                      onChange={(event) =>
                        setDeliveryState(
                          event.target.value.toUpperCase().slice(0, 2),
                        )
                      }
                      placeholder="LA"
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm transition focus:border-mcneeseBlue focus:ring-2 focus:ring-mcneeseBlue/10"
                    />
                  </label>
                  <label className="block text-sm font-medium text-slate-700 md:col-span-1">
                    ZIP code
                    <input
                      type="text"
                      inputMode="numeric"
                      value={deliveryZip}
                      onChange={(event) =>
                        setDeliveryZip(
                          event.target.value.replace(/\D/g, "").slice(0, 5),
                        )
                      }
                      placeholder="70609"
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm transition focus:border-mcneeseBlue focus:ring-2 focus:ring-mcneeseBlue/10"
                    />
                  </label>
                </div>
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
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">
                  Payment
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Card and school ID checkout are handled in one place.
                </p>
              </div>
              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                Payment options
              </span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                {
                  id: "card" as const,
                  title: "Card",
                  description: "Standard debit or credit card checkout.",
                },
                {
                  id: "campus-charge" as const,
                  title: "School ID",
                  description:
                    "Bill the order to Cowboy Cash using your student ID.",
                },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setPaymentMethod(option.id)}
                  className={`rounded-[24px] border p-5 text-left transition ${
                    paymentMethod === option.id
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

            {paymentMethod === "card" && (
              <div className="mt-6 grid gap-4">
                <label className="block text-sm font-medium text-slate-700">
                  Card number
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0000 0000 0000 0000"
                    value={cardNumber}
                    onChange={(event) =>
                      setCardNumber(formatCardNumber(event.target.value))
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm transition focus:border-mcneeseBlue focus:ring-2 focus:ring-mcneeseBlue/10"
                  />
                </label>

                <div className="grid gap-4 md:grid-cols-3">
                  <label className="block text-sm font-medium text-slate-700">
                    Expiration
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="MM/YY"
                      value={expiration}
                      onChange={(event) =>
                        setExpiration(formatExpiration(event.target.value))
                      }
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm transition focus:border-mcneeseBlue focus:ring-2 focus:ring-mcneeseBlue/10"
                    />
                  </label>
                  <label className="block text-sm font-medium text-slate-700">
                    Security code
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="CVC"
                      value={securityCode}
                      onChange={(event) =>
                        setSecurityCode(
                          event.target.value.replace(/\D/g, "").slice(0, 4),
                        )
                      }
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm transition focus:border-mcneeseBlue focus:ring-2 focus:ring-mcneeseBlue/10"
                    />
                  </label>
                  <label className="block text-sm font-medium text-slate-700">
                    Billing ZIP
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="ZIP"
                      value={billingZip}
                      onChange={(event) =>
                        setBillingZip(
                          event.target.value.replace(/\D/g, "").slice(0, 5),
                        )
                      }
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm transition focus:border-mcneeseBlue focus:ring-2 focus:ring-mcneeseBlue/10"
                    />
                  </label>
                </div>

                <div className="rounded-[24px] bg-slate-50 p-5 text-sm leading-6 text-slate-600">
                  Card details are captured here as part of the final checkout
                  review.
                </div>
              </div>
            )}

            {paymentMethod === "campus-charge" && (
              <div className="mt-6 grid gap-4">
                <label className="block text-sm font-medium text-slate-700">
                  Student ID
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="000123456"
                    value={campusChargeId}
                    onChange={(event) =>
                      setCampusChargeId(
                        event.target.value.replace(/\D/g, "").slice(0, 9),
                      )
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm transition focus:border-mcneeseBlue focus:ring-2 focus:ring-mcneeseBlue/10"
                  />
                </label>
                <div className="rounded-[24px] bg-slate-50 p-5 text-sm leading-6 text-slate-600">
                  Use your student ID when this order should be billed through
                  Cowboy Cash.
                </div>
              </div>
            )}

            <label className="mt-6 flex items-start gap-3 rounded-[24px] bg-slate-50 p-5 text-sm leading-6 text-slate-600">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(event) => setAgreedToTerms(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-mcneeseBlue focus:ring-mcneeseBlue"
              />
              <span>
                I reviewed the checkout details and authorize this order to be
                submitted with the selected payment method.
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
                      type="button" // This button will now trigger the API call
                      onClick={handleApplyPromo}
                      className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                    >
                      Apply
                    </button>
                  </div>
                </label>
                {/* Removed hardcoded promoOffers display */}
                {(promoFeedback || appliedPromoCode || appliedPromoDetails) && ( // Check appliedPromoDetails too
                  <div className="mt-4 rounded-2xl bg-white p-4 text-sm leading-6 text-slate-600">
                    {promoFeedback && <p>{promoFeedback}</p>}
                    {appliedPromoCode && appliedPromoDetails && ( // Display applied promo details
                      <>
                        <p>
                          Promo code "{appliedPromoCode}" applied! You saved{" "}
                          {appliedPromoDetails.discount_type === "percentage"
                            ? `${appliedPromoDetails.discount_value}%`
                            : formatCurrency(appliedPromoDetails.discount_value)}
                          .
                        </p>
                        {appliedPromoDetails.minimum_cart_total && (
                          <p className="mt-1 text-xs text-slate-500">
                            (Minimum cart total:{" "}
                            {formatCurrency(appliedPromoDetails.minimum_cart_total)})
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={handleClearPromo}
                          className="mt-3 font-semibold text-mcneeseBlue transition hover:text-blue-800"
                        >
                          Remove {appliedPromoCode}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6 rounded-[24px] bg-blue-50 p-5 text-sm leading-6 text-blue-900">
                {fulfillment === "pickup"
                  ? `Selected pickup window: ${pickupSlot}`
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
                Place order - {formatCurrency(pricing.total)}
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
