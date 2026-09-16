import {
  ArrowRight,
  BookMarked,
  Headphones,
  MapPin,
  PackageCheck,
  PenTool,
  ShieldCheck,
  Shirt,
} from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import StorefrontLayout from "../components/StorefrontLayout";
import { useStorefront } from "../storefront/StorefrontContext";

const categories = [
  {
    label: "Textbooks",
    detail: "Course books and lab manuals",
    icon: BookMarked,
    color: "bg-blue-50 text-blue-700",
  },
  {
    label: "Office Supplies",
    detail: "Notebooks, pens, and planners",
    icon: PenTool,
    color: "bg-amber-50 text-amber-800",
  },
  {
    label: "Tech Accessories",
    detail: "Chargers, audio, and desk gear",
    icon: Headphones,
    color: "bg-cyan-50 text-cyan-800",
  },
  {
    label: "McNeese Gear",
    detail: "Campus apparel and everyday gear",
    icon: Shirt,
    color: "bg-rose-50 text-rose-800",
  },
];

export default function HomePage() {
  const { products } = useStorefront();
  const featuredProducts = products.slice(0, 4);

  return (
    <StorefrontLayout>
      <section
        className="relative min-h-[470px] overflow-hidden rounded-lg bg-slate-900 bg-cover bg-center shadow-sm"
        style={{ backgroundImage: "url('/storefront-hero.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#06172d]/95 via-[#06172d]/78 to-[#06172d]/10" />
        <div className="relative flex min-h-[470px] max-w-2xl flex-col justify-center px-6 py-12 text-white sm:px-10 lg:px-14">
          <p className="text-sm font-bold uppercase text-mcneeseGold">
            Ready for the semester
          </p>
          <h1 className="mt-4 max-w-xl text-4xl font-bold leading-tight">
            Everything you need, without the campus runaround.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-200">
            Find course materials, study supplies, tech essentials, and Cowboy
            gear in one place. Send an order request with your preferred pickup
            or delivery details.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-lg bg-mcneeseGold px-5 py-3 text-sm font-bold text-[#071b33] transition hover:bg-yellow-300"
            >
              Shop all products
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link
              to="/products?q=textbook"
              className="inline-flex items-center gap-2 rounded-lg border border-white/45 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
            >
              Find textbooks
            </Link>
          </div>
          <p className="mt-8 text-sm font-medium text-slate-200">
            {products.length} products in the current catalog · Free campus pickup
          </p>
        </div>
      </section>

      <section className="grid border-x border-b border-slate-200 bg-white md:grid-cols-3" aria-label="Store benefits">
        {[
          {
            icon: MapPin,
            title: "Pickup on campus",
            detail: "Choose a convenient store window at checkout.",
          },
          {
            icon: PackageCheck,
            title: "Keep your orders together",
            detail: "Find submitted requests and their current status in Orders.",
          },
          {
            icon: ShieldCheck,
            title: "Student account access",
            detail: "Sign in with a McNeese email to keep orders together.",
          },
        ].map(({ icon: Icon, title, detail }) => (
          <div
            key={title}
            className="flex gap-4 border-b border-slate-200 px-6 py-5 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0"
          >
            <Icon className="mt-0.5 shrink-0 text-mcneeseBlue" size={22} />
            <div>
              <p className="text-sm font-bold text-slate-900">{title}</p>
              <p className="mt-1 text-sm leading-5 text-slate-500">{detail}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="py-12" aria-labelledby="category-title">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-mcneeseBlue">Shop by category</p>
            <h2 id="category-title" className="mt-1 text-2xl font-bold text-[#071b33]">
              Start with what is on your list
            </h2>
          </div>
          <Link
            to="/products"
            className="hidden items-center gap-2 text-sm font-bold text-mcneeseBlue hover:text-blue-800 sm:inline-flex"
          >
            View everything <ArrowRight size={16} />
          </Link>
        </div>

        <div className="mt-6 grid gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map(({ label, detail, icon: Icon, color }) => (
            <Link
              key={label}
              to={`/products?category=${encodeURIComponent(label)}`}
              className="group flex min-h-40 flex-col justify-between bg-white p-5 transition hover:bg-slate-50"
            >
              <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
                <Icon size={20} aria-hidden="true" />
              </span>
              <span>
                <span className="block font-bold text-slate-900 group-hover:text-mcneeseBlue">
                  {label}
                </span>
                <span className="mt-1 block text-sm leading-5 text-slate-500">
                  {detail}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 py-12" aria-labelledby="featured-title">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold text-mcneeseBlue">Popular right now</p>
            <h2 id="featured-title" className="mt-1 text-2xl font-bold text-[#071b33]">
              Semester essentials students reach for first
            </h2>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sm font-bold text-mcneeseBlue hover:text-blue-800"
          >
            Shop the catalog <ArrowRight size={16} />
          </Link>
        </div>

        <div className="mt-6 grid items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="grid overflow-hidden rounded-lg border border-slate-200 bg-white md:grid-cols-[0.8fr_1.2fr]">
        <div className="bg-mcneeseBlue px-6 py-8 text-white sm:px-8">
          <p className="text-sm font-bold text-blue-100">Campus pickup</p>
          <h2 className="mt-2 text-2xl font-bold">Request pickup between classes.</h2>
          <p className="mt-3 text-sm leading-6 text-blue-100">
            Pickup is free. Choose a preferred time when you send your request;
            the store still needs to confirm it.
          </p>
        </div>
        <div className="grid gap-px bg-slate-200 sm:grid-cols-3">
          {[
            ["01", "Add your essentials"],
            ["02", "Choose a preferred time"],
            ["03", "Wait for confirmation"],
          ].map(([number, label]) => (
            <div key={number} className="bg-white px-6 py-8">
              <p className="text-sm font-bold text-amber-600">{number}</p>
              <p className="mt-5 font-bold text-slate-900">{label}</p>
            </div>
          ))}
        </div>
      </section>
    </StorefrontLayout>
  );
}
