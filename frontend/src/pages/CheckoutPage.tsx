import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import StorefrontLayout from "../components/StorefrontLayout";
import { formatCurrency } from "../storefront/data";
import { useStorefront } from "../storefront/StorefrontContext";
import type { FulfillmentMethod } from "../storefront/types";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, getProduct, placeOrder } = useStorefront();
  const [fulfillment, setFulfillment] = useState<FulfillmentMethod>("pickup");
  const [pickupSlot, setPickupSlot] = useState("March 20, 1:00 PM - 3:00 PM");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [fullName, setFullName] = useState("Cowboy Student");
  const [email, setEmail] = useState("student@mcneese.edu");
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [expiration, setExpiration] = useState("08/28");
  const [securityCode, setSecurityCode] = useState("123");
  const [error, setError] = useState("");

  const checkoutItems = cart
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
    checkoutItems.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2)
  );
  const tax = Number((subtotal * 0.0875).toFixed(2));
  const fulfillmentFee = fulfillment === "delivery" ? 6.95 : 0;
  const total = Number((subtotal + tax + fulfillmentFee).toFixed(2));

  const handlePlaceOrder = () => {
    setError("");

    if (checkoutItems.length === 0) {
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
      cardNumber.trim() === "" ||
      expiration.trim() === "" ||
      securityCode.trim() === ""
    ) {
      setError("Complete the contact and payment fields before placing the order.");
      return;
    }

    const order = placeOrder({
      fulfillment,
      pickupSlot: fulfillment === "pickup" ? pickupSlot : undefined,
      deliveryAddress: fulfillment === "delivery" ? deliveryAddress : undefined,
    });

    if (!order) {
      setError("Unable to create the order right now.");
      return;
    }

    navigate("/orders", { state: { orderId: order.id } });
  };

  return (
    <StorefrontLayout>
      <section className="animate-rise grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-mcneeseBlue">
              Checkout page
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-slate-900">Checkout</h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              This frontend-only checkout demonstrates the flow for pickup or delivery,
              student contact information, and a Stripe-ready payment section.
            </p>
          </div>

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
                  description: "Students collect orders from the bookstore during available windows.",
                },
                {
                  id: "delivery" as const,
                  title: "Delivery",
                  description: "Show delivery address fields and add a shipping fee to the order summary.",
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
                  <option>March 20, 1:00 PM - 3:00 PM</option>
                  <option>March 20, 3:30 PM - 5:00 PM</option>
                  <option>March 21, 9:00 AM - 11:00 AM</option>
                </select>
              </label>
            ) : (
              <label className="mt-6 block text-sm font-medium text-slate-700">
                Delivery address
                <textarea
                  value={deliveryAddress}
                  onChange={(event) => setDeliveryAddress(event.target.value)}
                  rows={4}
                  placeholder="Residence hall or off-campus address"
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm transition focus:border-mcneeseBlue focus:ring-2 focus:ring-mcneeseBlue/10"
                />
              </label>
            )}
          </section>

          <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">Contact information</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
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
            </div>
          </section>

          <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Payment</h2>
                <p className="mt-2 text-sm text-slate-500">
                  UI placeholder for a Stripe card flow.
                </p>
              </div>
              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                Stripe ready
              </span>
            </div>

            <div className="mt-6 grid gap-4">
              <label className="block text-sm font-medium text-slate-700">
                Card number
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(event) => setCardNumber(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm transition focus:border-mcneeseBlue focus:ring-2 focus:ring-mcneeseBlue/10"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Expiration
                  <input
                    type="text"
                    value={expiration}
                    onChange={(event) => setExpiration(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm transition focus:border-mcneeseBlue focus:ring-2 focus:ring-mcneeseBlue/10"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Security code
                  <input
                    type="text"
                    value={securityCode}
                    onChange={(event) => setSecurityCode(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm transition focus:border-mcneeseBlue focus:ring-2 focus:ring-mcneeseBlue/10"
                  />
                </label>
              </div>
            </div>
          </section>
        </div>

        <aside className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-mcneeseBlue">
            Review order
          </p>
          {checkoutItems.length === 0 ? (
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
                {checkoutItems.map((item) => (
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
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Estimated tax</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(tax)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{fulfillment === "pickup" ? "Pickup" : "Delivery fee"}</span>
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(fulfillmentFee)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-base text-slate-900">
                  <span className="font-medium">Total</span>
                  <span className="text-xl font-semibold">{formatCurrency(total)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePlaceOrder}
                className="mt-8 w-full rounded-full bg-mcneeseBlue px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
              >
                Place order
              </button>
            </>
          )}
        </aside>
      </section>
    </StorefrontLayout>
  );
}
