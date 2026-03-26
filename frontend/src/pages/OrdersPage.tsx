import { Link, useLocation } from "react-router-dom";
import StorefrontLayout from "../components/StorefrontLayout";
import {
  formatCurrency,
  formatOrderDate,
  formatOrderDateTime,
} from "../storefront/data";
import { useStorefront } from "../storefront/StorefrontContext";

export default function OrdersPage() {
  const location = useLocation();
  const { orders } = useStorefront();
  const latestOrderId = (location.state as { orderId?: string } | null)?.orderId;
  const latestOrder = latestOrderId
    ? orders.find((order) => order.id === latestOrderId)
    : null;

  return (
    <StorefrontLayout>
      <section className="animate-rise rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-mcneeseBlue">
          Order confirmation
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-900">Recent orders</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
          The order page now doubles as a confirmation hub, giving students a clear
          success state after checkout plus a richer history of prior purchases.
        </p>
      </section>

      {latestOrder && (
        <section className="mt-8 rounded-[30px] border border-emerald-200 bg-emerald-50 p-6 text-emerald-950 shadow-sm">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
                Order placed successfully
              </p>
              <h2 className="mt-2 text-3xl font-semibold">{latestOrder.id}</h2>
              <p className="mt-3 text-sm leading-6 text-emerald-900">
                Submitted {formatOrderDateTime(latestOrder.placedAt)} for{" "}
                {latestOrder.customer.fullName}. Payment was captured with{" "}
                {latestOrder.paymentLabel.toLowerCase()}.
              </p>
              <p className="mt-3 text-sm leading-6 text-emerald-900">
                {latestOrder.fulfillment === "pickup"
                  ? `Pickup window: ${latestOrder.pickupSlot ?? "To be confirmed"}`
                  : `Delivery address: ${latestOrder.deliveryAddress ?? "Pending"}`}
              </p>
            </div>

            <div className="rounded-[24px] bg-white/70 px-5 py-4 text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Charged total
              </p>
              <p className="mt-2 text-3xl font-semibold">
                {formatCurrency(latestOrder.total)}
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="mt-8 space-y-5">
        {orders.map((order) => (
          <article
            key={order.id}
            className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-semibold text-slate-900">{order.id}</h2>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                    {order.status}
                  </span>
                  {order.promoCode && (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-900">
                      {order.promoCode}
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm text-slate-500">
                  Placed {formatOrderDate(order.placedAt)} via {order.fulfillment}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {order.fulfillment === "pickup"
                    ? `Pickup window: ${order.pickupSlot ?? "To be confirmed"}`
                    : `Delivery address: ${order.deliveryAddress ?? "Pending"}`}
                </p>
                {order.deliveryInstructions && (
                  <p className="mt-2 text-sm text-slate-600">
                    Delivery notes: {order.deliveryInstructions}
                  </p>
                )}
                <p className="mt-2 text-sm text-slate-600">
                  Contact: {order.customer.fullName} · {order.customer.email} ·{" "}
                  {order.customer.phone}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Payment: {order.paymentLabel}
                </p>
              </div>

              <div className="rounded-[24px] bg-slate-50 px-5 py-4 text-right">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Order total
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {formatCurrency(order.total)}
                </p>
                <div className="mt-4 space-y-2 text-sm text-slate-500">
                  <div className="flex items-center justify-between gap-6">
                    <span>Subtotal</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex items-center justify-between gap-6 text-emerald-700">
                      <span>Savings</span>
                      <span>-{formatCurrency(order.discount)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-6">
                    <span>Tax</span>
                    <span>{formatCurrency(order.tax)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-6">
                    <span>{order.fulfillment === "pickup" ? "Pickup" : "Delivery"}</span>
                    <span>{formatCurrency(order.fulfillmentFee)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {order.items.map((item) => (
                <div
                  key={`${order.id}-${item.productId}`}
                  className="rounded-[22px] bg-slate-50 p-4"
                >
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-2 text-sm text-slate-500">
                    Qty {item.quantity} at {formatCurrency(item.unitPrice)}
                  </p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    {item.category}
                  </p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/products"
          className="rounded-full bg-mcneeseBlue px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
        >
          Continue shopping
        </Link>
        <Link
          to="/cart"
          className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Back to cart
        </Link>
      </section>
    </StorefrontLayout>
  );
}
