import { Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import StorefrontLayout from "../components/StorefrontLayout";
import { storefrontCategories } from "../storefront/data";
import { useStorefront } from "../storefront/StorefrontContext";

type CategoryFilter = (typeof storefrontCategories)[number];

export default function ProductsPage() {
  const { products } = useStorefront();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedCategory = searchParams.get("category") || "All";
  const initialCategory = storefrontCategories.includes(
    requestedCategory as CategoryFilter,
  )
    ? (requestedCategory as CategoryFilter)
    : "All";
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState<CategoryFilter>(initialCategory);
  const [sort, setSort] = useState("featured");

  const filteredProducts = useMemo(
    () =>
      products
        .filter((product) => {
          const matchesCategory =
            category === "All" || product.category === category;
          const search = query.trim().toLowerCase();
          const matchesQuery =
            !search ||
            [
              product.title,
              product.category,
              product.course ?? "",
              product.description,
              ...product.highlights,
            ]
              .join(" ")
              .toLowerCase()
              .includes(search);
          return matchesCategory && matchesQuery;
        })
        .sort((left, right) => {
          if (sort === "price-low") return left.price - right.price;
          if (sort === "price-high") return right.price - left.price;
          if (sort === "rating") return right.rating - left.rating;
          return 0;
        }),
    [category, products, query, sort],
  );

  const chooseCategory = (nextCategory: CategoryFilter) => {
    setCategory(nextCategory);
    const next = new URLSearchParams(searchParams);
    if (nextCategory === "All") next.delete("category");
    else next.set("category", nextCategory);
    setSearchParams(next, { replace: true });
  };

  const clearFilters = () => {
    setQuery("");
    setCategory("All");
    setSort("featured");
    setSearchParams({}, { replace: true });
  };

  return (
    <StorefrontLayout>
      <section className="border-b border-slate-200 pb-7">
        <p className="text-sm font-bold text-mcneeseBlue">Shop the catalog</p>
        <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#071b33]">Find what you need</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Search by course, product, or category. Pickup is free, and stock
              counts update as orders are placed.
            </p>
          </div>
          <p className="text-sm font-semibold text-slate-500">
            {filteredProducts.length} of {products.length} products
          </p>
        </div>
      </section>

      <section className="sticky top-[121px] z-20 -mx-4 border-b border-slate-200 bg-[#f7f8fa]/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 md:top-[129px]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative block flex-1">
            <span className="sr-only">Search products</span>
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title, course, or item..."
              className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 text-sm focus:border-mcneeseBlue focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <div className="flex items-center gap-2">
            <SlidersHorizontal size={17} className="hidden text-slate-400 sm:block" />
            <label className="sr-only" htmlFor="catalog-sort">
              Sort products
            </label>
            <select
              id="catalog-sort"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="h-11 min-w-44 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 focus:border-mcneeseBlue focus:ring-2 focus:ring-blue-100"
            >
              <option value="featured">Featured first</option>
              <option value="price-low">Lowest price</option>
              <option value="price-high">Highest price</option>
              <option value="rating">Highest rated</option>
            </select>
          </div>
        </div>

        <div className="mx-auto mt-3 flex max-w-7xl gap-2 overflow-x-auto pb-1">
          {storefrontCategories.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => chooseCategory(option)}
              className={`shrink-0 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                category === option
                  ? "border-mcneeseBlue bg-mcneeseBlue text-white"
                  : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
              }`}
            >
              {option}
            </button>
          ))}
          {(query || category !== "All" || sort !== "featured") && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-white hover:text-slate-900"
            >
              <X size={15} /> Clear
            </button>
          )}
        </div>
      </section>

      {filteredProducts.length > 0 ? (
        <section className="mt-7 grid items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </section>
      ) : (
        <section className="mt-12 border-y border-slate-200 py-14 text-center">
          <h2 className="text-2xl font-bold text-slate-900">No matching products</h2>
          <p className="mt-2 text-sm text-slate-500">
            Try a shorter search or clear the category filter.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-5 rounded-lg bg-mcneeseBlue px-5 py-3 text-sm font-bold text-white hover:bg-blue-800"
          >
            Show the full catalog
          </button>
        </section>
      )}
    </StorefrontLayout>
  );
}
