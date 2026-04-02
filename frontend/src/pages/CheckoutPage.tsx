import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import StorefrontLayout from "../components/StorefrontLayout";
import { formatCurrency, getPickupWindows, promoOffers } from "../storefront/data";
import { useStorefront } from "../storefront/StorefrontContext";
import type { FulfillmentMethod, PaymentMethod } from "../storefront/types";
import { getPaymentMethodLabel } from "../storefront/utils";

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

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.match(/.{1,4}/g)?.join(" ") ?? digits;
}

function formatExpiration(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

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
  const [fullName, setFullName] = useState("Cowboy Student");
  const [email, setEmail] = useState("student@mcneese.edu");
  const [phone, setPhone] = useState("(337) 555-0144");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiration, setExpiration] = useState("");
  const [securityCode, setSecurityCode] = useState("");
  const [billingZip, setBillingZip] = useState("");
  const [campusChargeId, setCampusChargeId] = useState("0002048");
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

  const handleApplyPromo = () => {
    const result = applyPromoCode(promoInput);
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

    if (paymentMethod === "card") {
      const cardDigits = cardNumber.replace(/\D/g, "");
      if (!/^[0-9]{16}$/.test(cardDigits)) {
        setError("Card number must be 16 digits.");
        return;
      }
      function luhnCheck(num: string) {
        let sum = 0;
        let shouldDouble = false;
        for (let i = num.length - 1; i >= 0; i--) {
          let digit = parseInt(num.charAt(i));
          if (shouldDouble) {
            digit *= 2;
            if (digit > 9) digit -= 9;
          }
          sum += digit;
          shouldDouble = !shouldDouble;
        }
        return sum % 10 === 0;
      }
      if (!luhnCheck(cardDigits)) {
        setError("Invalid card number.");
        return;
      }
      // Expiry validation
      if (!expiration) {
        setError("Expiration date is required.");
        return;
      }
      const [expYear, expMonth] = expiration.split("-").map(Number);
      const now = new Date();
      if (
        expYear < now.getFullYear() ||
        (expYear === now.getFullYear() && expMonth < now.getMonth() + 1)
      ) {
        setError("Card expiration date cannot be in the past.");
        return;
      }
      if (expMonth < 1 || expMonth > 12) {
        setError("Expiration month must be between 01 and 12.");
        return;
      }
      // Security code validation (3 digits)
      const securityDigits = securityCode.replace(/\D/g, "");
      if (!/^[0-9]{3}$/.test(securityDigits)) {
        setError("Security code must be 3 digits.");
        return;
      }
      // Billing ZIP validation (5 digits)
      const zipDigits = billingZip.replace(/\D/g, "");
      if (!/^[0-9]{5}$/.test(zipDigits)) {
        setError("Billing ZIP must be 5 digits.");
        return;
      }
    }

    if (
      paymentMethod === "campus-charge" &&
      campusChargeId.replace(/\D/g, "").length < 7
    ) {
      setError("Enter a valid campus charge account or student ID.");
      return;
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
      deliveryAddress: fulfillment === "delivery" ? deliveryAddress : undefined,
      deliveryInstructions:
        fulfillment === "delivery" ? deliveryInstructions : undefined,
      customer: {
        fullName,
        email,
        phone,
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
            <h1 className="mt-3 text-4xl font-semibold text-slate-900">Secure checkout</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              The checkout flow now covers fulfillment choice, verified contact
              info, promo-aware pricing, and multiple payment paths so the
              bookstore demo feels like a complete purchasing system.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <StepCard
              number="1"
              title="Choose fulfillment"
              description="Switch between campus pickup and delivery without losing pricing context."
            />
            <StepCard
              number="2"
              title="Confirm student details"
              description="Collect the contact information needed for pickup updates or shipping notices."
            />
            <StepCard
              number="3"
              title="Pay and place"
              description="Support card, campus charge, or wallet-style checkout UI in one place."
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
            <h2 className="text-2xl font-semibold text-slate-900">Fulfillment</h2>
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
                  <p className="text-lg font-semibold text-slate-900">{option.title}</p>
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
                    onChange={(event) => setDeliveryInstructions(event.target.value)}
                    rows={3}
                    placeholder="Entry code, desk drop, or residence hall details"
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm transition focus:border-mcneeseBlue focus:ring-2 focus:ring-mcneeseBlue/10"
                  />
                </label>
              </div>
            )}
          </section>

          <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">Contact information</h2>
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
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Payment</h2>
                <p className="mt-2 text-sm text-slate-500">
                  A polished demo layer for card, campus charge, and wallet checkout.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                {
                  id: "card" as const,
                  title: "Card",
                  description: "Standard debit or credit card checkout.",
                },
                {
                  id: "campus-charge" as const,
                  title: "Campus charge",
                  description: "Bill the student bookstore or campus account.",
                },
                {
                  id: "paypal" as const,
                  title: "Wallet",
                  description: "A PayPal-style express payment placeholder.",
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
                  <p className="text-lg font-semibold text-slate-900">{option.title}</p>
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
                    type="tel"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    name="cc-number"
                    maxLength={19}
                    value={cardNumber}
                    onChange={(event) => {
                      let val = event.target.value;
                      val = val.replace(/[^0-9 ]/g, "");
                      val = val.replace(/\s+/g, "");
                      val = val.slice(0, 16);
                      val = val.replace(/(.{4})/g, "$1 ").trim();
                      setCardNumber(val);
                    }}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm transition focus:border-mcneeseBlue focus:ring-2 focus:ring-mcneeseBlue/10"
                  />
                </label>

                <div className="grid gap-4 md:grid-cols-3">
                  <label className="block text-sm font-medium text-slate-700">
                    Expiration
                    <input
                      type="month"
                      min={(() => {
                        const now = new Date();
                        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
                      })()}
                      name="cc-exp"
                      autoComplete="cc-exp"
                      value={expiration}
                      onChange={(event) => {
                        setExpiration(event.target.value);
                      }}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm transition focus:border-mcneeseBlue focus:ring-2 focus:ring-mcneeseBlue/10"
                    />
                  </label>
                  <label className="block text-sm font-medium text-slate-700">
                    Security code
                    <input
                      type="text"
                      inputMode="numeric"
                      name="cc-csc"
                      autoComplete="cc-csc"
                      maxLength={3}
                      value={securityCode}
                      onChange={(event) => {
                        let val = event.target.value.replace(/[^0-9]/g, "");
                        setSecurityCode(val.slice(0, 3));
                      }}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm transition focus:border-mcneeseBlue focus:ring-2 focus:ring-mcneeseBlue/10"
                    />
                  </label>
                  <label className="block text-sm font-medium text-slate-700">
                    Billing ZIP
                    <input
                      type="text"
                      inputMode="numeric"
                      name="postal-code"
                      autoComplete="postal-code"
                      maxLength={5}
                      value={billingZip}
                      onChange={(event) => {
                        let val = event.target.value.replace(/[^0-9]/g, "");
                        setBillingZip(val.slice(0, 5));
                      }}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm transition focus:border-mcneeseBlue focus:ring-2 focus:ring-mcneeseBlue/10"
                    />
                  </label>
                </div>

                <div className="rounded-[24px] bg-slate-50 p-5 text-sm leading-6 text-slate-600">
                  This is still a frontend-only build, but the layout is now ready for a real payment intent flow later.
                </div>
              </div>
            )}

            {paymentMethod === "campus-charge" && (
              <div className="mt-6 grid gap-4">
                <label className="block text-sm font-medium text-slate-700">
                  Student or campus charge ID
                  <input
                    type="text"
                    value={campusChargeId}
                    onChange={(event) =>
                      setCampusChargeId(event.target.value.replace(/\D/g, "").slice(0, 10))
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm transition focus:border-mcneeseBlue focus:ring-2 focus:ring-mcneeseBlue/10"
                  />
                </label>
                <div className="rounded-[24px] bg-slate-50 p-5 text-sm leading-6 text-slate-600">
                  Campus charge keeps the payment step simple for students whose
                  bookstore spend is billed through the school account.
                </div>
              </div>
            )}

            {paymentMethod === "paypal" && (
              <div className="mt-6 rounded-[24px] bg-slate-50 p-5 text-sm leading-6 text-slate-600">
                Express wallet checkout uses the contact email on file and would
                normally redirect out to a payment provider before returning to the
                order confirmation screen.
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
                I reviewed the checkout details and understand this payment flow is a demo-ready frontend for the bookstore.
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
              <p className="text-lg font-semibold text-slate-900">Nothing to review yet</p>
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
                    className="flex items-start justify-between gap-4 rounded-[22px] bg-slate-50 p-4"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{item.product.title}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Qty {item.quantity} - {item.product.category}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">
                      {formatCurrency(item.lineTotal)}
                    </p>
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
                  <span>{fulfillment === "pickup" ? "Pickup" : "Delivery fee"}</span>
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
                  ? `Selected pickup window: ${pickupSlot}`
                  : pricing.freeDeliveryRemaining === 0
                    ? "Delivery is free on this order."
                    : `${formatCurrency(
                        pricing.freeDeliveryRemaining
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
