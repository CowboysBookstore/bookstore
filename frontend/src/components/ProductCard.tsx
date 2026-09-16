import { ArrowUpRight, Heart, ShoppingCart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useStorefront } from "../storefront/StorefrontContext";
import type { Product } from "../storefront/types";
import { formatCurrency } from "../storefront/utils";
import ProductImage from "./ProductImage";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, wishlist, cart } = useStorefront();
  const isWishlisted = wishlist.some((item) => item.productId === product.id);
  const cartQuantity =
    cart.find((item) => item.productId === product.id)?.quantity ?? 0;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <div className="relative">
        <Link to={`/products/${product.id}`} aria-label={`View ${product.title}`}>
          <ProductImage
            product={product}
            className="h-52 bg-slate-100"
            imageClassName="transition duration-300 group-hover:scale-[1.02]"
            overlayClassName="bg-transparent"
          />
        </Link>
        <span className="absolute left-3 top-3 rounded-md bg-white/95 px-2.5 py-1 text-xs font-bold text-slate-700 shadow-sm">
          {product.category}
        </span>
        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          aria-pressed={isWishlisted}
          aria-label={isWishlisted ? `Remove ${product.title} from wishlist` : `Save ${product.title} to wishlist`}
          title={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg border shadow-sm transition ${
            isWishlisted
              ? "border-rose-200 bg-rose-50 text-rose-600"
              : "border-white bg-white/95 text-slate-600 hover:text-rose-600"
          }`}
        >
          <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="font-bold text-amber-700">{product.badge}</span>
          <span className="inline-flex items-center gap-1 font-semibold text-slate-500">
            <Star size={14} className="fill-amber-400 text-amber-400" />
            {product.rating.toFixed(1)}
          </span>
        </div>

        <Link to={`/products/${product.id}`} className="mt-3 no-underline">
          <h3 className="text-lg font-bold leading-6 text-[#071b33] transition group-hover:text-mcneeseBlue">
            {product.title}
          </h3>
        </Link>
        <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-600">
          {product.shortDescription}
        </p>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xl font-bold text-slate-950">
              {formatCurrency(product.price)}
            </p>
            <p className="mt-1 text-xs font-medium text-emerald-700">
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </p>
          </div>
          <Link
            to={`/products/${product.id}`}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-mcneeseBlue"
            aria-label={`Open details for ${product.title}`}
            title="View details"
          >
            <ArrowUpRight size={18} />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => addToCart(product.id)}
          disabled={product.stock === 0}
          className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-mcneeseBlue px-4 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <ShoppingCart size={17} aria-hidden="true" />
          {cartQuantity > 0 ? `Add another · ${cartQuantity} in cart` : "Add to cart"}
        </button>
      </div>
    </article>
  );
}
