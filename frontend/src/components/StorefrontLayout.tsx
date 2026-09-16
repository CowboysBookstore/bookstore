import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  BookOpen,
  Heart,
  LogOut,
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  AUTH_CHANGED_EVENT,
  clearAuthTokens,
  isSignedIn,
} from "../storefront/client";
import { useStorefront } from "../storefront/StorefrontContext";

function CountBadge({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-mcneeseGold px-1 text-[11px] font-bold text-slate-950">
      {count}
    </span>
  );
}

function MainNavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `border-b-2 px-1 py-3 text-sm font-semibold transition-colors ${
          isActive
            ? "border-mcneeseBlue text-mcneeseBlue"
            : "border-transparent text-slate-600 hover:text-slate-950"
        }`
      }
    >
      {label}
    </NavLink>
  );
}

export default function StorefrontLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { cartCount, wishlistCount } = useStorefront();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [signedIn, setSignedIn] = useState(isSignedIn());

  useEffect(() => {
    const updateAuth = () => setSignedIn(isSignedIn());
    window.addEventListener(AUTH_CHANGED_EVENT, updateAuth);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, updateAuth);
  }, []);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    const query = search.trim();
    navigate(query ? `/products?q=${encodeURIComponent(query)}` : "/products");
    setMobileOpen(false);
  };

  const handleSignOut = () => {
    clearAuthTokens();
    setMobileOpen(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-950">
      <div className="bg-[#071b33] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 text-xs sm:px-6">
          <p className="font-medium">Free campus pickup on every order</p>
          <p className="hidden text-slate-300 sm:block">
            Monday-Friday · 8:00 AM-5:00 PM
          </p>
        </div>
      </div>

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex min-h-20 items-center gap-4">
            <Link to="/" className="flex shrink-0 items-center gap-3 no-underline">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-mcneeseBlue text-white shadow-sm">
                <BookOpen size={21} strokeWidth={2.2} aria-hidden="true" />
              </span>
              <span className="hidden sm:block">
                <span className="block text-base font-bold text-[#071b33]">
                  Cowboy Bookstore
                </span>
                <span className="block text-xs text-slate-500">
                  McNeese student shop
                </span>
              </span>
            </Link>

            <form
              onSubmit={handleSearch}
              className="relative mx-auto hidden w-full max-w-md md:block"
              role="search"
            >
              <label htmlFor="site-search" className="sr-only">
                Search the bookstore
              </label>
              <Search
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                id="site-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search books, courses, supplies..."
                className="h-11 w-full rounded-lg border border-slate-300 bg-slate-50 pl-10 pr-4 text-sm transition focus:border-mcneeseBlue focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </form>

            <div className="ml-auto flex items-center gap-1 sm:gap-2">
              <Link
                to="/wishlist"
                className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-mcneeseBlue"
                aria-label="Open wishlist"
                title="Wishlist"
              >
                <Heart size={20} aria-hidden="true" />
                <CountBadge count={wishlistCount} />
              </Link>
              <Link
                to="/cart"
                className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-mcneeseBlue"
                aria-label="Open cart"
                title="Cart"
              >
                <ShoppingBag size={20} aria-hidden="true" />
                <CountBadge count={cartCount} />
              </Link>
              {signedIn ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="hidden h-10 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 lg:inline-flex"
                >
                  <LogOut size={17} aria-hidden="true" />
                  Sign out
                </button>
              ) : (
                <Link
                  to="/login"
                  className="hidden h-10 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 lg:inline-flex"
                >
                  <UserRound size={17} aria-hidden="true" />
                  Sign in
                </Link>
              )}
              <button
                type="button"
                onClick={() => setMobileOpen((current) => !current)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 transition hover:bg-slate-100 md:hidden"
                aria-expanded={mobileOpen}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
              >
                {mobileOpen ? <X size={21} /> : <Menu size={21} />}
              </button>
            </div>
          </div>

          <nav className="hidden items-center gap-7 border-t border-slate-100 md:flex" aria-label="Main navigation">
            <MainNavItem to="/" label="Home" />
            <MainNavItem to="/products" label="Shop all" />
            <MainNavItem to="/checkout" label="Checkout" />
            <MainNavItem to="/orders" label="Orders" />
          </nav>

          {mobileOpen && (
            <div className="border-t border-slate-200 py-4 md:hidden">
              <form onSubmit={handleSearch} className="relative mb-4" role="search">
                <label htmlFor="mobile-search" className="sr-only">
                  Search the bookstore
                </label>
                <Search
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="mobile-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search the store"
                  className="h-11 w-full rounded-lg border border-slate-300 bg-slate-50 pl-10 pr-4 text-sm focus:border-mcneeseBlue focus:ring-2 focus:ring-blue-100"
                />
              </form>
              <div className="grid gap-1">
                {[
                  ["/", "Home"],
                  ["/products", "Shop all"],
                  ["/checkout", "Checkout"],
                  ["/orders", "Orders"],
                ].map(([to, label]) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    {label}
                  </Link>
                ))}
                {signedIn ? (
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex items-center gap-2 rounded-lg px-3 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <LogOut size={17} /> Sign out
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <UserRound size={17} /> Sign in
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>

      <footer className="mt-12 border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-mcneeseBlue text-white">
                <BookOpen size={19} aria-hidden="true" />
              </span>
              <p className="font-bold text-[#071b33]">Cowboy Bookstore</p>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-600">
              Textbooks, study supplies, technology, and campus gear for the
              semester ahead.
            </p>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Shop</p>
            <div className="mt-3 grid gap-2 text-sm text-slate-600">
              <Link to="/products">All products</Link>
              <Link to="/wishlist">Wishlist</Link>
              <Link to="/cart">Cart</Link>
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Store hours</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Monday-Friday<br />8:00 AM-5:00 PM
            </p>
          </div>
        </div>
        <div className="border-t border-slate-100 px-4 py-4 text-center text-xs text-slate-500">
          © 2026 Cowboy Bookstore · Built for McNeese students
        </div>
      </footer>
    </div>
  );
}
