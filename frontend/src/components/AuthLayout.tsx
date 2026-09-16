import { BookOpen, CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface Props {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export default function AuthLayout({ children, title, subtitle }: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f7f8fa]">
      <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Link to="/" className="inline-flex items-center gap-3 no-underline">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-mcneeseBlue text-white">
              <BookOpen size={21} aria-hidden="true" />
            </span>
            <span>
              <span className="block font-bold text-[#071b33]">Cowboy Bookstore</span>
              <span className="block text-xs text-slate-500">McNeese student shop</span>
            </span>
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 items-center px-4 py-8 sm:px-6 sm:py-12">
        <div className="grid w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:grid-cols-[0.9fr_1.1fr]">
          <section
            className="relative hidden min-h-[620px] bg-cover bg-center lg:block"
            style={{ backgroundImage: "url('/storefront-hero.png')" }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#06172d]/95 via-[#06172d]/55 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-9 text-white">
              <p className="text-sm font-bold text-mcneeseGold">Your student account</p>
              <h2 className="mt-2 text-2xl font-bold">
                Keep checkout and order details together.
              </h2>
              <div className="mt-5 grid gap-3 text-sm text-slate-200">
                {["Faster checkout", "Order history", "McNeese email access"].map(
                  (item) => (
                    <p key={item} className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-mcneeseGold" />
                      {item}
                    </p>
                  ),
                )}
              </div>
            </div>
          </section>

          <section className="flex items-center px-6 py-10 sm:px-10 lg:px-14">
            <div className="mx-auto w-full max-w-md">
              <p className="text-sm font-bold text-mcneeseBlue">Cowboy Bookstore account</p>
              <h1 className="mt-2 text-3xl font-bold text-[#071b33]">{title}</h1>
              {subtitle && (
                <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
              )}
              <div className="mt-7">{children}</div>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white px-6 py-4 text-center text-xs text-slate-500">
        © 2026 Cowboy Bookstore · McNeese student shop
      </footer>
    </div>
  );
}
