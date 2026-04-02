import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useStorefront } from "../storefront/StorefrontContext";

function BookIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-mcneeseBlue"
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}

function CountPill({ count }: { count: number }) {
  if (count === 0) {
    return null;
  }

  return (
    <span className="rounded-full bg-mcneeseGold px-2 py-0.5 text-xs font-semibold text-slate-900">
      {count}
    </span>
  );
}

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-full px-3 py-2 text-sm font-medium transition ${
          isActive
            ? "bg-mcneeseBlue text-white shadow-sm"
            : "text-slate-600 hover:bg-white hover:text-slate-900"
        }`
      }
    >
      {label}
    </NavLink>
  );
}

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const { cartCount, wishlistCount } = useStorefront();
  const isLoggedIn =
    typeof window !== "undefined" && Boolean(window.sessionStorage.getItem("access"));

  const handleSignOut = () => {
    window.sessionStorage.removeItem("access");
    window.sessionStorage.removeItem("refresh");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-900">
      <div className="border-b border-slate-200/70 bg-white/75 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3 text-sm text-slate-600">
          <p className="font-medium">
            Built for McNeese students: browse books, gear, and checkout options in one place.
          </p>
          <div className="hidden gap-2 md:flex">
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
              Campus pickup
            </span>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-900">
              Secure checkout
            </span>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-3 no-underline">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                <BookIcon />
              </span>
              <div>
                <p className="text-lg font-semibold text-slate-900">
                  Cowboy Bookstore
                </p>
                <p className="text-sm text-slate-500">McNeese online storefront</p>
              </div>
            </Link>

            <div className="flex items-center gap-2 lg:hidden">
              <NavLink
                to="/wishlist"
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-mcneeseBlue text-white shadow-sm"
                      : "border border-slate-200 text-slate-700 hover:bg-white hover:text-slate-900"
                  }`
                }
              >
                Wishlist
                <CountPill count={wishlistCount} />
              </NavLink>
              <NavLink
                to="/cart"
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "bg-blue-800 text-white shadow-sm"
                      : "bg-mcneeseBlue text-white"
                  }`
                }
              >
                Cart
                <CountPill count={cartCount} />
              </NavLink>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-2 justify-center">
            <NavItem to="/" label="Home" />
            <NavItem to="/products" label="Products" />
            <NavItem to="/checkout" label="Checkout" />
            <NavItem to="/orders" label="Orders" />
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <NavLink
              to="/wishlist"
              className={({ isActive }) =>
                `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-mcneeseBlue text-white shadow-sm"
                    : "border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`
              }
            >
              Wishlist
              <CountPill count={wishlistCount} />
            </NavLink>
            <NavLink
              to="/cart"
              className={({ isActive }) =>
                `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-blue-800 text-white shadow-sm"
                    : "bg-mcneeseBlue text-white shadow-sm"
                }`
              }
            >
              Cart
              <CountPill count={cartCount} />
            </NavLink>
            {isLoggedIn ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Sign out
              </button>
            ) : (
              <Link
                to="/login"
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-6 py-8">{children}</main>

      <footer className="border-t border-slate-200/70 bg-white/75">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>Copyright 2026 McNeese State University - Cowboy Bookstore</p>
          <p>Responsive storefront for search, cart, wishlist, and checkout flows.</p>
        </div>
      </footer>
    </div>
  );
}
