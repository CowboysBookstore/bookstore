import { Link, useLocation } from "react-router-dom";
import StorefrontLayout from "../components/StorefrontLayout";
import { formatCurrency, formatOrderDate } from "../storefront/data";
import { useStorefront } from "../storefront/StorefrontContext";

export default function OrdersPage() {
  const location = useLocation();
  const { orders } = useStorefront();
  const latestOrderId = (location.state as { orderId?: string } | null)?.orderId;

  return (
    <StorefrontLayout>
      <section className="animate-rise rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-mcneeseBlue">
          Orders page
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-900">Recent orders</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
          This page gives the storefront a simple post-checkout destination where
          students can confirm their latest order and scan past activity.
        </p>
      </section>

      {latestOrderId && (
        <section className="mt-8 rounded-[28px] border border-emerald-200 bg-emerald-50 px-6 py-5 text-emerald-900 shadow-sm">
          Order {latestOrderId} was created successfully. The UI routed here after
          checkout so the student gets a clear confirmation state.
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
                </div>
                <p className="mt-3 text-sm text-slate-500">
                  Placed {formatOrderDate(order.placedAt)} via {order.fulfillment}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {order.fulfillment === "pickup"
                    ? `Pickup window: ${order.pickupSlot ?? "To be confirmed"}`
                    : `Delivery address: ${order.deliveryAddress ?? "Pending"}`}
                </p>
              </div>

              <div className="rounded-[24px] bg-slate-50 px-5 py-4 text-right">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Order total
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {formatCurrency(order.total)}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {order.items.map((item) => (
                <div key={`${order.id}-${item.productId}`} className="rounded-[22px] bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-2 text-sm text-slate-500">
                    Qty {item.quantity} at {formatCurrency(item.unitPrice)}
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
