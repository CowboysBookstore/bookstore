import { useState } from "react";
import ProductCard from "../components/ProductCard";
import StorefrontLayout from "../components/StorefrontLayout";
import { storefrontCategories } from "../storefront/data";
import { useStorefront } from "../storefront/StorefrontContext";

type CategoryFilter = (typeof storefrontCategories)[number];

export default function ProductsPage() {
  const { products } = useStorefront();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [sort, setSort] = useState("featured");

  const filteredProducts = products
    .filter((product) => {
      const matchesCategory =
        category === "All" ? true : product.category === category;
      const search = query.trim().toLowerCase();
      const matchesQuery =
        search === ""
          ? true
          : [
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
      if (sort === "price-low") {
        return left.price - right.price;
      }

      if (sort === "price-high") {
        return right.price - left.price;
      }

      if (sort === "rating") {
        return right.rating - left.rating;
      }

      return 0;
    });

  return (
    <StorefrontLayout>
      <section className="animate-rise rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-mcneeseBlue">
              Search page
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-slate-900">
              Search the shelves
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Browse textbooks, office supplies, tech accessories, and McNeese gear.
              This page is mock-data driven so the UI can be reviewed before product
              APIs are connected.
            </p>
          </div>

          <div className="rounded-[28px] bg-slate-50 p-5">
            <div className="grid gap-4 md:grid-cols-[1fr_190px_160px]">
              <label className="block text-sm font-medium text-slate-700">
                Search
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Try calculus, planner, hoodie..."
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm transition focus:border-mcneeseBlue focus:ring-2 focus:ring-mcneeseBlue/10"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Category
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value as CategoryFilter)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm transition focus:border-mcneeseBlue focus:ring-2 focus:ring-mcneeseBlue/10"
                >
                  {storefrontCategories.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Sort
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm transition focus:border-mcneeseBlue focus:ring-2 focus:ring-mcneeseBlue/10"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: low to high</option>
                  <option value="price-high">Price: high to low</option>
                  <option value="rating">Highest rated</option>
                </select>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {storefrontCategories.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setCategory(option)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                category === option
                  ? "bg-mcneeseBlue text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {option}
            </button>
          ))}
          <p className="ml-auto text-sm text-slate-500">
            {filteredProducts.length} result{filteredProducts.length === 1 ? "" : "s"}
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </section>

      {filteredProducts.length === 0 && (
        <section className="mt-8 rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-10 text-center shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">No products found</h2>
          <p className="mt-3 text-sm text-slate-500">
            Try a different keyword or switch the category filter back to All.
          </p>
        </section>
      )}
    </StorefrontLayout>
  );
}
